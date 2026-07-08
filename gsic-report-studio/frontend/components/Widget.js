// One dashboard section. Resolves its own table + fields from the widget
// config, loads records, and renders by type. In edit mode a settings strip
// appears so builders configure each section independently.

import React, {useState} from 'react';
import {useBase, useRecords} from '@airtable/blocks/interface/ui';
import KpiCards from './KpiCards';
import GroupBars from './GroupBars';
import {CompositionDonut, TrendChart} from './Charts';
import RecordsTable from './RecordsTable';
import {useReportData} from '../lib/useReportData';
import {GROUPABLE_TYPES, DATE_TYPES, isNumericField} from '../lib/fieldTypes';
import {DATE_RANGES} from '../lib/aggregate';

export const WIDGET_TYPES = [
    {type: 'kpis', label: 'KPI cards'},
    {type: 'bars', label: 'Bar breakdown'},
    {type: 'donut', label: 'Donut'},
    {type: 'trend', label: 'Trend line'},
    {type: 'table', label: 'Records table'},
];

function defaultTitle(widget, {table, groupField, dateField}) {
    switch (widget.type) {
        case 'bars': return groupField ? `By ${groupField.name}` : 'Breakdown';
        case 'donut': return groupField ? `${groupField.name} composition` : 'Composition';
        case 'trend': return dateField ? `Monthly trend · ${dateField.name}` : 'Monthly trend';
        case 'table': return table ? table.name : 'Records';
        default: return '';
    }
}

