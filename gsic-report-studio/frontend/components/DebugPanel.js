import React from 'react';

/**
 * Development aid — surfaces the #1 cause of blank extensions: tables/fields
 * not added as data sources in Interface Designer. Toggled by the
 * "Show debug panel" custom property.
 */
export default function DebugPanel({table, records, groupField, dateField, valueField}) {
    return (
        <div className="no-print bg-gsic-bg dark:bg-gsic-nightCard border border-gsic-lineDark dark:border-gsic-nightLine rounded-[10px] px-4 py-3 text-xs font-mono text-gray-700 dark:text-gray-300 space-y-1">
            <div className="font-bold text-black dark:text-white font-sans uppercase tracking-wider text-[10px]">Debug</div>
            <div>table: {table ? `${table.name} (${table.id})` : 'NOT RESOLVED — pick one in the properties panel'}</div>
            <div>records: {records === null ? 'null (not loaded / table not a data source)' : records.length}</div>
            <div>groupField: {groupField ? `${groupField.name} [${groupField.type}]` : 'none'}</div>
            <div>dateField: {dateField ? `${dateField.name} [${dateField.type}]` : 'none'}</div>
            <div>valueField: {valueField ? `${valueField.name} [${valueField.type}]` : 'none'}</div>
            <div>
                visible fields:{' '}
                {table ? table.fields.map(f => f.name).join(', ') : '—'}
            </div>
        </div>
    );
}
