import { Injectable } from '@angular/core';
import { CustomDatasetApiEndpoints } from './custom-dataset-endpoint';

import { ApiService } from '../../services';
import { BehaviorSubject, Observable } from 'rxjs';

export enum OperationType {
    INSERT = 'insert',
    UPDATE = 'update',
    DELETE = 'delete',
    GET = 'get',
    GETALL = 'getall',
    FILTEREDGETALL = 'GetAllWithFilter',
}

@Injectable({
    providedIn: 'root',
})
export class CustomDatasetService {
    private dataSetNameSubject$ = new BehaviorSubject<string>('');
    private dataSetIdParamsSubject$ = new BehaviorSubject<string>('');
    private queryTypeSubject$ = new BehaviorSubject<string>('');
    private webQuerySubject$ = new BehaviorSubject<string>('');

    constructor(
        private apiService: ApiService,
        private apiEndPoints: CustomDatasetApiEndpoints
    ) {}

    setDataSetIdParams(dataSetId: string) {
        this.dataSetIdParamsSubject$.next(dataSetId);
    }

    getDataSetIdParams() {
        return this.dataSetIdParamsSubject$.asObservable();
    }

    setDataSetName(dataSetName: string) {
        this.dataSetNameSubject$.next(dataSetName);
    }

    getDataSetName() {
        return this.dataSetNameSubject$.asObservable();
    }

    setQueryType(queryType: any) {
        this.queryTypeSubject$.next(queryType);
    }

    getQueryType() {
        return this.queryTypeSubject$.asObservable();
    }

    setWebQuery(webQuery: any) {
        this.webQuerySubject$.next(webQuery);
    }

    getWebQuery() {
        return this.webQuerySubject$.asObservable();
    }

    public getCustomDatasetById(id: string) {
        return this.apiService.get(
            `${this.apiEndPoints.getCustomDatasetByIdUrl}/${id}`
        );
    }

    public saveCustomDataset(payload: any, operationType: string) {
        return this.apiService.post(
            OperationType.INSERT === operationType
                ? this.apiEndPoints.saveCustomDatasetUrl
                : this.apiEndPoints.updateCustomDatasetUrl,
            payload
        );
    }

    public getTableColumns(schemaName: string, tableName: string) {
        return this.apiService.get(this.apiEndPoints.getTableColumnsUrl, {
            params: {
                schema: schemaName,
                tableName: tableName,
            },
        });
    }

    public getCustomDataset() {
        return this.apiService.get(this.apiEndPoints.getCustomDatasetUrl);
    }

    public getTableList():Observable<{label:string, value:string}[]> {
        return this.apiService.get(this.apiEndPoints.getTableListUrl);
    }

    public getAll():Observable<any[]> {
        return this.apiService.get(this.apiEndPoints.getCustomDatasetUrl);
    }

    public getTableColumnList(tableName: string) {
        return this.apiService.get(
            `${this.apiEndPoints.getCustomDatasetColumnsUrl}?tableName=${tableName}`
        );
    }

    public getTableColumnListWithType(tableName: string) {
        return this.apiService.get(
            `${this.apiEndPoints.getColumnListWithTypeUrl}?tableName=${tableName}`
        );
    }

    public getPreviewData(query: string) {
        return this.apiService.post(this.apiEndPoints.getPreviewDataUrl, {
            query: query,
        });
    }

    public downloadJson(customDatasetId: string) {
        return this.apiService.get(
            `${this.apiEndPoints.getJsonUrl}/${customDatasetId}`
        );
    }

    UploadJsonData(surveyPermissionPayload: any) {
        return this.apiService.post(
            this.apiEndPoints.uploadCustomDataSetJsonData,
            surveyPermissionPayload
        );
    }
}
