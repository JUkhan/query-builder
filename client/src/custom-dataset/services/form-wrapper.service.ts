import { ApiService } from '../../services';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';

@Injectable({
    providedIn: 'root',
})
export class FormWrapperService {
    constructor(private apiService: ApiService) {}
    getFormConfiguration(apiEndpoint: string) {
        //console.log(apiEndpoint);
        return this.apiService.get(apiEndpoint);
    }
    getFormData(apiEndpoint: string) {
        return this.apiService.get(apiEndpoint);
    }
    getComponentData(source: string) {
        //console.log(environment.coreApiUrl + source);
        return this.apiService.get(environment.coreApiUrl + source);
    }
    getDropdownData(source: string) {
        //console.log(environment.coreApiUrl + source);
        return this.apiService.get(environment.coreApiUrl + source);
    }
    postData(source: string, data: any) {
        return this.apiService.post(source, data);
    }
    updateData(source: string, data: any) {
        return this.apiService.post(source, data);
    }
    getDataForRequestPayload(apiEndpoints: string, data: any) {
        return this.apiService.post(
            environment.coreApiUrl + apiEndpoints,
            data
        );
    }
}
