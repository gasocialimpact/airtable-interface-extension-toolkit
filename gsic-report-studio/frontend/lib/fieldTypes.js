// Field-type classification shared by widget settings and auto-detection.

import {FieldType} from '@airtable/blocks/interface/models';

export const GROUPABLE_TYPES = new Set([
    FieldType.SINGLE_SELECT,
    FieldType.MULTIPLE_SELECTS,
    FieldType.SINGLE_LINE_TEXT,
    FieldType.SINGLE_COLLABORATOR,
    FieldType.EXTERNAL_SYNC_SOURCE,
    FieldType.CHECKBOX,
]);

export const DATE_TYPES = new Set([
    FieldType.DATE,
    FieldType.DATE_TIME,
    FieldType.CREATED_TIME,
    FieldType.LAST_MODIFIED_TIME,
]);

export const NUMERIC_TYPES = new Set([
    FieldType.NUMBER,
    FieldType.CURRENCY,
    FieldType.PERCENT,
    FieldType.RATING,
    FieldType.DURATION,
    FieldType.COUNT,
    FieldType.AUTO_NUMBER,
]);

/** Formula/rollup fields count as numeric when their result type is numeric. */
export function isNumericField(field) {
    if (NUMERIC_TYPES.has(field.type)) return true;
    if (field.type === FieldType.FORMULA || field.type === FieldType.ROLLUP) {
        const resultType = field.options?.result?.type;
        return resultType ? NUMERIC_TYPES.has(resultType) : false;
    }
    return false;
}

/** Pick sensible default fields from a table's schema. */
export function autoDetect(table) {
    if (!table) return {groupField: null, dateField: null, valueField: null};
    const fields = table.fields;
    const groupField =
        fields.find(f => f.type === FieldType.SINGLE_SELECT) ||
        fields.find(f => f.type === FieldType.MULTIPLE_SELECTS) ||
        null;
    const dateField = fields.find(f => DATE_TYPES.has(f.type)) || null;
    const valueField = fields.find(f => isNumericField(f) && f.type !== FieldType.AUTO_NUMBER) || null;
    return {groupField, dateField, valueField};
}
