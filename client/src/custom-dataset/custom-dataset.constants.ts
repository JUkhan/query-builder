export abstract class CustomDatasetConstants {
    public static readonly DATASET_ADD_TITLE: string = 'New Custom Dataset';
    public static readonly DATASET_EDIT_TITLE: string = 'Edit Custom Dataset';
    public static readonly DATASET_FORM_FIELDS: string[] = [
        'DatasetName',
        'WebQuery',
        'MobileQuery',
        'IsQueryForMobile',
        'IsDataDownloadableForMobile',
        'QueryType',
        'QueryCreationMode',
        'IsUsedAsReference',
        'ColumnName',
        'TableName',
    ];
    public static QUERY_CREATION_MODES: IDropdownData[] = [
        {
            value: 'custom',
            label: 'Custom Query',
        },
        {
            value: 'builder',
            label: 'Query Builder',
        },
    ];
}

export enum QueryCreationModeEnum {
    CUSTOM = 'custom',
    BUILDER = 'builder',
}

export interface IDropdownData {
    value: string;
    label: string;
}

export enum UnionTypeEnum {
    UNION = 'UNION',
    UNION_ALL = 'UNION ALL',
}
