import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams } from 'ag-grid-community';
import { Subject, Subscription, debounceTime, distinctUntilChanged, filter, startWith, takeUntil } from 'rxjs';
import { ApiService } from '../services/api.service';
import { Action, action$, dispatch } from '../services/state';
import { toSnakeCase } from './case-conversion';


@Component({
    selector: 'grid-set-filter',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    template: `
      <div class="container">
        <mat-form-field class="w-full">
            <input matInput placeholder="search" [formControl]="search">
            <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <section class="example-section">
            <span class="example-list-section">
                <mat-checkbox class="example-margin"
                            [checked]="allChecked"
                            [indeterminate]="someChecked()"
                            (change)="setAll($event.checked)">
                All Checked
                </mat-checkbox>
            </span>
            <div class="checkboxes">
                <ul>
                <li class="pt-1" *ngFor="let item of uniqueValues">
                    <mat-checkbox [(ngModel)]="item.checked"
                                (ngModelChange)="updateAllChecked()">
                    {{item.label}}
                    </mat-checkbox>
                </li>
                </ul>
            </div>
        </section>
        <div class="flex justify-end">
           <button mat-button color="primary" (click)="resetAll()">Reset</button>
            <button mat-button color="warn" (click)="updateFilter()">Apply</button>
        </div>
      </div>
    `,
    styles: [`
    .container{
            padding:8px;
            min-width:250px;
            max-height:450px;
            overflow-y:hidden;
        }
    .container ul {
        list-style-type: none;
        padding: none;
        margin:none;
    }
    .checkboxes{
        max-height:320px;
        overflow-y: auto;
    }
    `]
})
export class SetFilterComponent implements IFilterAngularComp, OnDestroy {
    params!: IFilterParams;
    year: string = 'All';
    uniqueValues!: ResourceModel[];
    allChecked: boolean = false;
    search = new FormControl('');
    sub!: Subscription;
    private destroy$ = new Subject<void>();
    constructor(private apiService: ApiService) {
    }
    agInit(params: any): void {
        this.params = params;
        let resourceKey=null;
        if(params.colDef.cellRendererParams && params.colDef.cellRendererParams.resourceKey){
            resourceKey = params.colDef.cellRendererParams.resourceKey;
        }
        let tableName = toSnakeCase(params.tableName);
        if (tableName === 'user') {
            tableName = `"${tableName}"`;
        }
        const columnName = toSnakeCase(params.columnName);
        if (!(params.tableName && params.columnName)) { return; }
        this.search.valueChanges.pipe(
            takeUntil(this.destroy$),
            debounceTime(320),
            distinctUntilChanged(),
            startWith('')
        ).subscribe((val: any) => {
            if (resourceKey) {
                dispatch(new RequestForResourceData(resourceKey, val));
            }else if(typeof params.dataCallback ==='function'){
                params.dataCallback(columnName, val).subscribe((res: any)=>{
                  this.uniqueValues = res; 
                });
            }
             else {
                this.getColumnValues(tableName, columnName, val);
            }
        });
        if (resourceKey) {
            action$.isA(ReceivingResourceData)
                .pipe(takeUntil(this.destroy$), filter(req => req.resourceKey === resourceKey))
                .subscribe(res => this.uniqueValues = res.data);
        }
    }

    updateAllChecked(): void {
        this.allChecked = this.uniqueValues != null && this.uniqueValues.every(t => t.checked);
    }
    setAll(completed: boolean): void {
        this.allChecked = completed;
        if (this.uniqueValues == null) {
            return;
        }
        this.uniqueValues.forEach(t => (t.checked = completed));
    }
    someChecked(): boolean {
        if (this.uniqueValues == null) {
            return false;
        }
        return !!this.uniqueValues.find(t => t.checked) && !this.allChecked;
    }
    isFilterActive(): boolean {
        return this.uniqueValues.filter(t => t.checked).length > 0;
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
        const checkedList = this.uniqueValues.filter(t => t.checked).map(it => it.value);
        const key = this.params.colDef.field as any;
        if (checkedList.length) {
            return checkedList.includes(params.data[key]);
        }
        return true;
    }

    getModel(): string[] {
        return this.uniqueValues.filter(t => t.checked).map(it => it.value);
    }

    setModel(model: any): void {
    }

    updateFilter(): void {
        this.params.filterChangedCallback();
    }
    resetAll(): void {
        this.search.patchValue('');
        this.setAll(false);
        this.updateFilter();
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    private getColumnValues(tableName: string, columnName: string, search: string): void {
        this.apiService.get(`Table/GetColumnUniqueValues?tableName=${tableName}&columnName=${columnName}&search=${search}`)
            .pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
                this.uniqueValues = res.data.map((el: ResourceModel) => {
                    el.label = el.value;
                    return el;
                });
            });
    }
}

//interface Item { value: string; checked: boolean }
export interface ResourceModel {
    value: any;
    label: any;
    checked: boolean;
}
export class RequestForResourceData implements Action {
    type: any;
    constructor(public resourceKey: string, public search: string) { }
}
export class ReceivingResourceData implements Action {
    type: any;
    constructor(public resourceKey: string, public data: ResourceModel[]) { }
}
