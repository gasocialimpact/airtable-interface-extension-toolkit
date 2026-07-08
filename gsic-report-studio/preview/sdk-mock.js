// Browser preview stub for '@airtable/blocks/interface/ui'.
// Lets the extension render outside Airtable with sample data — used only by
// the preview build (esbuild --alias), never shipped.

import React from 'react';
import {createRoot} from 'react-dom/client';
import {FIELDS, RECORDS, TABLE_NAME} from './sample-data';

const fieldsById = new Map(FIELDS.map(f => [f.id, f]));

class MockField {
    constructor(def) {
        Object.assign(this, def);
    }
}
const fieldModels = FIELDS.map(f => new MockField(f));

class MockRecord {
    constructor(def) {
        this.id = def.id;
        this.name = def.name;
        this._cells = def.cells;
    }
    getCellValue(fieldOrId) {
        const id = typeof fieldOrId === 'string' ? fieldOrId : fieldOrId.id;
        return this._cells[id] ?? null;
    }
    getCellValueAsString(fieldOrId) {
        const value = this.getCellValue(fieldOrId);
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return value.name ?? String(value);
        return String(value);
    }
}
const recordModels = RECORDS.map(r => new MockRecord(r));

const mockTable = {
    id: 'tblMOCK00000000000',
    name: TABLE_NAME,
    fields: fieldModels,
    getFieldByIdIfExists: id => fieldsById.get(id) ?? null,
    hasPermissionToExpandRecords: () => true,
};

const mockBase = {tables: [mockTable], name: 'GSIC Preview Base'};

const globalConfigStore = {};
const mockGlobalConfig = {
    get: path => {
        const key = Array.isArray(path) ? path.join('.') : path;
        return globalConfigStore[key];
    },
    hasPermissionToSet: () => true,
    setAsync: async (path, value) => {
        const key = Array.isArray(path) ? path.join('.') : path;
        globalConfigStore[key] = value;
        rerender();
    },
};

export function useBase() {
    return mockBase;
}
export function useRecords(table) {
    return table ? recordModels : null;
}
export function useGlobalConfig() {
    return mockGlobalConfig;
}
export function useRunInfo() {
    return {isDevelopmentMode: false, isPageElementInEditMode: window.__editMode ?? false};
}
export function useCustomProperties(getProps) {
    const props = getProps(mockBase);
    const values = {};
    for (const p of props) values[p.key] = p.defaultValue;
    return {customPropertyValueByKey: values, errorState: null};
}
export function expandRecord(record) {
    alert(`(Preview) Would open Airtable record: ${record.name}`);
}
export function CellRenderer({field, record}) {
    const value = record.getCellValue(field.id);
    if (value && typeof value === 'object' && value.name) {
        return (
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gsic-greenLight text-gsic-green">
                {value.name}
            </span>
        );
    }
    let text = record.getCellValueAsString(field.id);
    if ((field.type === 'date' || field.type === 'dateTime') && value) {
        text = new Date(value).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
    }
    return <span>{text}</span>;
}
export function loadCSSFromURLAsync() {
    return Promise.resolve();
}
export function loadCSSFromString() {}

let renderFn = null;
function rerender() {
    if (renderFn) renderFn();
}
export function initializeBlock({interface: makeApp}) {
    const root = createRoot(document.getElementById('root'));
    renderFn = () => root.render(React.createElement(makeApp));
    renderFn();
}
