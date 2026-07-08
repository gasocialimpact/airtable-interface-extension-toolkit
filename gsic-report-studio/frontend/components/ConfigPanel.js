import React from 'react';
import {GROUPABLE_TYPES, DATE_TYPES, isNumericField} from '../lib/useFieldSettings';

function FieldSelect({label, value, options, onChange, allowNone = true}) {
    return (
        <label className="flex flex-col gap-1 min-w-[160px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-gsic-purple dark:text-gsic-purpleLight">
                {label}
            </span>
            <select
                value={value?.id ?? ''}
                onChange={e => onChange(e.target.value || null)}
                className="px-2.5 py-1.5 rounded-lg border border-gsic-lineDark dark:border-gsic-nightLine bg-white dark:bg-gsic-nightCard text-[13px] text-black dark:text-white font-medium focus:outline-none focus:border-gsic-green"
            >
                {allowNone && <option value="">None</option>}
                {options.map(field => (
                    <option key={field.id} value={field.id}>
                        {field.name}
                    </option>
                ))}
            </select>
        </label>
    );
}

/**
 * In-app field configuration, shown only to builders (edit mode / dev mode).
 * Custom properties can't chain a field picker to the table picker, so field
 * choice happens here and persists to GlobalConfig per table.
 */
export default function ConfigPanel({table, groupField, dateField, valueField, setField}) {
    const fields = table.fields;
    const groupable = fields.filter(f => GROUPABLE_TYPES.has(f.type));
    const dateable = fields.filter(f => DATE_TYPES.has(f.type));
    const numeric = fields.filter(isNumericField);

    return (
        <div className="no-print bg-gsic-cream dark:bg-gsic-nightCard border-l-4 border-gsic-green rounded-r-[10px] px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.08em] text-black dark:text-white mb-3">
                Report setup — visible to builders only
            </div>
            <div className="flex gap-4 flex-wrap">
                <FieldSelect label="Group by" value={groupField} options={groupable} onChange={id => setField('groupFieldId', id)} />
                <FieldSelect label="Date field" value={dateField} options={dateable} onChange={id => setField('dateFieldId', id)} />
                <FieldSelect label="Value to sum" value={valueField} options={numeric} onChange={id => setField('valueFieldId', id)} />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 mb-0">
                Fields must be added as data sources for this extension in Interface Designer to appear here.
                Leave “Value to sum” as None to report record counts.
            </p>
        </div>
    );
}
