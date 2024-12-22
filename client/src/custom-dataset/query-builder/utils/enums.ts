export enum ConditionTypeEnum {
    NORMAL_CONDITION = 'normal',
    GROUP_CONDITION = 'group',
}

export enum CONDITION_OPERATORS_ENUM {
    EQUAL = '=',
    NOT_EQUAL = '!=',
    GREATER_THAN = '>',
    LESS_THAN = '<',
    GREATER_THAN_EQUAL = '>=',
    LESS_THAN_EQUAL = '<=',
    LIKE = 'LIKE',
    IN = 'IN',
    NOT_IN = 'NOT IN',
    IS_NULL = 'is null',
    IS_NOT_NULL = 'is not null',
}

export enum CaseConditionTypeEnum {
    WHEN = 'when',
    ELSE = 'else',
}

export enum CaseResultValueTypeEnum {
    TABLE_COLUMN = 'tableColumn',
    CUSTOM = 'custom',
}

export enum AggregationFunctionTypeEnum {
    NO_AGGREGATION = 'NA',
    COUNT = 'COUNT',
    SUM = 'SUM',
    MIN = 'MIN',
    MAX = 'MAX',
}

export enum OrderByOptionEnum {
    ASCENDING = 'ASC',
    DESCENDING = 'DESC',
}

export enum DotEnum {
    DOT = '.',
    REPLACED_VALUE_OF_DOT = '_dot_',
}
