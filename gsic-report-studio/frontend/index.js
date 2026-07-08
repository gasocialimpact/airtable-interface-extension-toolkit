// GSIC Report Studio — dashboard-first reporting for Airtable Interfaces.
// The page is a grid of independent widgets (KPI cards, bar breakdowns,
// donuts, trends, record tables), each with its own table/group/measure,
// arranged by builders in edit mode. Print CSS keeps the export path clean.

import React, {useState} from 'react';
import {
    initializeBlock,
    useBase,
    useCustomProperties,
    useRunInfo,
    loadCSSFromURLAsync,
} from '@airtable/blocks/interface/ui';
import Header, {BrandMark} from './components/Header';
import Widget, {WIDGET_TYPES} from './components/Widget';
import DebugPanel from './components/DebugPanel';
import {useWidgets} from './lib/useWidgets';
import {FONT_CSS_URL} from './lib/gsic';
import './style.css';

// Familjen Grotesk (GSIC brand face); system-ui stack covers any failure.
loadCSSFromURLAsync(FONT_CSS_URL).catch(() => {});

function getCustomProperties(base) {
    return [
        {key: 'title', label: 'Dashboard title', type: 'string', defaultValue: 'Impact Dashboard'},
        {key: 'dataTable', label: 'Default table for new sections', type: 'table', defaultValue: base.tables[0]},
        {key: 'showDebug', label: 'Show debug panel', type: 'boolean', defaultValue: false},
    ];
}

function AddSectionBar({onAdd}) {
    return (
        <div className="no-print border-2 border-dashed border-gsic-lineDark dark:border-gsic-nightLine rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-gsic-purple dark:text-gsic-purpleLight">
                Add section
            </span>
            {WIDGET_TYPES.map(({type, label}) => (
                <button
                    key={type}
                    onClick={() => onAdd(type)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gsic-nightCard text-black dark:text-white border border-gsic-lineDark dark:border-gsic-nightLine hover:border-gsic-green hover:text-gsic-green transition-colors"
                >
                    + {label}
                </button>
            ))}
        </div>
    );
}

function App() {
    const base = useBase();
    const runInfo = useRunInfo();
    const {customPropertyValueByKey} = useCustomProperties(getCustomProperties);
    const {title, dataTable, showDebug} = customPropertyValueByKey;

    const {widgets, canConfigure, addWidget, updateWidget, removeWidget, moveWidget} = useWidgets(dataTable);

    const [rangeKey, setRangeKey] = useState('all');
    // {fieldId, name} — shared so widgets grouped by the same field cross-filter.
    const [selection, setSelection] = useState(null);

    const isBuilder = (runInfo.isDevelopmentMode || runInfo.isPageElementInEditMode) && canConfigure;
    const hasDateField = widgets.some(w => w.dateFieldId);

    if (!widgets.length) {
        return (
            <div className="gsic-root fixed inset-0 flex flex-col bg-gsic-bg dark:bg-gsic-night">
                <div className="flex-1 flex items-center justify-center p-10">
                    <div className="text-center max-w-sm">
                        <div className="flex justify-center mb-4"><BrandMark size={40} /></div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>GSIC Report Studio</strong><br />
                            Open the properties panel and choose a default table to begin.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gsic-root fixed inset-0 flex flex-col bg-gsic-bg dark:bg-gsic-night overflow-hidden">
            <Header
                title={title || 'Impact Dashboard'}
                rangeKey={rangeKey}
                onRangeChange={setRangeKey}
                hasDateField={hasDateField}
                onPrint={() => window.print()}
            />

            <main className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                {showDebug && (
                    <div className="mb-4">
                        <DebugPanel base={base} defaultTable={dataTable} widgets={widgets} />
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                    {widgets.map(widget => (
                        <div key={widget.id} className={widget.width === 'full' ? 'xl:col-span-2' : ''}>
                            <Widget
                                widget={widget}
                                rangeKey={rangeKey}
                                selection={selection}
                                onSelect={setSelection}
                                isBuilder={isBuilder}
                                onUpdate={patch => updateWidget(widget.id, patch)}
                                onRemove={() => removeWidget(widget.id)}
                                onMove={direction => moveWidget(widget.id, direction)}
                            />
                        </div>
                    ))}
                    {isBuilder && (
                        <div className="xl:col-span-2">
                            <AddSectionBar onAdd={type => addWidget(type, dataTable)} />
                        </div>
                    )}
                </div>

                <footer className="text-xs text-gray-500 dark:text-gray-400 pt-4 pb-2">
                    Maintained by the Georgia Social Impact Collaborative.
                </footer>
            </main>
        </div>
    );
}

initializeBlock({interface: () => <App />});
