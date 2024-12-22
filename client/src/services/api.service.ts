import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    HttpClient,
    HttpContext,
    HttpHeaders,
    HttpParams,
} from '@angular/common/http';

type ApiOptions = {
    headers?:
        | HttpHeaders
        | {
        [header: string]: string | string[];
    };
    context?: HttpContext;
    observe?: 'body';
    params?:
        | HttpParams
        | {
        [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
    };
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
};

type DeleteApiOptions = ApiOptions & {
    body?: any | null;
};

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    
    constructor(private http: HttpClient) {
        
    }

    get<T>(url: string, options?: ApiOptions): Observable<T> {
        return this.http.get<T>(this.getUrl(url), options);
    }

    post<T>(url: string, payload?: any, options?: ApiOptions): Observable<T> {
        return this.http.post<T>(this.getUrl(url), payload, options);
    }

    delete<T>(url: string, options?: DeleteApiOptions): Observable<T> {
        return this.http.delete<T>(this.getUrl(url), options);
    }
    private getUrl(url: string): string{
        return url;
    }
}
