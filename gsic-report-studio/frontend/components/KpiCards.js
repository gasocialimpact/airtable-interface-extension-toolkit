import React from 'react';
import {formatNumber, formatPercent} from '../lib/aggregate';

function KpiCard({label, value, sub, subTone}) {
    const toneClass =
        subTone === 'up' ? 'text-gsic-green' : subTone === 'down' ? 'text-gsic-orange' : 'text-gray-500 dark:text-gray-400';
    return (
        <div className="bg-gsic-bg dark:bg-gsic-nightCard border border-gsic-line dark:border-gsic-nightLine rounded-[10px] px-4 py-3.5 print-break-avoid">
            <div className="text-[11px] uppercase tracking-[0.09em] text-gsic-purple dark:text-gsic-purpleLight mb-1 font-semibold">
                {label}
            </div>
            <div className="text-2xl font-semibold text-black dark:text-white leading-tight">{value}</div>
            {sub && <div className={`text-xs mt-1 font-medium ${toneClass}`}>{sub}</div>}
        </div>
    );
}

/**
 * KPI row: record count, optional value-field sum, group count, and
 * period-over-period movement when a date range is active.
 */
export default function KpiCards({data, valueField, groupField, rangeLabel}) {
    const cards = [
        {
            label: 'Records',
            value: formatNumber(data.count),
            sub: data.count !== data.totalAll ? `of ${formatNumber(data.totalAll)} total` : null,
        },
    ];

    if (valueField && data.sum !== null) {
        cards.push({
            label: `Total ${valueField.name}`,
            value: formatNumber(data.sum, {currency: data.currencySymbol}),
            sub: data.count ? `${formatNumber(data.sum / data.count, {currency: data.currencySymbol})} avg` : null,
        });
    }

    if (groupField) {
        const top = data.groups[0];
        cards.push({
            label: groupField.name + ' groups',
            value: formatNumber(data.groups.length),
            sub: top ? `Top: ${top.name} (${formatPercent(top.share)})` : null,
        });
    }

    if (data.delta !== null) {
        cards.push({
            label: 'vs. prior period',
            value: `${data.delta >= 0 ? '+' : ''}${formatPercent(data.delta)}`,
            sub: rangeLabel,
            subTone: data.delta >= 0 ? 'up' : 'down',
        });
    }

    return (
        <div className="grid gap-3" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))'}}>
            {cards.map(card => (
                <KpiCard key={card.label} {...card} />
            ))}
        </div>
    );
}
