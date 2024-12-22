//@ts-nocheck
import { Injectable } from '@angular/core';
import {
    BuildQueryPayload,
    CalculatedColumn,
    IDropdownData,
    JoinConfig,
    OrderByColumn,
    SelectCase,
    SelectClauseCol,
} from '../interfaces';
import { QueryBuilderStore } from '../query-builder.store';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ValueFormatter } from '../valueFormatter';
import {
    AggregationFunctionTypeEnum,
    CaseConditionTypeEnum,
    CaseResultValueTypeEnum,
    ConditionTypeEnum,
    DotEnum,
} from '../enums';

@Injectable({
    providedIn: 'root',
})
export class QueryBuilderService {
    constructor(
        private queryBuilderStore: QueryBuilderStore,
        private formBuilder: FormBuilder
    ) {}

    public getSelectedColumnListTableMap(selectedTableToColumnsMap) {
        let result: Map<string, any> = new Map();
        Object.keys(selectedTableToColumnsMap)?.forEach((tableName) => {
            let trueKeys: string[] = [];
            let selectedColumns: any[] = [];
            Object.keys(selectedTableToColumnsMap[tableName])?.forEach(
                (columnName) => {
                    if (
                        selectedTableToColumnsMap[tableName][columnName][
                            'isSelected'
                        ]
                    ) {
                        trueKeys.push(columnName);
                        selectedColumns.push({
                            ...selectedTableToColumnsMap[tableName][columnName],
                            columnName: columnName,
                        });
                    }
                }
            );

            if (trueKeys.length > 0) {
                result.set(tableName, selectedColumns);
            }
        });
        return result;
    }

    private formatColumnSelect(
        tableName: string,
        column: any,
        alias: string | null,
        isAggregate: boolean
    ): string {
        return isAggregate
            ? `${column.aggregateFunction}(${tableName}.${column.columnName}) as ${alias}`
            : `${tableName}.${column.columnName}${alias ? ` as ${alias}` : ''}`;
    }

    private fullSelectClause(payload): string {
        this.deleteUnnecessaryTables(payload.tableWiseSelectedColumnsForm);
        const selectClause = this.buildSelectClause(
            payload.tableWiseSelectedColumnsForm.value
        );
        const selectCaseClause = payload.selectCases.length
            ? this.buildSelectCaseClause(payload.selectCases)
            : '';
        const calculatedColumnClause = payload.calculatedColumns.length
            ? `,\n\t${this.buildCalculatedColumnClause(
                  payload.calculatedColumns
              )}`
            : '';
        return `${selectClause}${calculatedColumnClause}${selectCaseClause}`;
    }

    private getNewSelectClauseCols(selectClauseParts): SelectClauseCol[] {
        return selectClauseParts.map((item) => {
            let columnName;

            if (item.includes(' as ')) {
                columnName = item.split(' as ')[1].replace(/\s+/g, '');
            } else {
                const parts = item.split('.');
                columnName = parts[parts.length - 1];
            }

            return {
                columnName: columnName,
                fullClause: item,
            } as SelectClauseCol;
        });
    }

    public generateSelectClauseColumnsArray(payload): SelectClauseCol[] {
        const fullSelectClause: string = this.fullSelectClause(payload);
        const selectClauseParts: string[] = fullSelectClause.split(',');
        const newSelectClauseCols: SelectClauseCol[] =
            this.getNewSelectClauseCols(selectClauseParts);

        const fullJsonData = this.queryBuilderStore.getFullJsonData(
            this.queryBuilderStore.getCurrentQueryIndex()
        );

        if (fullJsonData && fullJsonData?.selectClauseCols) {
            const selectClauseCols = fullJsonData.selectClauseCols;
            return [
                // Elements from selectClauseCols that are also in newSelectClauseCols
                ...selectClauseCols.filter((firstItem) =>
                    newSelectClauseCols.some(
                        (secondItem) =>
                            secondItem.columnName === firstItem.columnName
                    )
                ),
                // Elements from newSelectClauseCols that are not in selectClauseCols
                ...newSelectClauseCols.filter(
                    (secondItem) =>
                        !selectClauseCols.some(
                            (firstItem) =>
                                firstItem.columnName === secondItem.columnName
                        )
                ),
            ];
        } else {
            return newSelectClauseCols;
        }
    }