function Select({label, value, options, onChange, allowNone = true}) {
    return (
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gsic-purple dark:text-gsic-purpleLight">
            {label}
            <select
                value={value ?? ''}
                onChange={e => onChange(e.target.value || null)}
                className="px-1.5 py-1 rounded-md border border-gsic-lineDark dark:border-gsic-nightLine bg-white dark:bg-gsic-night text-xs text-black dark:text-white font-medium max-w-[150px]"
            >
                {allowNone && <option value="">None</option>}
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function SettingsStrip({widget, base, table, onUpdate, onRemove, onMove}) {
    const tableOptions = base.tables.map(t => ({value: t.id, label: t.name}));
    const fieldOptions = predicate =>
        (table?.fields ?? []).filter(predicate).map(f => ({value: f.id, label: f.name}));

    return (
        <div className="no-print -mx-5 -mt-5 mb-4 px-4 py-2.5 bg-gsic-cream dark:bg-gsic-nightCard border-b border-gsic-line dark:border-gsic-nightLine rounded-t-xl flex items-center gap-3 flex-wrap">
            <Select
                label="Table"
                value={widget.tableId}
                options={tableOptions}
                allowNone={false}
                onChange={tableId => onUpdate({tableId, groupFieldId: null, dateFieldId: null, valueFieldId: null})}
            />
            {widget.type !== 'trend' && (
                <Select
                    label="Group"
                    value={widget.groupFieldId}
                    options={fieldOptions(f => GROUPABLE_TYPES.has(f.type))}
                    onChange={groupFieldId => onUpdate({groupFieldId})}
                />
            )}
            <Select
                label="Date"
                value={widget.dateFieldId}
                options={fieldOptions(f => DATE_TYPES.has(f.type))}
                onChange={dateFieldId => onUpdate({dateFieldId})}
            />
            {widget.type !== 'table' && (
                <Select
                    label="Measure"
                    value={widget.measure === 'sum' ? widget.valueFieldId : ''}
                    options={fieldOptions(isNumericField)}
                    onChange={valueFieldId =>
                        onUpdate(valueFieldId ? {valueFieldId, measure: 'sum'} : {measure: 'count'})
                    }
                />
            )}
            <input
                value={widget.title}
                onChange={e => onUpdate({title: e.target.value})}
                placeholder="Custom title…"
                className="px-2 py-1 rounded-md border border-gsic-lineDark dark:border-gsic-nightLine bg-white dark:bg-gsic-night text-xs w-32 text-black dark:text-white"
            />
            <div className="ml-auto flex items-center gap-1">
                <button title="Move up" onClick={() => onMove(-1)} className="w-6 h-6 rounded-md border border-gsic-lineDark dark:border-gsic-nightLine text-xs hover:border-gsic-green text-black dark:text-white">↑</button>
                <button title="Move down" onClick={() => onMove(1)} className="w-6 h-6 rounded-md border border-gsic-lineDark dark:border-gsic-nightLine text-xs hover:border-gsic-green text-black dark:text-white">↓</button>
                <button
                    title="Toggle width"
                    onClick={() => onUpdate({width: widget.width === 'full' ? 'half' : 'full'})}
                    className="px-1.5 h-6 rounded-md border border-gsic-lineDark dark:border-gsic-nightLine text-[10px] font-bold uppercase hover:border-gsic-green text-black dark:text-white"
                >
                    {widget.width === 'full' ? '½' : '1/1'}
                </button>
                <button title="Remove section" onClick={onRemove} className="w-6 h-6 rounded-md border border-gsic-lineDark dark:border-gsic-nightLine text-xs hover:border-gsic-orange hover:text-gsic-orange text-black dark:text-white">✕</button>
            </div>
        </div>
    );
}

export default function Widget({widget, rangeKey, selection, onSelect, isBuilder, onUpdate, onRemove, onMove}) {
    const base = useBase();
    const table = widget.tableId ? base.getTableByIdIfExists(widget.tableId) : null;
    const records = useRecords(table);

    const groupField = table && widget.groupFieldId ? table.getFieldByIdIfExists(widget.groupFieldId) : null;
    const dateField = table && widget.dateFieldId ? table.getFieldByIdIfExists(widget.dateFieldId) : null;
    const valueField = table && widget.valueFieldId ? table.getFieldByIdIfExists(widget.valueFieldId) : null;

    const data = useReportData(records, groupField, dateField, valueField, rangeKey);

    const showValues = widget.measure === 'sum' && !!valueField;
    // Cross-filtering only links widgets grouped by the same field.
    const selectedGroup = selection && selection.fieldId === widget.groupFieldId ? selection.name : null;
    const select = name => onSelect(name ? {fieldId: widget.groupFieldId, name} : null);

    const title = widget.title || defaultTitle(widget, {table, groupField, dateField});
    const rangeLabel = DATE_RANGES.find(r => r.key === rangeKey)?.label;

    let body;
    if (!table) {
        body = <Placeholder>Pick a table for this section{isBuilder ? ' above' : ''}.</Placeholder>;
    } else if (!data) {
        body = <Placeholder>Loading…</Placeholder>;
    } else {
        switch (widget.type) {
            case 'kpis':
                body = <KpiCards data={data} valueField={showValues ? valueField : null} groupField={groupField} rangeLabel={rangeLabel} />;
                break;
            case 'bars':
                body = groupField
                    ? <GroupBars groups={data.groups} selectedGroup={selectedGroup} onSelect={select} showValues={showValues} currencySymbol={data.currencySymbol} />
                    : <Placeholder>Pick a Group field.</Placeholder>;
                break;
            case 'donut':
                body = groupField
                    ? <CompositionDonut groups={data.groups} selectedGroup={selectedGroup} onSelect={select} />
                    : <Placeholder>Pick a Group field.</Placeholder>;
                break;
            case 'trend':
                body = dateField
                    ? (data.trend.length >= 2
                        ? <TrendChart trend={data.trend} showValues={showValues} currencySymbol={data.currencySymbol} />
                        : <Placeholder>Not enough dated records yet.</Placeholder>)
                    : <Placeholder>Pick a Date field.</Placeholder>;
                break;
            case 'table':
                body = (
                    <RecordsTable
                        table={table}
                        rows={data.rows}
                        groupField={groupField}
                        dateField={dateField}
                        valueField={valueField}
                        selectedGroup={selectedGroup}
                    />
                );
                break;
            default:
                body = null;
        }
    }

    // KPI cards render bare (no card chrome) unless being edited.
    const bare = widget.type === 'kpis' && !isBuilder;
    if (bare) return body;

    return (
        <section className="bg-white dark:bg-gsic-night border border-gsic-line dark:border-gsic-nightLine rounded-xl p-5 shadow-gsic print-break-avoid flex flex-col">
            {isBuilder && (
                <SettingsStrip widget={widget} base={base} table={table} onUpdate={onUpdate} onRemove={onRemove} onMove={onMove} />
            )}
            {title && widget.type !== 'kpis' && (
                <h2 className="text-sm font-bold text-gsic-purple dark:text-gsic-purpleLight uppercase tracking-[0.06em] mt-0 mb-4">
                    {title}
                    {selectedGroup && widget.type === 'table' && (
                        <button
                            onClick={() => onSelect(null)}
                            className="no-print ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gsic-greenLight text-gsic-green hover:bg-gsic-green hover:text-white transition-colors normal-case"
                        >
                            {selectedGroup} ✕
                        </button>
                    )}
                </h2>
            )}
            <div className="flex-1 min-h-0">{body}</div>
        </section>
    );
}

function Placeholder({children}) {
    return <div className="py-8 text-center text-sm text-gray-400">{children}</div>;
}
