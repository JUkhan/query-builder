import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
//import { FuseConfirmationService } from '@streamstech/ui-sdk/fuse/services';
import { Subject, BehaviorSubject, debounceTime, takeUntil, map } from 'rxjs';
import { CustomDatasetService } from '../../services/custom-dataset.service';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { IDropdownData } from '../utils/interfaces';
import { QueryBuilderConstants } from '../utils/query-builder.constants';
import { QueryBuilderService } from '../utils/services/query-builder.service';
import { DotEnum } from '../utils/enums';

@Component({
    standalone:false,
    selector: 'app-join-condition',
    templateUrl: './join-condition.component.html',
    styleUrls: ['./join-condition.component.scss'],
})
export class JoinConditionComponent implements OnInit, OnDestroy, OnChanges {
    private destroy$ = new Subject<void>();
    selectedTablesMap: Map<string, IDropdownData> = new Map<
        string,
        IDropdownData
    >();
    @Input() tableList: IDropdownData[] = [];
    @Input() tableWiseSelectedColumnsForm!: FormGroup;
    @Output() configurationChanged = new EventEmitter();
    protected panelOpenState: boolean = false;
    joinTableForm;
    joinTypes: IDropdownData[] = QueryBuilderConstants.JOIN_TYPES;
    operators: IDropdownData[] = QueryBuilderConstants.RELATION_OPERATORS;

    tableColumnDataBehaviorSubjectList:BehaviorSubject<any>[] = [];
    additionalColumnConfigIndex = -1;
    alreadySelectedTableList$ = new BehaviorSubject<IDropdownData[]>([]);

    constructor(
        private customDatasetService: CustomDatasetService,
        //private _fuseConfirmationService: FuseConfirmationService,
        private formBuilder: FormBuilder,
        private queryBuilderStore: QueryBuilderStore,
        public queryBuilderService: QueryBuilderService
    ) {
        this.joinTableForm = this.formBuilder.group({
            joinTableFormArray: this.formBuilder.array([]),
        });
    }
    isCard():boolean{
        //@ts-ignore
        return this.joinTableForm.get('joinTableFormArray')?.length
    }
    ngOnChanges(changes: SimpleChanges): void {}