    private buildSelectClause(selectedTableToColumnsMap): string {
        const tableWiseSelectedColumnsMap = this.getSelectedColumnListTableMap(
            selectedTableToColumnsMap
        );

        let selectedCols: string[] = [];
        let columnCount: Map<string, number> = new Map();

        tableWiseSelectedColumnsMap.forEach((columns, tableName) => {
            columns.forEach((column: any) => {
                columnCount.set(
                    column.columnName,
                    (columnCount.get(column.columnName) || 0) + 1
                );
            });
        });

        tableWiseSelectedColumnsMap.forEach((columns, tableName) => {
            columns.forEach((column: any) => {
                const isAggregateColumn =
                    column.aggregateFunction !==
                    AggregationFunctionTypeEnum.NO_AGGREGATION;
                const hasCustomName = column.customColumnName.length > 0;
                const alias = hasCustomName
                    ? column.customColumnName
                    : isAggregateColumn ||
                      columnCount.get(column.columnName)! > 1
                    ? `${tableName}_${column.columnName}`
                    : null; // No alias if no aggregation, no collisions, and no custom name

                selectedCols.push(
                    this.formatColumnSelect(
                        tableName,
                        column,
                        alias,
                        isAggregateColumn
                    )
                );
            });
        });

        return selectedCols.join(',\n\t');
    }

    public buildJoinClause(joinConditions: JoinConfig[]): string {
        return joinConditions
            .map((joinCondition) => {
                const {
                    joinType,
                    rightTableName,
                    leftTableName,
                    joinConditionFormArray,
                } = joinCondition;

                const conditions = joinConditionFormArray
                    .map((condition) => {
                        return `${leftTableName}.${condition.leftColumn} ${condition.operator} ${rightTableName}.${condition.rightColumn}`;
                    })
                    .join(' and ');
                return `${joinType} ${rightTableName} on ${conditions}`;
            })
            .join(' \n\t');
    }

    buildFilterClause(data: {
        condition: string;
        rulesFormArray: any[];
    }): string {
        function processRules(rules: any[], condition: string): string {
            return rules
                ?.map((rule) => {
                    if (rule.type === ConditionTypeEnum.NORMAL_CONDITION) {
                        return buildNormalCondition(rule);
                    } else if (
                        rule.type === ConditionTypeEnum.GROUP_CONDITION
                    ) {
                        return `(${processRules(
                            rule.rulesFormArray,
                            rule.condition
                        )})`;
                    }
                })
                .join(`\n\t${condition} `);
        }

        function buildNormalCondition(rule: any): string {
            const formattedValue = ValueFormatter.format(rule);
            return `${rule.leftTableName}.${rule.leftTableColumn} ${rule.operator} ${formattedValue}`;
        }

        return processRules(data.rulesFormArray, data.condition);
    }

    buildSelectCaseClause(selectCases: SelectCase[]): string {
        return selectCases
            .map((element) => {
                if (!element || !element.conditionsFormArray) {
                    return '';
                }

                let caseStatement = ',\n\tcase\n';
                element.conditionsFormArray.forEach((condition: any) => {
                    const {
                        resultType,
                        tableName,
                        tableColumnName,
                        specificValue,
                    } = condition.resultForm;

                    const resultValue =
                        resultType === CaseResultValueTypeEnum.TABLE_COLUMN
                            ? `${tableName}.${tableColumnName}`
                            : `'${specificValue}'`;

                    if (condition.type === CaseConditionTypeEnum.WHEN) {
                        caseStatement += `\t    when ${this.buildFilterClause(
                            condition.filterConditionsForm
                        )} then ${resultValue}\n`;
                    } else if (condition.type === CaseConditionTypeEnum.ELSE) {
                        caseStatement += `\t    else ${resultValue}\n`;
                    }
                });

                caseStatement += `\tend as ${element.columnName}`;
                return caseStatement;
            })
            .join('');
    }

    private buildGroupByClause(
        selectedTableToColumnsMap,
        selectCaseClause,
        calculatedColumnClause,
        orderByColumns
    ) {
        const tableWiseSelectedColumnsMap = this.getSelectedColumnListTableMap(
            selectedTableToColumnsMap
        );

        let selectedColsWithoutAgg: string[] = [];
        tableWiseSelectedColumnsMap.forEach((columns, tableName) => {
            columns.forEach((column: any) => {
                if (
                    column.aggregateFunction ===
                    AggregationFunctionTypeEnum.NO_AGGREGATION
                ) {
                    selectedColsWithoutAgg.push(
                        `${tableName}.${column.columnName}`
                    );
                }
            });
        });

        const orderByCols = orderByColumns
            .map((col) => `${col.tableName}.${col.columnName}`)
            .join(',\n\t');

        return `\nGROUP BY ${selectedColsWithoutAgg.join(',\n\t')}${
            calculatedColumnClause
                ? this.removeAliasFromClause(calculatedColumnClause)
                : ''
        } ${this.removeAliasFromClause(selectCaseClause)}${
            orderByCols ? ',\n\t' + orderByCols : ''
        }`;
    }

    private removeAliasFromClause(clause: string): string {
        return clause.replace(/\s+as\s+\w+,?/g, '');
    }

    private buildCalculatedColumnClause(
        calculatedColumns: CalculatedColumn[]
    ): string {
        return calculatedColumns
            .map((col) => `${col.expression} as ${col.columnName}`)
            .join(',\n\t');
    }

