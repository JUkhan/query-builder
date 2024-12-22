import { Injectable, ViewContainerRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable, map, filter } from 'rxjs';
import { Action, action$, dispatch } from './state';


@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  #drawer!: MatSidenav;
  #sidebarContainerRef!: ViewContainerRef;
  get drawer(): MatSidenav {
    return this.#drawer;
  }
  get sidebarContainerRef(): ViewContainerRef {
    return this.#sidebarContainerRef;
  }
  set sidebarWidth(width: number) {
    dispatch(new SidebarWidth(width));
  }
  set isBackdropOn(value: boolean) {
     dispatch(new SidebarBackdrop(value));
  }
  addDrawer(drawer: MatSidenav, container: ViewContainerRef): void {
    if (!this.#drawer) {
      this.#drawer = drawer;
      this.#sidebarContainerRef = container;
    }
  }
  open(): void {
    this.drawer.open();
  }
  close(): void {
    this.drawer.close();
  }
  setData(data: any, key=''): void {
    dispatch(new DataPassThroughSidebar(data, key));
  }
  getData(key=''): Observable<any> {
    return action$.isA(DataPassThroughSidebar).pipe(filter(it=>it.type===key), map(it=>it.data));
  }
  clearData(): void{
    dispatch('clearData');
  }
  openTableSidebarWithDynamicComponent(
    componentData: DynamicSidebarComponentData
  ): void {
    this.#sidebarContainerRef.clear();
    const ref = this.#sidebarContainerRef.createComponent<any>(componentData.componentRef);
    ref.instance.data = componentData.rowData;
    this.open();
  }
}

export class SidebarWidth implements Action {
  type: any;
  constructor(public width: number) { }
}
export class DataPassThroughSidebar implements Action {
  constructor(public data: any, public type: any) { }
}

export class SidebarBackdrop implements Action {
  type: any;
  constructor(public isBackdropOn: boolean) { }
}
export interface DynamicSidebarComponentData {
  componentRef: any;
  rowData: any;
}
