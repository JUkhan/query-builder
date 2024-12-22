import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
//import { FuseConfirmationService } from '@streamstech/ui-sdk/fuse/services';
import { BehaviorSubject, debounceTime, Subject, takeUntil } from 'rxjs';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { QueryBuilderConstants } from '../utils/query-builder.constants';
import { QueryBuilderService } from '../utils/services/query-builder.service';
import { IDropdownData, OrderByColumn } from '../utils/interfaces';
import { OrderByOptionEnum } from '../utils/enums';

@Component({
    standalone:false,
    selector: 'app-order-by',
    templateUrl: './order-by.component.html',
    styleUrls: ['./order-by.component.scss'],
})
export class OrderByComponent implements OnInit {
    private destroy$ = new Subject<void>();
    alreadySelectedTableList$ = new BehaviorSubject<IDropdownData[]>([]);
    orderByForm!: FormGroup;
    orderTypes: IDropdownData[] = QueryBuilderConstants.ORDER_BY_OPTIONS;
    @Output() orderByConfigChanged = new EventEmitter();

    constructor(
        private formBuilder: FormBuilder,
        //private _fuseConfirmationService: FuseConfirmationService,
        private queryBuilderStore: QueryBuilderStore,
        public queryBuilderService: QueryBuilderService
    ) {
        this.orderByForm = this.formBuilder.group({
            orderByFormArray: this.formBuilder.array([]),
        });
    }
    isCard(): boolean {
        return ((this.orderByForm.get('orderByFormArray') as FormArray)?.length ?? 0) > 0;
    }
    ngOnInit(): void {
        this.initSelectedTableList();
        this.orderByForm.controls['orderByFormArray'].valueChanges
            .pipe(debounceTime(1000))
            .subscribe((data: any) => {
                this.orderByConfigChanged.emit(data);
            });
        const fullJsonData = this.queryBuilderStore.getFullJsonData(
            this.queryBuilderStore.getCurrentQueryIndex()
        );
        if (fullJsonData) {
            this.initOrderByFormData(fullJsonData);
        }
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
                this.getAlreadySelectedTableList(
                    res.selectedTablesMapList[res.currentQueryIndex]
                )
            );
        });
    }

    getAlreadySelectedTableList(selectedTablesMap: any): IDropdownData[] {
        if (!selectedTablesMap) return [];
        return Array.from(selectedTablesMap.values()).filter(
            (dropdownData: any) => dropdownData.value !== null
        ) as IDropdownData[];
    }

    private initOrderByFormData(fullJsonData: any) {
        const { orderByColumns } = fullJsonData;
        orderByColumns.forEach((orderByColumn: OrderByColumn) => {
            this.orderByFormArray.push(
                this.formBuilder.group({
                    tableName: [orderByColumn.tableName],
                    columnName: [orderByColumn.columnName],
                    orderType: [orderByColumn.orderType],
                })
            );
        });

        this.orderByConfigChanged.emit(orderByColumns);
    }

    get orderByFormArray(): FormArray {
        return this.orderByForm.get('orderByFormArray') as FormArray;
    }

    onSelectTableColumn(event: any, index: any) {
        this.orderByFormArray.at(index).get('columnName')?.setValue(event.value);
    }

    onSelectTable(event:any, index: number) {
        this.orderByFormArray.at(index).get('tableName')?.setValue(event.value);
    }

    onSelectOrderType(event:any, index: number) {
        this.orderByFormArray.at(index).get('orderType')?.setValue(event.value);
    }

    addOrderByColumn() {
        this.orderByFormArray.push(
            this.formBuilder.group({
                tableName: [''],
                columnName: [''],
                orderType: [OrderByOptionEnum.ASCENDING],
            })
        );
    }

    removeOrderByColumn(index: number) {
        /*const dialogRef = this.openDialog(
            QueryBuilderConstants.ORDER_BY_DELETE_CONFIRMATION_MSG
        );
        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                if (result === 'confirmed') {
                    this.orderByFormArray.removeAt(index);
                }
            });*/
            if(this.openDialog(QueryBuilderConstants.ORDER_BY_DELETE_CONFIRMATION_MSG)){
                this.orderByFormArray.removeAt(index);
            }
    }

    openDialog(msg: string) {
        /*return this._fuseConfirmationService.open({
            message: msg,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Yes',
                    color: 'warn',
                },
                cancel: {
                    show: true,
                    label: 'No',
                },
            },
            dismissible: true,
        });*/
        return confirm(msg);
    }
}
