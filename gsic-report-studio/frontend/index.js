// GSIC Report Studio — reporting & data presentation for Airtable Interfaces.
// Configure via the Interface Designer properties panel (table, title, toggles)
// plus the in-app "Report setup" panel for field selection (builders only).

import React, {useState, useEffect} from 'react';
import {
    initializeBlock,
    useBase,
    useRecords,
    useCustomProperties,
    useRunInfo,
    loadCSSFromURLAsync,
} from '@airtable/blocks/interface/ui';
import Header, {BrandMark} from './components/Header';
import KpiCards from './components/KpiCards';
import GroupBars from './components/GroupBars';
import {CompositionDonut, TrendChart} from './components/Charts';
import RecordsTable from './components/RecordsTable';
import ConfigPanel from './components/ConfigPanel';
import DebugPanel from './components/DebugPanel';
import {useFieldSettings} from './lib/useFieldSettings';
import {useReportData} from './lib/useReportData';
import {DATE_RANGES} from './lib/aggregate';
import {FONT_CSS_URL} from './lib/gsic';
import './style.css';

// Familjen Grotesk (GSIC brand face); system-ui stack covers any failure.
loadCSSFromURLAsync(FONT_CSS_URL).catch(() => {});

function getCustomProperties(base) {
    return [
        {key: 'title', label: 'Report title', type: 'string', defaultValue: 'Impact Report'},
        {key: 'dataTable', label: 'Data table', type: 'table', defaultValue: base.tables[0]},
        {key: 'showDonut', label: 'Show composition donut', type: 'boolean', defaultValue: true},
        {key: 'showTrend', label: 'Show monthly trend', type: 'boolean', defaultValue: true},
        {key: 'showTable', label: 'Show records table', type: 'boolean', defaultValue: true},
        {
            key: 'metric', label: 'Bars measure', type: 'enum',
            possibleValues: [
                {value: 'count', label: 'Record count'},
                {value: 'sum', label: 'Sum of value field'},
            ],
            defaultValue: 'count',
        },
        {key: 'showDebug', label: 'Show debug panel', type: 'boolean', defaultValue: false},
    ];
}

function SectionCard({title, children, className = ''}) {
    return (
        <section className={`bg-white dark:bg-gsic-night border border-gsic-line dark:border-gsic-nightLine rounded-xl p-5 shadow-gsic print-break-avoid ${className}`}>
            {title && (
                <h2 className="text-sm font-bold text-gsic-purple dark:text-gsic-purpleLight uppercase tracking-[0.06em] mt-0 mb-4">
                    {title}
                </h2>
            )}
            {children}
        </section>
    );
}

function CenteredNotice({children}) {
    return (
        <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center max-w-sm">
                <div className="flex justify-center mb-4">
                    <BrandMark size={40} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{children}</div>
            </div>
        </div>
    );
}

function App() {
    const base = useBase();
    const runInfo = useRunInfo();
    const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
    const {title, dataTable, showDonut, showTrend, showTable, metric, showDebug} = customPropertyValueByKey;

    const records = useRecords(dataTable);
    const {groupField, dateField, valueField, setField, canConfigure} = useFieldSettings(dataTable);

    const [rangeKey, setRangeKey] = useState('all');
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Reset drill-down when the slice definition changes underneath it.
    useEffect(() => {
        setSelectedGroup(null);
    }, [dataTable, groupField, rangeKey]);

    const data = useReportData(records, groupField, dateField, valueField, rangeKey);

    const isBuilder = runInfo.isDevelopmentMode || runInfo.isPageElementInEditMode;
    const showValues = metric === 'sum' && !!valueField;
    const rangeLabel = DATE_RANGES.find(r => r.key === rangeKey)?.label;

    if (!dataTable) {
        return (
            <div className="gsic-root fixed inset-0 flex flex-col bg-gsic-bg dark:bg-gsic-night">
                <CenteredNotice>
                    <strong>GSIC Report Studio</strong>
                    <br />
                    Open the properties panel and choose a data table to begin.
                </CenteredNotice>
            </div>
        );
    }

    return (
        <div className="gsic-root fixed inset-0 flex flex-col bg-gsic-bg dark:bg-gsic-night overflow-hidden">
            <Header
                title={title || 'Impact Report'}
                rangeKey={rangeKey}
                onRangeChange={setRangeKey}
                hasDateField={!!dateField}
                onPrint={() => window.print()}
            />

            <main className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
                {isBuilder && canConfigure && (
                    <ConfigPanel
                        table={dataTable}
                        groupField={groupField}
                        dateField={dateField}
                        valueField={valueField}
                        setField={setField}
                    />
                )}
                {showDebug && (
                    <DebugPanel
                        table={dataTable}
                        records={records}
                        groupField={groupField}
                        dateField={dateField}
                        valueField={valueField}
                    />
                )}

                {!data ? (
                    <CenteredNotice>Loading records…</CenteredNotice>
                ) : data.totalAll === 0 ? (
                    <CenteredNotice>
                        No records found in <strong>{dataTable.name}</strong>. Add records — or check that the
                        table is connected as a data source for this extension.
                    </CenteredNotice>
                ) : (
                    <>
                        <KpiCards data={data} valueField={valueField} groupField={groupField} rangeLabel={rangeLabel} />

                        {groupField && data.groups.length > 0 && (
                            <div className={`grid gap-4 grid-cols-1 ${showDonut ? 'xl:grid-cols-[3fr_2fr]' : ''}`}>
                                <SectionCard title={`By ${groupField.name}`}>
                                    <GroupBars
                                        groups={data.groups}
                                        selectedGroup={selectedGroup}
                                        onSelect={setSelectedGroup}
                                        showValues={showValues}
                                        currencySymbol={data.currencySymbol}
                                    />
                                </SectionCard>
                                {showDonut && (
                                    <SectionCard title="Composition">
                                        <CompositionDonut
                                            groups={data.groups}
                                            selectedGroup={selectedGroup}
                                            onSelect={setSelectedGroup}
                                        />
                                    </SectionCard>
                                )}
                            </div>
                        )}

                        {showTrend && dateField && data.trend.length >= 2 && (
                            <SectionCard title={`Monthly trend · ${dateField.name}`}>
                                <TrendChart trend={data.trend} showValues={showValues} currencySymbol={data.currencySymbol} />
                            </SectionCard>
                        )}

                        {showTable && (
                            <SectionCard
                                title={selectedGroup ? `Records — ${selectedGroup}` : 'Records'}
                            >
                                {selectedGroup && (
                                    <button
                                        onClick={() => setSelectedGroup(null)}
                                        className="no-print mb-3 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-gsic-greenLight text-gsic-green hover:bg-gsic-green hover:text-white transition-colors"
                                    >
                                        Clear filter ×
                                    </button>
                                )}
                                <RecordsTable
                                    table={dataTable}
                                    rows={data.rows}
                                    groupField={groupField}
                                    dateField={dateField}
                                    valueField={valueField}
                                    selectedGroup={selectedGroup}
                                />
                            </SectionCard>
                        )}

                        <footer className="text-xs text-gray-500 dark:text-gray-400 pb-2">
                            Maintained by the Georgia Social Impact Collaborative.
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
}

initializeBlock({interface: () => <App />});
