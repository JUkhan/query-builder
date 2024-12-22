import { FormGroup } from '@angular/forms';

export interface JoinCondition {
    leftColumn: string;
    operator: string;
    rightColumn: string;
}

export interface JoinConfig {
    joinType: string;
    rightTableName: string;
    leftTableName: string;
    joinConditionFormArray: JoinCondition[];
}

export interface IDropdownData {
    value: string;
    label: string;
}

export interface QueryBuilderJSON {
    formTableName: string;
    applyGroupBy: boolean;
    joinConfigs: JoinConfig[];
    filterConditions: any;
    selectedTableToColumnsMap: Map<string, any>;
    selectCases: SelectCase[];
    calculatedColumns: CalculatedColumn[];
    orderByColumns: OrderByColumn[];
    selectClauseCols: SelectClauseCol[];
    webQuery: string;
}

export interface Result {
    resultType: string;
    tableName: string;
    tableColumnName: string;
    specificValue: string;
}

export interface CaseCondition {
    type: string;
    filterConditionsForm?: any;
    resultForm: Result;
}

export interface SelectCase {
    columnName: string;
    conditionsFormArray: CaseCondition[];
}

export interface CalculatedColumn {
    columnName: string;
    expression: string;
}

export interface BuildQueryPayload {
    sourceTable: string;
    tableWiseSelectedColumnsForm: FormGroup;
    calculatedColumns: CalculatedColumn[];
    selectCases: SelectCase[];
    joinConditions: JoinConfig[];
    filterConditions: any;
    applyGroupBy: boolean;
    orderByColumns: OrderByColumn[];
}

export interface OrderByColumn {
    tableName: string;
    columnName: string;
    orderType: string;
}

export interface SelectClauseCol {
    columnName: string;
    fullClause: string;
}
