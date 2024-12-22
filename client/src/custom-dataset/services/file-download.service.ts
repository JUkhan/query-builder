import { ApiService } from '../../services';
import { FileDownloadEndpoints } from './fileDownloadEndpoints';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';

@Injectable({
    providedIn: 'root',
})
export class FileDownloadService {
    selectedColumns: any[] = [];
    constructor(
        private http: HttpClient,
        private apiService: ApiService,
        private apiEndPoints: FileDownloadEndpoints
    ) {}

    downloadFile(endpoints: string) {
        return this.http.get(environment.coreApiUrl + endpoints, {
            responseType: 'blob',
        });
    }

    getFileDownloadingStatus(
        pageNumber: any,
        pageSize: any,
        surveyFormId: any
    ) {
        return this.apiService.get(this.apiEndPoints.getFileListUrl, {
            params: {
                pageNumber,
                pageSize,
                typeWiseId: surveyFormId,
            },
        });
    }
    updateDownloadFileName(payload: any) {
        return this.apiService.post(
            this.apiEndPoints.updateDownloadFileNameUrl,
            payload
        );
    }

    deleteFile(id: string) {
        return this.apiService.get(this.apiEndPoints.deleteFileUrl, {
            params: {
                id,
            },
        });
    }

    public exportExcelData(payload: any) {
        return this.apiService.post(
            this.apiEndPoints.exportExcelDataUrl,
            payload
        );
    }
}
