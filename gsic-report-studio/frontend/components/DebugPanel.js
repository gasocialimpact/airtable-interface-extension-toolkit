import React from 'react';

/**
 * Development aid — surfaces the #1 cause of blank widgets: tables/fields
 * not added as data sources in Interface Designer. Toggled by the
 * "Show debug panel" custom property.
 */
export default function DebugPanel({base, defaultTable, widgets}) {
    return (
        <div className="no-print bg-gsic-bg dark:bg-gsic-nightCard border border-gsic-lineDark dark:border-gsic-nightLine rounded-[10px] px-4 py-3 text-xs font-mono text-gray-700 dark:text-gray-300 space-y-1">
            <div className="font-bold text-black dark:text-white font-sans uppercase tracking-wider text-[10px]">Debug</div>
            <div>visible tables: {base.tables.map(t => `${t.name} (${t.fields.length} fields)`).join(', ') || 'NONE — add data sources in Interface Designer'}</div>
            <div>default table: {defaultTable ? defaultTable.name : 'not set'}</div>
            {widgets.map(w => {
                const table = w.tableId ? base.getTableByIdIfExists(w.tableId) : null;
                const missing = [];
                if (w.tableId && !table) missing.push('table');
                if (table) {
                    for (const [key, label] of [['groupFieldId', 'group'], ['dateFieldId', 'date'], ['valueFieldId', 'value']]) {
                        if (w[key] && !table.getFieldByIdIfExists(w[key])) missing.push(label);
                    }
                }
                return (
                    <div key={w.id}>
                        widget {w.type}: {table ? table.name : w.tableId ? 'TABLE NOT VISIBLE' : 'no table'}
                        {missing.length > 0 && ` — missing/hidden: ${missing.join(', ')}`}
                    </div>
                );
            })}
        </div>
    );
}
