import React from 'react';
import {DATE_RANGES} from '../lib/aggregate';

/** GSIC conic-gradient brand mark — the shared mark across all GSIC tools. */
export function BrandMark({size = 28}) {
    return (
        <div
            aria-hidden="true"
            className="rounded-md border border-gsic-line dark:border-gsic-nightLine shrink-0"
            style={{
                width: size,
                height: size,
                background: 'conic-gradient(from 90deg, #4750a2, #53c3c2, #eec61a, #149a49)',
            }}
        />
    );
}

/**
 * Standard GSIC tool header: brand mark + uppercase kicker + title on the left,
 * date-range chips and actions on the right.
 */
export default function Header({title, rangeKey, onRangeChange, hasDateField, onPrint, extraActions}) {
    return (
        <header className="shrink-0 z-10 bg-white dark:bg-gsic-night border-b border-gsic-line dark:border-gsic-nightLine">
            <div className="px-6 py-3.5 flex items-center gap-3.5 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                    <BrandMark />
                    <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-black dark:text-white leading-tight">
                            Georgia Social Impact Collaborative
                        </div>
                        <div className="text-base font-bold text-gsic-green leading-tight truncate">{title}</div>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2 flex-wrap no-print">
                    {hasDateField && (
                        <div className="flex items-center gap-1 bg-gsic-bg dark:bg-gsic-nightCard border border-gsic-line dark:border-gsic-nightLine rounded-lg p-0.5">
                            {DATE_RANGES.map(range => (
                                <button
                                    key={range.key}
                                    onClick={() => onRangeChange(range.key)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                                        rangeKey === range.key
                                            ? 'bg-gsic-green text-white'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gsic-greenLight hover:text-gsic-green'
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}
                    {extraActions}
                    <button
                        onClick={onPrint}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gsic-nightCard text-black dark:text-white border border-gsic-lineDark dark:border-gsic-nightLine hover:border-gsic-green hover:bg-[#f7faf7] dark:hover:bg-gsic-night transition-colors"
                    >
                        Print / PDF
                    </button>
                </div>
            </div>
        </header>
    );
}
