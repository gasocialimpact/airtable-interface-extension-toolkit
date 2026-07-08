// Field selection for the report. Interface Designer custom properties can't
// make a field picker depend on a table picker (getCustomProperties only
// receives `base`), so field choice lives in GlobalConfig, keyed per table —
// switching tables keeps each table's saved configuration.
//
// When nothing is saved yet, sensible fields are auto-detected from the schema
// so the report renders immediately.

import {useCallback, useMemo} from 'react';
import {useGlobalConfig} from '@airtable/blocks/interface/ui';
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

function autoDetect(table) {
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

const NONE = '__none__';

export function useFieldSettings(table) {
    const globalConfig = useGlobalConfig();
    const tableId = table?.id ?? null;

    const readField = useCallback(
        (key, fallback) => {
            if (!table) return null;
            const savedId = globalConfig.get(['reportStudio', tableId, key]);
            if (savedId === NONE) return null; // user explicitly chose "None"
            if (typeof savedId === 'string') {
                const field = table.getFieldByIdIfExists(savedId);
                if (field) return field;
            }
            return fallback;
        },
        [globalConfig, table, tableId]
    );

    const detected = useMemo(() => autoDetect(table), [table]);

    const groupField = readField('groupFieldId', detected.groupField);
    const dateField = readField('dateFieldId', detected.dateField);
    const valueField = readField('valueFieldId', detected.valueField);

    const canConfigure = globalConfig.hasPermissionToSet();

    const setField = useCallback(
        async (key, fieldId) => {
            if (!tableId) return;
            const path = ['reportStudio', tableId, key];
            if (globalConfig.hasPermissionToSet(path)) {
                await globalConfig.setAsync(path, fieldId ?? NONE);
            }
        },
        [globalConfig, tableId]
    );

    return {groupField, dateField, valueField, setField, canConfigure};
}