    private buildOrderByClause(orderByColumns: OrderByColumn[]): string {
        return orderByColumns
            .map((col) => `${col.tableName}.${col.columnName} ${col.orderType}`)
            .join(',\n\t');
    }

    public buildQuery(payload: BuildQueryPayload): string {
        this.deleteUnnecessaryTables(payload.tableWiseSelectedColumnsForm);
        const selectCaseClause = payload.selectCases.length
            ? this.buildSelectCaseClause(payload.selectCases)
            : '';
        const calculatedColumnClause = payload.calculatedColumns.length
            ? `,\n\t${this.buildCalculatedColumnClause(
                  payload.calculatedColumns
              )}`
            : '';

        const joinClause = payload.joinConditions.length
            ? `\n\t${this.buildJoinClause(payload.joinConditions)}`
            : '';
        const filterClause = this.buildFilterClause(payload.filterConditions);
        const groupByClause = payload.applyGroupBy
            ? this.buildGroupByClause(
                  payload.tableWiseSelectedColumnsForm.value,
                  selectCaseClause,
                  calculatedColumnClause,
                  payload.orderByColumns
              )
            : '';

        const orderByClause = payload.orderByColumns.length
            ? `\nORDER BY ${this.buildOrderByClause(payload.orderByColumns)}`
            : '';
        const query = `SELECT \t${this.queryBuilderStore
            .getSelectClauseParts()
            .join(',')} \nFROM ${payload.sourceTable} ${joinClause} ${
            filterClause ? '\nWHERE ' + filterClause : ''
        }${groupByClause}${orderByClause}`;

        return query
            .replace(/\buser\b(?=(\.\w+)?)/g, '"user"')
            .replace(
                new RegExp(DotEnum.REPLACED_VALUE_OF_DOT, 'g'),
                DotEnum.DOT
            );
    }

    private deleteUnnecessaryTables(tableWiseSelectedColumnsForm) {
        const selectedTableNames: string[] = Array.from(
            this.queryBuilderStore.getCurrentSelectedTablesMap().values()
        )
            .filter(
                (dropdownData: IDropdownData) => dropdownData.value !== null
            )
            .map((table) => table.value);

        Object.keys(tableWiseSelectedColumnsForm.value).forEach((tableName) => {
            if (!selectedTableNames.includes(tableName)) {
                delete tableWiseSelectedColumnsForm.value[tableName];
                this.deleteTableWiseSelectedColumnsForm(
                    tableWiseSelectedColumnsForm,
                    tableName
                );
            }
        });
    }

    public getAlreadySelectedTableList(
        selectedTablesMap,
        tableWiseSelectedColumnsForm: FormGroup
    ): IDropdownData[] {
        if (!selectedTablesMap) return [];
        const tableList = Array.from(selectedTablesMap.values()).filter(
            (dropdownData: IDropdownData) => dropdownData.value !== null
        ) as IDropdownData[];
        this.initSelectedColumns(tableList, tableWiseSelectedColumnsForm);
        return tableList;
    }

    private initSelectedColumns(
        tableList,
        tableWiseSelectedColumnsForm: FormGroup
    ) {
        tableList.forEach((table) => {
            if (!tableWiseSelectedColumnsForm.get(table.value)) {
                tableWiseSelectedColumnsForm.addControl(
                    table.value,
                    this.formBuilder.group({})
                );
            }

            let columnsFormGroup: FormGroup = tableWiseSelectedColumnsForm.get(
                table.value
            ) as FormGroup;

            this.getAllColumnListByTable(table.value)?.forEach(
                (column: IDropdownData) => {
                    const columnControl = columnsFormGroup.get(column.value);
                    if (columnControl) {
                        columnsFormGroup
                            .get(column.value)
                            .get('isSelected')
                            .setValue(columnControl.value.isSelected);
                        columnsFormGroup
                            .get(column.value)
                            .get('aggregateFunction')
                            .setValue(columnControl.value.aggregateFunction);
                        columnsFormGroup
                            .get(column.value)
                            .get('customColumnName')
                            .setValue(columnControl.value.customColumnName);
                    } else {
                        columnsFormGroup.addControl(
                            column.value,
                            this.formBuilder.group({
                                isSelected: new FormControl(false),
                                aggregateFunction: new FormControl(
                                    AggregationFunctionTypeEnum.NO_AGGREGATION
                                ),
                                customColumnName: new FormControl(''),
                            })
                        );
                    }
                }
            );
        });
    }

    getAllColumnListByTable(tableName: string) {
        return this.queryBuilderStore
            .getFetchedTableColumnDropdownOptions()
            .get(tableName);
    }

    public deleteTableWiseSelectedColumnsForm(
        tableWiseSelectedColumnsForm: FormGroup,
        controlName: string
    ) {
        tableWiseSelectedColumnsForm.removeControl(controlName);
    }
}
