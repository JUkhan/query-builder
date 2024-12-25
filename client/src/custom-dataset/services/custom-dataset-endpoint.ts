import {Injectable} from '@angular/core'
import {environment} from '../../environment'
@Injectable({
    providedIn: 'root',
})
export class CustomDatasetApiEndpoints {
    public readonly saveCustomDatasetUrl =
        environment.coreApiUrl + 'CustomDataset/Insert';
    public readonly updateCustomDatasetUrl =
        environment.coreApiUrl + 'CustomDataset/Update';
        public readonly deleteCustomDatasetUrl =
        environment.coreApiUrl + 'CustomDataset/Delete';
    public readonly getTableColumnsUrl =
        environment.coreApiUrl + 'Table/GetTableColumns';
    public readonly getCustomDatasetUrl =
        environment.coreApiUrl + 'CustomDataSet/GetAll';
    public readonly getCustomDatasetByIdUrl =
        environment.coreApiUrl + 'CustomDataset/GetById';
    public readonly getTableListUrl =
        environment.coreApiUrl + 'CustomDataSet/GetTableList';
        
    public readonly getCustomDatasetColumnsUrl =
        environment.coreApiUrl + 'CustomDataSet/GetColumnList';
    public readonly getColumnListWithTypeUrl =
        environment.coreApiUrl + 'CustomDataSet/GetColumnListWithType';
    public readonly getPreviewDataUrl =
        environment.coreApiUrl + 'CustomDataSet/GetPreviewData';
    public readonly getJsonUrl =
        environment.coreApiUrl + 'CustomDataSet/GetCustomDatasetSnapShotAsJson';
    public readonly uploadSurveyJSONData =
        environment.coreApiUrl + 'CustomDataSet/upload-json';
    public readonly uploadCustomDataSetJsonData =
        environment.coreApiUrl +
        'CustomDataSet/UploadCustomDatasetSnapShotAsJson';
}