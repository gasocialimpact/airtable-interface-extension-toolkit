// Reads configured records once per change and derives everything the report
// renders: filtered rows, KPI stats, group breakdown, and monthly trend.
// All derivation is memoized — getCellValue calls happen once per data change,
// not once per render.

import {useMemo} from 'react';
import {FieldType} from '@airtable/blocks/interface/models';
import {getField, getFieldString} from './fields';
import {groupRows, bucketByMonth, rangeToInterval, priorInterval} from './aggregate';

/** Extract a display string + select color for the group-by field. */
function readGroupKey(record, field) {
    if (!field) return {key: '(all)', color: null};
    const raw = getField(record, field.id);
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && raw.name) {
        return {key: raw.name, color: raw.color || null}; // single select / external sync
    }
    if (Array.isArray(raw) && raw.length && raw[0].name) {
        return {key: raw[0].name, color: raw[0].color || null}; // multi select — bucket by first
    }
    const str = getFieldString(record, field.id);
    return {key: str || '(none)', color: null};
}

/**
 * @param records  useRecords(table) result (or null)
 * @param groupField  Field | null — how to slice the data
 * @param dateField   Field | null — enables date filtering + trend
 * @param valueField  Field | null — number/currency to sum; falls back to counting
 * @param rangeKey    one of DATE_RANGES keys
 */
export function useReportData(records, groupField, dateField, valueField, rangeKey) {
    const currencySymbol =
        valueField?.type === FieldType.CURRENCY ? (valueField.options?.symbol ?? '$') : null;

    return useMemo(() => {
        if (!records) return null;

        // One pass: read every needed cell into plain rows.
        const allRows = records.map(record => {
            const {key, color} = readGroupKey(record, groupField);
            let date = null;
            if (dateField) {
                const iso = getField(record, dateField.id);
                if (iso) {
                    const parsed = new Date(iso);
                    if (!Number.isNaN(parsed.getTime())) date = parsed;
                }
            }
            let value = null;
            if (valueField) {
                const raw = getField(record, valueField.id);
                if (typeof raw === 'number') value = raw;
            }
            return {record, groupKey: key, groupColor: color, date, value};
        });

        const now = new Date();
        const [start] = rangeToInterval(rangeKey, now);
        const inRange = row => {
            if (!start || !dateField) return true;
            return row.date !== null && row.date >= start && row.date <= now;
        };
        const rows = allRows.filter(inRange);

        // Period-over-period: same-length window immediately before this one.
        let delta = null;
        if (start && dateField) {
            const [prevStart, prevEnd] = priorInterval(rangeKey, now);
            const prevCount = allRows.filter(
                row => row.date !== null && row.date >= prevStart && row.date < prevEnd
            ).length;
            if (prevCount > 0) delta = (rows.length - prevCount) / prevCount;
            else if (rows.length > 0) delta = 1;
        }

        const groups = groupRows(rows);
        const trend = dateField ? bucketByMonth(rows) : [];
        const sum = valueField
            ? rows.reduce((acc, row) => acc + (typeof row.value === 'number' ? row.value : 0), 0)
            : null;

        return {
            rows,
            totalAll: allRows.length,
            count: rows.length,
            sum,
            currencySymbol,
            groups,
            trend,
            delta,
        };
    }, [records, groupField, dateField, valueField, rangeKey, currencySymbol]);
}
