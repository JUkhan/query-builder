import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { IDropdownData, QueryBuilderJSON, SelectClauseCol } from './interfaces';

export interface QueryBuilderState {
    currentQueryIndex: number;
    selectedTablesMapList: Map<string, IDropdownData>[];
    fetchedTableColumnDropdownOptions: Map<string, IDropdownData[]>;
    tableToColumnDataTypeMap: Map<string, any>;
    allQueries: QueryBuilderJSON[];
    selectClauseCols: SelectClauseCol[];
}

@Injectable({
    providedIn: 'root',
})
export class QueryBuilderStore extends ComponentStore<QueryBuilderState> {
    constructor() {
        super({
            currentQueryIndex: null as any,
            selectedTablesMapList: [],
            fetchedTableColumnDropdownOptions: new Map<
                string,
                IDropdownData[]
            >(),
            tableToColumnDataTypeMap: new Map<string, any>(),
            allQueries: [],
            selectClauseCols: [],
        });
    }

    public readonly QueryBuilderState$ = this.select((state) => state);

    public getSelectedTablesMapList() {
        return this.get().selectedTablesMapList;
    }

    public getCurrentSelectedTablesMap() {
        return this.get().selectedTablesMapList[this.get().currentQueryIndex];
    }

    public getFetchedTableColumnDropdownOptions() {
        return this.get().fetchedTableColumnDropdownOptions;
    }

    public getFullJsonData(index: any) {
        return this.get().allQueries[index] ?? null;
    }

    public getAllQueries() {
        return this.get().allQueries;
    }

    public getCurrentQueryIndex() {
        return this.get().currentQueryIndex;
    }

    public getTableToColumnDataTypeMap() {
        return this.get().tableToColumnDataTypeMap;
    }

    public getColumnDataType(tableName: string, columnName: string) {
        this.get()
            .tableToColumnDataTypeMap.get(tableName)
            ?.find((col: any) => col.ColumnName === columnName)?.DataType ?? null;
    }

    public getSelectClauseParts(): string[] {
        return this.get().selectClauseCols?.map(
            (col: SelectClauseCol) => col.fullClause
        );
    }
}