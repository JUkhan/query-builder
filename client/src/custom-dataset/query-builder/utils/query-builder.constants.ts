import {
    AggregationFunctionTypeEnum,
    CaseResultValueTypeEnum,
    CONDITION_OPERATORS_ENUM,
    OrderByOptionEnum,
} from './enums';
import { IDropdownData } from './interfaces';

export abstract class QueryBuilderConstants {
    static readonly QUERY_DELETE_CONFIRMATION_MSG: string =
        'Are you sure you want to remove this query?';
    static readonly JOIN_TABLE_DELETE_CONFIRMATION_MSG: string =
        'Are you sure you want to remove this table from join array?';
    static readonly CASE_DELETE_CONFIRMATION_MSG: string =
        'Are you sure you want to remove this case?';
    static readonly CALCULATED_COLUMN_DELETE_CONFIRMATION_MSG: string =
        'Are you sure you want to remove this calculated column?';
    static readonly ORDER_BY_DELETE_CONFIRMATION_MSG: string =
        'Are you sure you want to remove this order by condition?';
    static readonly SELECT_SOURCE_TABLE_WARNING_MSG: string =
        'Please select source table.';
    static readonly INVALID_JOIN_TABLE_WARNING_MSG: string =
        'Please collect all necessary data and add at least one join condition for each join table.';
    static readonly INVALID_FILTER_CONDITION_WARNING_MSG: string =
        'Please collect all necessary data';
    static readonly SELECT_COLUMNS_WARNING_MSG: string =
        'Please select at least one column. If you have an aggregate column please enable "Apply Group By"';
    static readonly INVALID_ORDER_BY_WARNING_MSG: string =
        'Please select table, column and order type for each row';
    static readonly COLLECT_REQUIRED_DATA_WARNING_MSG: string =
        'Please collect required data.';
    static readonly EMPTY_SUB_QUERY_WARNING_MSG: string =
        'Please add at least one query.';
    static readonly INVALID_QUERY_WARNING_MSG: string =
        'Please add valid queries.';
    static readonly DUPLICATE_COL_NAME_WARNING_MSG: string =
        'You have duplicate column names';
    static readonly INVALID_CALCULATED_COL_WARNING_MSG: string =
        'Please add valid calculated columns';
    static readonly INVALID_CASE_COL_WARNING_MSG: string =
        'Please add valid case';
    static readonly SOMETHING_WRONG_MSG: string =
        'Jahid, This message should never be displayed!';

    public static readonly JOIN_TYPES: IDropdownData[] = [
        {
            value: 'JOIN',
            label: 'JOIN',
        },
        {
            value: 'LEFT JOIN',
            label: 'LEFT JOIN',
        },
        {
            value: 'RIGHT JOIN',
            label: 'RIGHT JOIN',
        },
    ];

    public static readonly RESULT_TYPES: IDropdownData[] = [
        {
            value: CaseResultValueTypeEnum.TABLE_COLUMN,
            label: 'Table Column Value',
        },
        {
            value: CaseResultValueTypeEnum.CUSTOM,
            label: 'Custom Value',
        },
    ];

    static readonly RELATION_OPERATORS: IDropdownData[] = [
        { label: 'Equal', value: CONDITION_OPERATORS_ENUM.EQUAL },
        { label: 'Not Equal', value: CONDITION_OPERATORS_ENUM.NOT_EQUAL },
        { label: 'Greater Than', value: CONDITION_OPERATORS_ENUM.GREATER_THAN },
        { label: 'Less Than', value: CONDITION_OPERATORS_ENUM.LESS_THAN },
        {
            label: 'Greater Than or Equal',
            value: CONDITION_OPERATORS_ENUM.GREATER_THAN_EQUAL,
        },
        {
            label: 'Less Than or Equal',
            value: CONDITION_OPERATORS_ENUM.LESS_THAN_EQUAL,
        },
    ];

    static readonly CONDITION_OPERATORS: IDropdownData[] = [
        ...this.RELATION_OPERATORS,
        { label: 'LIKE', value: CONDITION_OPERATORS_ENUM.LIKE },
        { label: 'IN', value: CONDITION_OPERATORS_ENUM.IN },
        { label: 'NOT IN', value: CONDITION_OPERATORS_ENUM.NOT_IN },
        { label: 'Is Null', value: CONDITION_OPERATORS_ENUM.IS_NULL },
        { label: 'Is Not Null', value: CONDITION_OPERATORS_ENUM.IS_NOT_NULL },
    ];

    static readonly AGGREGATE_FUNCTIONS: IDropdownData[] = [
        {
            label: 'No Aggregation',
            value: AggregationFunctionTypeEnum.NO_AGGREGATION,
        },
        { label: 'COUNT', value: AggregationFunctionTypeEnum.COUNT },
        { label: 'SUM', value: AggregationFunctionTypeEnum.SUM },
        { label: 'MIN', value: AggregationFunctionTypeEnum.MIN },
        { label: 'MAX', value: AggregationFunctionTypeEnum.MAX },
    ];

    static readonly ORDER_BY_OPTIONS: IDropdownData[] = [
        { label: 'Ascending', value: OrderByOptionEnum.ASCENDING },
        { label: 'Descending', value: OrderByOptionEnum.DESCENDING },
    ];
}
