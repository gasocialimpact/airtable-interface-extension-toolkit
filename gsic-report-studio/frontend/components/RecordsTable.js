import React, {useState, useMemo} from 'react';
import {expandRecord, CellRenderer} from '@airtable/blocks/interface/ui';
import {formatNumber} from '../lib/aggregate';

const PAGE_SIZE = 25;

/**
 * Detail table in the GSIC .tbl style — purple uppercase headers, clean rows.
 * Rows open Airtable's native record detail. Renders group/date/value via
 * CellRenderer so every field type displays exactly as Airtable would.
 */
export default function RecordsTable({table, rows, groupField, dateField, valueField, selectedGroup}) {
    const [page, setPage] = useState(0);

    const visibleRows = useMemo(() => {
        const filtered = selectedGroup ? rows.filter(row => row.groupKey === selectedGroup) : rows;
        // Most recent first when we have dates
        return dateField ? [...filtered].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)) : filtered;
    }, [rows, selectedGroup, dateField]);

    const pageRows = visibleRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const pageCount = Math.ceil(visibleRows.length / PAGE_SIZE);
    const canExpand = table.hasPermissionToExpandRecords();
    const primaryField = table.fields.find(f => f.isPrimaryField);

    const fields = [groupField, dateField, valueField].filter(Boolean);
    const headerClass =
        'text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-gsic-purple dark:text-gsic-purpleLight border-b border-gsic-line dark:border-gsic-nightLine bg-gsic-bg dark:bg-gsic-nightCard';

    return (
        <div className="bg-white dark:bg-gsic-night border border-gsic-line dark:border-gsic-nightLine rounded-[10px] overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className={headerClass}>{primaryField?.name ?? 'Name'}</th>
                        {fields.map(field => (
                            <th key={field.id} className={headerClass}>
                                {field.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {pageRows.map(row => (
                        <tr
                            key={row.record.id}
                            onClick={canExpand ? () => expandRecord(row.record) : undefined}
                            className={`border-b border-gsic-line dark:border-gsic-nightLine last:border-b-0 ${
                                canExpand ? 'cursor-pointer hover:bg-gsic-greenLight/40 dark:hover:bg-gsic-nightCard' : ''
                            }`}
                        >
                            <td className="px-4 py-2.5 text-[13px] font-medium text-black dark:text-white">
                                {row.record.name || '(untitled)'}
                            </td>
                            {fields.map(field => (
                                <td key={field.id} className="px-4 py-2 text-[13px] text-gray-700 dark:text-gray-300">
                                    <CellRenderer field={field} record={row.record} shouldWrap={false} />
                                </td>
                            ))}
                        </tr>
                    ))}
                    {pageRows.length === 0 && (
                        <tr>
                            <td colSpan={1 + fields.length} className="px-4 py-8 text-center text-sm text-gray-400">
                                No records in this view.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {pageCount > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-gsic-line dark:border-gsic-nightLine no-print">
                    <span className="text-xs text-gray-500">
                        {formatNumber(visibleRows.length)} records · page {page + 1} of {pageCount}
                    </span>
                    <div className="flex gap-1.5">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold border border-gsic-lineDark dark:border-gsic-nightLine disabled:opacity-40 hover:border-gsic-green text-black dark:text-white"
                        >
                            Prev
                        </button>
                        <button
                            disabled={page >= pageCount - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold border border-gsic-lineDark dark:border-gsic-nightLine disabled:opacity-40 hover:border-gsic-green text-black dark:text-white"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
