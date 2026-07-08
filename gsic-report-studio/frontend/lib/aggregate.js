// Pure data-shaping helpers for GSIC Report Studio.
// All functions take plain values (already read from records) so they are
// trivially memoizable and testable outside the SDK.

/** Date-range presets shown as filter chips in the header. */
export const DATE_RANGES = [
    {key: 'all', label: 'All time'},
    {key: '30d', label: 'Last 30 days'},
    {key: '90d', label: 'Last 90 days'},
    {key: 'ytd', label: 'Year to date'},
];

/** Resolve a date-range key to a [start, end] pair of Date objects (null = unbounded). */
export function rangeToInterval(rangeKey, now = new Date()) {
    switch (rangeKey) {
        case '30d': {
            const start = new Date(now);
            start.setDate(start.getDate() - 30);
            return [start, null];
        }
        case '90d': {
            const start = new Date(now);
            start.setDate(start.getDate() - 90);
            return [start, null];
        }
        case 'ytd':
            return [new Date(now.getFullYear(), 0, 1), null];
        default:
            return [null, null];
    }
}

/** The interval of identical length immediately before [start, now] — for period-over-period deltas. */
export function priorInterval(rangeKey, now = new Date()) {
    const [start] = rangeToInterval(rangeKey, now);
    if (!start) return [null, null];
    const spanMs = now.getTime() - start.getTime();
    return [new Date(start.getTime() - spanMs), start];
}

/**
 * Group rows and compute count + sum per group.
 * @param {Array<{groupKey: string, groupColor: string|null, value: number|null}>} rows
 * @returns {Array<{name, color, count, sum, share}>} sorted by count desc
 */
export function groupRows(rows) {
    const groups = new Map();
    for (const row of rows) {
        const key = row.groupKey || '(none)';
        let g = groups.get(key);
        if (!g) {
            g = {name: key, color: row.groupColor || null, count: 0, sum: 0};
            groups.set(key, g);
        }
        g.count += 1;
        if (typeof row.value === 'number' && !Number.isNaN(row.value)) g.sum += row.value;
    }
    const list = [...groups.values()].sort((a, b) => b.count - a.count);
    const total = rows.length || 1;
    for (const g of list) g.share = g.count / total;
    return list;
}

/**
 * Bucket rows by month for the trend line.
 * @param {Array<{date: Date|null, value: number|null}>} rows
 * @returns {Array<{month: string, label: string, count, sum}>} chronological
 */
export function bucketByMonth(rows) {
    const buckets = new Map();
    for (const row of rows) {
        if (!row.date) continue;
        const key = `${row.date.getFullYear()}-${String(row.date.getMonth() + 1).padStart(2, '0')}`;
        let b = buckets.get(key);
        if (!b) {
            const label = row.date.toLocaleDateString('en-US', {month: 'short', year: '2-digit'});
            b = {month: key, label, count: 0, sum: 0};
            buckets.set(key, b);
        }
        b.count += 1;
        if (typeof row.value === 'number' && !Number.isNaN(row.value)) b.sum += row.value;
    }
    return [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month));
}

/** Compact number formatting for KPI cards and chart axes. */
export function formatNumber(n, {currency = null} = {}) {
    if (n === null || n === undefined || Number.isNaN(n)) return '—';
    const abs = Math.abs(n);
    let formatted;
    if (abs >= 1_000_000) formatted = (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    else if (abs >= 10_000) formatted = (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    else formatted = Number.isInteger(n) ? n.toLocaleString() : n.toLocaleString(undefined, {maximumFractionDigits: 1});
    return currency ? `${currency}${formatted}` : formatted;
}

/** Percent formatting for share columns and deltas. */
export function formatPercent(fraction) {
    if (fraction === null || fraction === undefined || Number.isNaN(fraction)) return '—';
    return `${Math.round(fraction * 100)}%`;
}
