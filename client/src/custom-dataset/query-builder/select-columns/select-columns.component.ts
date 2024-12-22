import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IDropdownData } from '../utils/interfaces';
import { QueryBuilderService } from '../utils/services/query-builder.service';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { QueryBuilderConstants } from '../utils/query-builder.constants';

@Component({
    standalone:false,
    selector: 'app-select-columns',
    templateUrl: './select-columns.component.html',
    styleUrls: ['./select-columns.component.scss'],
})
export class SelectColumnsComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<void>();
    alreadySelectedTableList$ = new BehaviorSubject<IDropdownData[]>([]);
    aggregateFunctionList: IDropdownData[] =
        QueryBuilderConstants.AGGREGATE_FUNCTIONS;
    @Input() tableWiseSelectedColumnsForm!: FormGroup;
    constructor(
        private queryBuilderStore: QueryBuilderStore,
        private queryBuilderService: QueryBuilderService
    ) {}

    ngOnInit(): void {
        this.initSelectedTableList();
    }
    typeCheck(val: any){
        return val;
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initSelectedTableList() {
        this.queryBuilderStore.QueryBuilderState$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((res) => {
            this.alreadySelectedTableList$.next(
                this.queryBuilderService.getAlreadySelectedTableList(
                    res.selectedTablesMapList[res.currentQueryIndex],
                    this.tableWiseSelectedColumnsForm
                )
            );
        });
    }

    onCheckboxClick(tableName: string, column: string, event: any) {
        this.tableWiseSelectedColumnsForm
            .get(tableName)
            ?.get(column)
            ?.get('isSelected')
            ?.setValue(event.checked);
    }

    onSelectAggregateFunction(
        aggregateFunction: IDropdownData,
        tableName: string,
        columnName: string
    ) {
        this.tableWiseSelectedColumnsForm
            .get(tableName)
            ?.get(columnName)
            ?.get('aggregateFunction')
            ?.setValue(aggregateFunction.value);
    }

    toggleSelectAllColumns(event: any, tableName: string): void {
        const columns = this.getTableWiseColumnList(tableName);
        const formGroup = this.tableWiseSelectedColumnsForm.get(tableName);
        
        if (!formGroup) return;

        columns.forEach((col) => {
            formGroup.get(col)?.get('isSelected')?.setValue(event.checked);
        });
    }

    areAllColumnsSelected(tableName: string): boolean {
        const columns = this.getTableWiseColumnList(tableName);
        const formGroup = this.tableWiseSelectedColumnsForm.get(tableName);
        
        if (!formGroup) return false;

        return columns.every(
            (col) => formGroup.get(col)?.get('isSelected')?.value ?? false
        );
    }

    protected getTableWiseColumnList(tableName: string) {
        return Object.keys(
            this.tableWiseSelectedColumnsForm.get(tableName)?.value ?? {}
        );
    }
}
