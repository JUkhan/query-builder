import { HttpClient } from '@angular/common/http';
import { Injectable, Input } from '@angular/core';
import { SurveyEndpoints } from 'app/config/apiEndpoints';
import { WrapperService } from 'app/shared/services/wrapper.service';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TableService {
    constructor(
        private _httpClient: HttpClient,
        private wrapperService: WrapperService
    ) {}

    formStatus(rowData: any) {
        return this._httpClient.post(
            SurveyEndpoints.updateSurveyFormStatusUrl,
            rowData
        );
    }
    public getSaveLanguageText(payLoad: any) {
        return this._httpClient.post(
            SurveyEndpoints.updateSurveyFormStatusUrl,
            payLoad
        );
    }

    public getupdatedTable() {
        return this._httpClient
            .get(SurveyEndpoints.getPermittedActionsAndMenueUrl)
            .subscribe((res) => {});
    }

    getSingleAttribute(selectedOption: any) {
        const url = `${SurveyEndpoints.getDataElementBaseSystemTextUrl}?textId=${selectedOption.TextId}`;
        return this._httpClient.get(url);
    }

    getSingleAttributeGroup(selectedOption: any) {
        const url = `${SurveyEndpoints.getDataElementsByGroupIdUrl}?dataElementGroupId=${selectedOption.Id}`;
        return this._httpClient.get(url);
    }

    getAttribute(): Observable<any> {
        return this._httpClient.get(SurveyEndpoints.dataElementBaseUrl);
    }
    SaveSurveyFormPermissions(surveyPermissionPayload: any) {
        return this._httpClient.post(
            SurveyEndpoints.saveSurveyFormPermissionUrl,
            surveyPermissionPayload
        );
    }

    getAttributeGroup(): Observable<any> {
        return this._httpClient.get(SurveyEndpoints.dataElementGroupeUrl);
    }

    getSelectedRowData(formId: string): Observable<any> {
        return this._httpClient.get(
            `${SurveyEndpoints.getSelectedUserGroupsUrl}?formId=${formId}`
        );
    }

    getSingleSelectedRowData(formId: string): Observable<any> {
        return this._httpClient.get(
            `${SurveyEndpoints.getSurveyFormMetaDataUrl}?formId=${formId}`,
            {}
        );
    }

    UploadSurveyData(surveyPermissionPayload: any) {
        return this._httpClient.post(
            SurveyEndpoints.uploadSurveyExcelData,
            surveyPermissionPayload
        );
    }
}
