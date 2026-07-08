// Dashboard widget list, persisted in GlobalConfig so it syncs to all viewers.
// Each widget is a plain JSON object:
//   {id, type: 'kpis'|'bars'|'donut'|'trend'|'table',
//    tableId, groupFieldId, dateFieldId, valueFieldId,
//    measure: 'count'|'sum', title: '', width: 'full'|'half'}
//
// Until a builder customizes anything, a default layout derived from the
// properties-panel table is shown (and only persisted on first edit).

import {useCallback} from 'react';
import {useGlobalConfig} from '@airtable/blocks/interface/ui';
import {autoDetect} from './fieldTypes';

const KEY = ['reportStudio', 'widgets'];

function widgetBase(table) {
    const detected = autoDetect(table);
    return {
        tableId: table?.id ?? null,
        groupFieldId: detected.groupField?.id ?? null,
        dateFieldId: detected.dateField?.id ?? null,
        valueFieldId: detected.valueField?.id ?? null,
        measure: 'count',
        title: '',
    };
}

export function defaultWidgets(table) {
    if (!table) return [];
    const base = widgetBase(table);
    return [
        {id: 'default-kpis', type: 'kpis', width: 'full', ...base},
        {id: 'default-bars', type: 'bars', width: 'half', ...base},
        {id: 'default-donut', type: 'donut', width: 'half', ...base},
        {id: 'default-trend', type: 'trend', width: 'full', ...base},
        {id: 'default-table', type: 'table', width: 'full', ...base},
    ];
}

let idCounter = 0;

export function useWidgets(defaultTable) {
    const globalConfig = useGlobalConfig();
    const saved = globalConfig.get(KEY);
    const widgets = Array.isArray(saved) && saved.length > 0 ? saved : defaultWidgets(defaultTable);
    const canConfigure = globalConfig.hasPermissionToSet(KEY);

    const persist = useCallback(
        async next => {
            if (globalConfig.hasPermissionToSet(KEY)) await globalConfig.setAsync(KEY, next);
        },
        [globalConfig]
    );

    const addWidget = useCallback(
        (type, table) => {
            const widget = {
                id: `w-${Date.now()}-${idCounter++}`,
                type,
                width: type === 'kpis' || type === 'trend' || type === 'table' ? 'full' : 'half',
                ...widgetBase(table),
            };
            persist([...widgets, widget]);
        },
        [widgets, persist]
    );

    const updateWidget = useCallback(
        (id, patch) => persist(widgets.map(w => (w.id === id ? {...w, ...patch} : w))),
        [widgets, persist]
    );

    const removeWidget = useCallback(
        id => persist(widgets.filter(w => w.id !== id)),
        [widgets, persist]
    );

    const moveWidget = useCallback(
        (id, direction) => {
            const index = widgets.findIndex(w => w.id === id);
            const target = index + direction;
            if (index < 0 || target < 0 || target >= widgets.length) return;
            const next = [...widgets];
            [next[index], next[target]] = [next[target], next[index]];
            persist(next);
        },
        [widgets, persist]
    );

    return {widgets, canConfigure, addWidget, updateWidget, removeWidget, moveWidget};
}
