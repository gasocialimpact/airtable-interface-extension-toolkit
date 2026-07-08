import React from 'react';
import {
    ResponsiveContainer,
    PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {GSIC, chartColorAt} from '../lib/gsic';
import {formatNumber} from '../lib/aggregate';

const tooltipStyle = {
    background: '#fff',
    border: `1px solid ${GSIC.line}`,
    borderRadius: 8,
    fontSize: 12,
    fontFamily: 'inherit',
};

/** Donut of group composition with a compact legend. */
export function CompositionDonut({groups, selectedGroup, onSelect}) {
    if (!groups.length) return null;
    const top = groups.slice(0, 7);
    const rest = groups.slice(7);
    const data = rest.length
        ? [...top, {name: `Other (${rest.length})`, count: rest.reduce((a, g) => a + g.count, 0)}]
        : top;

    return (
        <div className="flex items-center gap-4 flex-wrap">
            <div className="w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="name"
                            innerRadius="62%"
                            outerRadius="95%"
                            paddingAngle={2}
                            strokeWidth={0}
                            onClick={entry => onSelect?.(selectedGroup === entry.name ? null : entry.name)}
                        >
                            {data.map((entry, i) => (
                                <Cell
                                    key={entry.name}
                                    fill={chartColorAt(i)}
                                    opacity={selectedGroup && selectedGroup !== entry.name ? 0.35 : 1}
                                    cursor="pointer"
                                />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={value => [formatNumber(value), 'Records']} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <ul className="text-xs space-y-1.5 min-w-0">
                {data.map((entry, i) => (
                    <li key={entry.name} className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background: chartColorAt(i)}} />
                        <span className="truncate text-gray-700 dark:text-gray-200">{entry.name}</span>
                        <span className="ml-auto font-semibold text-black dark:text-white tabular-nums">
                            {formatNumber(entry.count)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Monthly trend area chart in GSIC green. */
export function TrendChart({trend, showValues, currencySymbol}) {
    if (trend.length < 2) return null;
    const dataKey = showValues ? 'sum' : 'count';
    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{top: 8, right: 8, bottom: 0, left: -12}}>
                    <defs>
                        <linearGradient id="gsicTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GSIC.green} stopOpacity={0.25} />
                            <stop offset="100%" stopColor={GSIC.green} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke={GSIC.line} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{fontSize: 11, fill: '#666'}} tickLine={false} axisLine={{stroke: GSIC.line}} />
                    <YAxis
                        tick={{fontSize: 11, fill: '#666'}}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={value => formatNumber(value, {currency: showValues ? currencySymbol : null})}
                    />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={value => [
                            formatNumber(value, {currency: showValues ? currencySymbol : null}),
                            showValues ? 'Total' : 'Records',
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={GSIC.green}
                        strokeWidth={2.5}
                        fill="url(#gsicTrendFill)"
                        dot={{r: 3, fill: GSIC.green, strokeWidth: 0}}
                        activeDot={{r: 5}}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
