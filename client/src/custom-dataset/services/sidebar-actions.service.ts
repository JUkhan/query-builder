import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISidebarAction } from '../interfaces/SidebarAction';

@Injectable({
    providedIn: 'root',
})
export class SidebarActionsService {
    private defaultSidebarAction: ISidebarAction = {
        sideBarOpenStatus: false,
        dataSetId: '',
        payload: {}
      };
    private isSideBarOpenSubject$ = new BehaviorSubject<boolean>(false);
    private dataSetIdSubject$ = new BehaviorSubject<string>('');
    private excelExportPayloadSubject$ = new BehaviorSubject<object>({});
    private sidebarActionsSubject$ = new BehaviorSubject<ISidebarAction>(this.defaultSidebarAction);
    constructor() {}

    setSideBarOpenStatus(sideBarOpenStatus: boolean) {
        this.isSideBarOpenSubject$.next(sideBarOpenStatus);
    }
    getSideBarOpenStatus() {
        return this.isSideBarOpenSubject$.asObservable();
    }
    setDataSetId(dataSetId: string) {
        this.dataSetIdSubject$.next(dataSetId);
    }
    getDataSetId() {
        return this.dataSetIdSubject$.asObservable();
    }
    setExcelExportPayload(payload: object) {
        this.excelExportPayloadSubject$.next(payload);
    }
    getExcelExportPayload() {
        return this.excelExportPayloadSubject$.asObservable();
    }
    setsidebarActions(sidebarAction: ISidebarAction) {
        this.sidebarActionsSubject$.next(sidebarAction);
    }
    getsidebarActions() {
        return this.sidebarActionsSubject$.asObservable();
    }
}
