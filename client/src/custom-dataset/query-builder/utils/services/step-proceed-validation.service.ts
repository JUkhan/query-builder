import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UtilsService } from './utils.service';
import { QueryBuilderConstants } from '../query-builder.constants';
import {
    AggregationFunctionTypeEnum,
    CONDITION_OPERATORS_ENUM,
    ConditionTypeEnum,
} from '../enums';
import { QueryBuilderJSON } from '../interfaces';
import { QueryBuilderService } from './query-builder.service';

@Injectable({
    providedIn: 'root',
})
export class StepProceedValidationService {
    constructor(
        private utilService: UtilsService,
        private queryBuilderService: QueryBuilderService
    ) {}

    public canProceedToNextStep(
        stepIndex: number,
        fullJsonData: QueryBuilderJSON
    ): boolean {
        const {
            formTableName,
            joinConfigs,
            filterConditions,
            selectedTableToColumnsMap,
            applyGroupBy,
            calculatedColumns,
            selectCases,
            orderByColumns,
        } = fullJsonData;
        switch (stepIndex) {
            case 0:
                return this.isSourceFormSelected(formTableName);
            case 1:
                return this.isJoinConditionValid(joinConfigs);
            case 2:
                return this.isFilterConditionValid(filterConditions);
            case 3:
                return (
                    this.isColumnSelectionValid(
                        selectedTableToColumnsMap,
                        applyGroupBy
                    ) &&
                    this.isCalculatedColumnsValid(calculatedColumns) &&
                    this.isSelectCaseValid(selectCases) &&
                    !this.hasDuplicateColumnName(
                        selectedTableToColumnsMap,
                        calculatedColumns,
                        selectCases
                    )
                );
            case 4:
                return this.isOrderByValid(orderByColumns);
            default:
                return true;
        }
    }

    public getProceedRestrictionWarningMessage(
        stepIndex: number,
        fullJsonData: QueryBuilderJSON
    ): string {
        switch (stepIndex) {
            case 0:
                return QueryBuilderConstants.SELECT_SOURCE_TABLE_WARNING_MSG;
            case 1:
                return QueryBuilderConstants.INVALID_JOIN_TABLE_WARNING_MSG;
            case 2:
                return QueryBuilderConstants.INVALID_FILTER_CONDITION_WARNING_MSG;
            case 3:
                return this.invalidColumnSelectionWarningMessage(fullJsonData);
            case 4:
                return QueryBuilderConstants.INVALID_ORDER_BY_WARNING_MSG;
            default:
                return QueryBuilderConstants.SOMETHING_WRONG_MSG;
        }
    }

    private invalidColumnSelectionWarningMessage(
        fullJsonData: QueryBuilderJSON
    ): string {
        const { selectedTableToColumnsMap, calculatedColumns, selectCases } =
            fullJsonData;
        if (
            this.hasDuplicateColumnName(
                selectedTableToColumnsMap,
                calculatedColumns,
                selectCases
            )
        )
            return QueryBuilderConstants.DUPLICATE_COL_NAME_WARNING_MSG;
        else if (!this.isCalculatedColumnsValid(calculatedColumns))
            return QueryBuilderConstants.INVALID_CALCULATED_COL_WARNING_MSG;
        else if (!this.isSelectCaseValid(selectCases))
            return QueryBuilderConstants.INVALID_CASE_COL_WARNING_MSG;
        else return QueryBuilderConstants.SELECT_COLUMNS_WARNING_MSG;
    }

    private isSourceFormSelected(formTableName: any): boolean {
        return formTableName && formTableName !== '-1';
    }

    private isJoinConditionValid(joinConditions: any): boolean {
        return joinConditions.every(
            (item: any) =>
                item.joinType &&
                item.rightTableName &&
                item.leftTableName &&
                Array.isArray(item.joinConditionFormArray) &&
                item.joinConditionFormArray.length > 0 &&
                item.joinConditionFormArray.every(
                    (condition: any) =>
                        condition.leftColumn &&
                        condition.operator &&
                        condition.rightColumn
                )
        );
    }

    private isFilterConditionValid(data: any): boolean {
        if (Object.keys(data).length === 0) return true;
        const validateArray = (rules: any[]): boolean => {
            return rules.every((rule) => {
                if (rule.type === ConditionTypeEnum.NORMAL_CONDITION) {
                    return (
                        rule.leftTableName &&
                        rule.leftTableColumn &&
                        rule.operator &&
                        (rule.operator === CONDITION_OPERATORS_ENUM.IS_NULL ||
                            rule.operator ===
                                CONDITION_OPERATORS_ENUM.IS_NOT_NULL ||
                            rule.specificValue)
                    );
                } else if (
                    rule.type === ConditionTypeEnum.GROUP_CONDITION &&
                    Array.isArray(rule.rulesFormArray) &&
                    rule.rulesFormArray.length > 0
                ) {
                    return this.isFilterConditionValid(rule);
                }
                return false;
            });
        };

        return (
            data.condition &&
            Array.isArray(data.rulesFormArray) &&
            validateArray(data.rulesFormArray)
        );
    }

    private isColumnSelectionValid(
        selectedTableToColumnsMap: any,
        applyGroupBy:any
    ): boolean {
        let isAggregateWithoutGroupBy = false;

        const hasSelectedColumns = Object.values(
            selectedTableToColumnsMap
        ).some((table: any) =>
            Object.values(table).some((column: any) => {
                const isSelected = column.isSelected;
                const hasAggregateFunction =
                    column.aggregateFunction !==
                    AggregationFunctionTypeEnum.NO_AGGREGATION;

                if (isSelected && hasAggregateFunction && !applyGroupBy) {
                    isAggregateWithoutGroupBy = true;
                }

                return isSelected;
            })
        );
        return hasSelectedColumns && !isAggregateWithoutGroupBy;
    }

    private isCalculatedColumnsValid(calculatedColumns: any): boolean {
        return calculatedColumns.every(
            (column: any) => column.columnName && column.expression
        );
    }

    // TODO:[Jahid] => need more validation for this function
    private isSelectCaseValid(selectCases: any): boolean {
        return selectCases.every((column: any) => column.columnName);
    }

    private hasDuplicateColumnName(
        selectedTableToColumnsMap: any,
        calculatedColumns: any,
        selectCases: any
    ) {
        let selectedColumnNames: string[] = [];
        const tableWiseSelectedColumnsMap =
            this.queryBuilderService.getSelectedColumnListTableMap(
                selectedTableToColumnsMap
            );
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
                const columnName = hasCustomName
                    ? column.customColumnName
                    : isAggregateColumn ||
                      columnCount.get(column.columnName)! > 1
                    ? `${tableName}_${column.columnName}`
                    : column.columnName;
                selectedColumnNames.push(columnName);
            });
        });
        calculatedColumns.forEach((column: any) => {
            selectedColumnNames.push(column.columnName);
        });
        selectCases.forEach((selectCase: any) => {
            selectedColumnNames.push(selectCase.columnName);
        });

        //if the size of the Set is less than the length of the array, there are duplicates.
        const hasDuplicates =
            new Set(selectedColumnNames).size !== selectedColumnNames.length;
        return hasDuplicates;
    }

    private isOrderByValid(orderByColumns: any): boolean {
        const isValid = orderByColumns.every(
            (column: any) =>
                column.tableName && column.columnName && column.orderType
        );
        if (isValid) {
            this.utilService.initSelectClauseGeneration();
        }
        return isValid;
    }
}
