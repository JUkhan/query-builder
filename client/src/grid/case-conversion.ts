// @ts-nocheck

import { ColDef } from 'ag-grid-community';

export const toSnakeCase = (str: string): string =>
    str.replace(/([A-Z])/g, (a, _, i) => `${i ? '_' : ''}${a.toLowerCase()}`);

export const toTitleCase = (s: string, space = ''): string =>
    s.replace(/^_*(.)|_+(.)/g, (_, c, d) => c ? c.toUpperCase() : space + d.toUpperCase());

export const toTitleCaseModel = (record: any): any =>
    Object.keys(record).reduce((obj, key) => {
        obj[toTitleCase(key)] = record[key];
        return obj;
    }, {});

export const toSnakeCaseModel = (record: any): any =>
    Object.keys(record).reduce((obj, key) => {
        obj[toSnakeCase(key)] = record[key];
        return obj;
    }, {});

export const actionColHelper = (config: Partial<ColDef>): ColDef =>
    Object.assign(config, {
        sortable: false,
        filter: false,
        resizable: false,
        headerName: 'Actions',
    });
