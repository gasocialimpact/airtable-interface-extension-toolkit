import React from 'react';
import {chartColorAt} from '../lib/gsic';
import {formatNumber, formatPercent} from '../lib/aggregate';

/**
 * Horizontal bar breakdown — the GSIC .bar-row pattern (label / track / value)
 * rendered in plain HTML so it prints crisply. Clicking a bar filters the
 * records panel; clicking again clears.
 */
export default function GroupBars({groups, selectedGroup, onSelect, showValues, currencySymbol}) {
    if (!groups.length) return null;
    const max = Math.max(...groups.map(g => (showValues ? g.sum : g.count)), 1);

    return (
        <div className="space-y-2">
            {groups.map((group, i) => {
                const metric = showValues ? group.sum : group.count;
                const width = Math.max((metric / max) * 100, 2);
                const isSelected = selectedGroup === group.name;
                const dimmed = selectedGroup && !isSelected;
                return (
                    <button
                        key={group.name}
                        onClick={() => onSelect(isSelected ? null : group.name)}
                        className={`w-full flex items-center gap-2.5 group text-left transition-opacity ${dimmed ? 'opacity-40' : ''}`}
                        title={isSelected ? 'Clear filter' : `Filter to ${group.name}`}
                    >
                        <span className="w-36 shrink-0 text-right text-xs text-gray-600 dark:text-gray-300 truncate">
                            {group.name}
                        </span>
                        <span className="flex-1 h-7 bg-[#f0f2f6] dark:bg-gsic-nightCard rounded-md overflow-hidden">
                            <span
                                className={`block h-full rounded-md transition-all duration-300 ${isSelected ? 'ring-2 ring-inset ring-black/20' : ''}`}
                                style={{width: `${width}%`, background: chartColorAt(i)}}
                            />
                        </span>
                        <span className="w-20 shrink-0 text-xs font-semibold text-black dark:text-white tabular-nums">
                            {formatNumber(metric, {currency: showValues ? currencySymbol : null})}
                            <span className="text-gray-400 font-normal ml-1">{formatPercent(group.share)}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