    ngOnInit(): void {
        this.initSelectedData();
        this.joinTableForm.controls.joinTableFormArray.valueChanges
            .pipe(debounceTime(1000))
            .subscribe((data: any) => {
                this.configurationChanged.emit(data);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initSelectedData() {
        this.queryBuilderStore.QueryBuilderState$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((res) => {
            this.alreadySelectedTableList$.next(
                this.getAlreadySelectedTableList(
                    res.selectedTablesMapList[res.currentQueryIndex]
                )
            );
        });
        const fullJsonData = this.queryBuilderStore.getFullJsonData(
            this.queryBuilderStore.getCurrentQueryIndex()
        );
        if (fullJsonData) {
            this.initJoinTableFormData(fullJsonData);
        }
    }

    private initJoinTableFormData(fullJsonData: any) {
        const { joinConfigs } = fullJsonData;
        joinConfigs.forEach((joinConfig: any, index: number) => {
            let joinConditionFormArray = this.formBuilder.array(
                []
            ) as FormArray;

            joinConfig.joinConditionFormArray.forEach((joinCondition: any) => {
                joinConditionFormArray.push(
                    this.formBuilder.group({
                        leftColumn: [joinCondition.leftColumn],
                        operator: [joinCondition.operator],
                        rightColumn: [joinCondition.rightColumn],
                    })
                );
            });

            this.joinTableFormArray.push(
                this.formBuilder.group({
                    joinType: [joinConfig.joinType],
                    rightTableName: [joinConfig.rightTableName],
                    leftTableName: [joinConfig.leftTableName],
                    joinConditionFormArray: joinConditionFormArray,
                })
            );

            this.tableColumnDataBehaviorSubjectList.push(
                new BehaviorSubject<any>([])
            );

            this.onSelectJoinTable(
                {
                    value: joinConfig.rightTableName,
                    label: joinConfig.rightTableName,
                },
                index
            );
        });

        this.configurationChanged.emit(joinConfigs);
    }

    onSelectJoinType(event: any, index: number) {
        //@ts-ignore
        this.joinTableFormArray.at(index).get('joinType').setValue(event.value);
    }

    private initTableColumns(
        tableName: string,
        index: number,
        tableNameForApiCall: string
    ) {
        this.customDatasetService
            .getTableColumnListWithType(tableNameForApiCall)
            .pipe(
                map((res: any) => {
                    let tableToColumnDataTypeMap =
                        this.queryBuilderStore.getTableToColumnDataTypeMap();
                    tableToColumnDataTypeMap.set(tableName, res);
                    this.queryBuilderStore.patchState({
                        tableToColumnDataTypeMap: tableToColumnDataTypeMap,
                    });
                    return res.map((column: any) => {
                        return {
                            label: column.ColumnName,
                            value: column.ColumnName,
                        };
                    });
                })
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.tableColumnDataBehaviorSubjectList[index].next(res);
                    this.setFetchedTableColumnDropdownOptions(tableName, res);
                },
            });
    }

    private setFetchedTableColumnDropdownOptions(
        tableName: string,
        data: IDropdownData[]
    ) {
        let fetchedTableColumnDropdownOptions =
            this.queryBuilderStore.getFetchedTableColumnDropdownOptions();
        fetchedTableColumnDropdownOptions.set(tableName, data);
        this.queryBuilderStore.patchState({
            fetchedTableColumnDropdownOptions:
                fetchedTableColumnDropdownOptions,
        });
    }

    getAlreadySelectedTableList(selectedTablesMap: any): IDropdownData[] {
        if (!selectedTablesMap) return [];
        return Array.from(selectedTablesMap.values()).filter((dropdownData: any) => dropdownData.value !== null) as IDropdownData[];
    }

    onSelectJoinTable(event: any, index: number) {
        //@ts-ignore
        this.joinTableFormArray
            .at(index)
            .get('rightTableName')
            .setValue(event.value);
        this.initTableColumns(
            event.value,
            index,
            event.value.replace(DotEnum.REPLACED_VALUE_OF_DOT, DotEnum.DOT)
        );

        let selectedTablesMapList =
            this.queryBuilderStore.getSelectedTablesMapList();
        let selectedTablesMap =
            selectedTablesMapList[
                this.queryBuilderStore.getCurrentQueryIndex()
            ];
        if (!selectedTablesMap)
            selectedTablesMap = new Map<string, IDropdownData>();

        selectedTablesMap.set(`join-form-table-${index}`, event);

        selectedTablesMapList[this.queryBuilderStore.getCurrentQueryIndex()] =
            selectedTablesMap;

        this.queryBuilderStore.patchState({
            selectedTablesMapList: selectedTablesMapList,
        });
    }

    onSelectJoinTableColumn(event: any, index: number) {
        //@ts-ignore
        this.joinTableFormArray
            .at(index)
            .get('joinColumnName')
            .setValue(event.value);
    }

    onSelectRightTableColumn(event:any, joinTableArrayIndex: number, joinConditionIndex: number) {
        //@ts-ignore
        this.joinConditionFormArray(joinTableArrayIndex)
            .at(joinConditionIndex)
            .get('rightColumn')
            .setValue(event.value);
    }

    onSelectFormTable(event: any, index: number) {
        //@ts-ignore
        this.joinTableFormArray
            .at(index)
            .get('leftTableName')
            .setValue(event.value);
    }

    onSelectLeftTableColumn(event:any, joinTableArrayIndex: number, joinConditionIndex: number) {
        //@ts-ignore
        this.joinConditionFormArray(joinTableArrayIndex)
            .at(joinConditionIndex)
            .get('leftColumn')
            .setValue(event.value);
    }

    get joinTableFormArray(): FormArray {
        return this.joinTableForm.get('joinTableFormArray') as FormArray;
    }

    getFormArray(index: number) {
        return this.joinTableFormArray.at(index) as FormGroup;
    }

    addJoinTable() {
        this.tableColumnDataBehaviorSubjectList.push(
            new BehaviorSubject<any>([])
        );

        this.joinTableFormArray.push(
            this.formBuilder.group({
                joinType: [''],
                rightTableName: [''],
                leftTableName: [''],
                joinConditionFormArray: this.formBuilder.array([]),
            })
        );
    }

    protected joinConditionFormArray(index: number): FormArray {
        return this.joinTableFormArray
            .at(index)
            .get('joinConditionFormArray') as FormArray;
    }

    addJoinCondition(index: number) {
        this.joinConditionFormArray(index).push(
            this.formBuilder.group({
                leftColumn: [''],
                operator: [''],
                rightColumn: [''],
            })
        );
    }

    removeJoinTable(index: number) {
        /*const dialogRef = this.openDialog(
            QueryBuilderConstants.JOIN_TABLE_DELETE_CONFIRMATION_MSG
        );
        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {*/
                if (this.openDialog(QueryBuilderConstants.JOIN_TABLE_DELETE_CONFIRMATION_MSG)) {
                    this.tableColumnDataBehaviorSubjectList.splice(index, 1);
                    
                    this.queryBuilderService.deleteTableWiseSelectedColumnsForm(
                        this.tableWiseSelectedColumnsForm,
                        //@ts-ignore
                        this.joinTableFormArray.at(index).get('rightTableName').value
                    );

                    let selectedTablesMapList =
                        this.queryBuilderStore.getSelectedTablesMapList();
                    let selectedTablesMap =
                        selectedTablesMapList[
                            this.queryBuilderStore.getCurrentQueryIndex()
                        ];
                    selectedTablesMap.delete(`join-form-table-${index}`);

                    selectedTablesMapList[
                        this.queryBuilderStore.getCurrentQueryIndex()
                    ] = selectedTablesMap;

                    this.queryBuilderStore.patchState({
                        selectedTablesMapList: selectedTablesMapList,
                    });

                    this.joinTableFormArray.removeAt(index);
                }
            /*});*/
    }

    removeJoinCondition(joinTableArrayIndex: number, joinConditionIndex: number) {
        this.joinConditionFormArray(joinTableArrayIndex).removeAt(
            joinConditionIndex
        );
    }

    onSelectOperator(event:any, joinTableArrayIndex: number, joinConditionIndex:number) {
        //@ts-ignore
        this.joinConditionFormArray(joinTableArrayIndex)
            .at(joinConditionIndex)
            .get('operator')
            .setValue(event.value);
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

    setStep(index: number) {
        this.additionalColumnConfigIndex = index;
    }
}
