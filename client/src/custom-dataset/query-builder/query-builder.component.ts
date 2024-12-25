import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, map, of, Subject, takeUntil, tap } from 'rxjs';
import { CustomDatasetService } from '../services/custom-dataset.service';
import { QueryBuilderStore } from './utils/query-builder.store';
import { toTitleCase } from '../../grid/case-conversion';
import { QueryBuilderService } from './utils/services/query-builder.service';
import { ColDef } from 'ag-grid-community';
import {
    BuildQueryPayload,
    CalculatedColumn,
    IDropdownData,
    JoinConfig,
    OrderByColumn,
    QueryBuilderJSON,
    SelectCase,
    SelectClauseCol,
} from './utils/interfaces';
import { MatStepper } from '@angular/material/stepper';
//import { AlertMessageService } from '@streamstech/ui-sdk/fuse/services';
import {
    AggregationFunctionTypeEnum,
    CONDITION_OPERATORS_ENUM,
    ConditionTypeEnum,
    DotEnum,
} from './utils/enums';
import { QueryBuilderConstants } from './utils/query-builder.constants';
import { UtilsService } from './utils/services/utils.service';
import { StepProceedValidationService } from './utils/services/step-proceed-validation.service';
import { MneGrid } from '../../grid/stl-grid/stl-grid.component';

interface INameLabel {
    name: string;
    label: string;
}
@Component({
    standalone:false,
    selector: 'app-query-builder',
    templateUrl: './query-builder.component.html',
    styleUrls: ['./query-builder.component.scss'],
})
export class QueryBuilderComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<void>();
    queryBuilderForm!: FormGroup;
    tableList: IDropdownData[] = [];
    formTableColumnList: IDropdownData[] = [];
    joinConditions: JoinConfig[] = [];
    filterConditions: any = {};
    selectCases: SelectCase[] = [];
    calculatedColumns: CalculatedColumn[] = [];
    orderByColumns: OrderByColumn[] = [];
    selectClauseCols: SelectClauseCol[] = [];
    previewQueryResult: boolean = false;
    previewTableData = of([]);
    previewTableConfig: ColDef[] = [];
    allSelectedColumns: string[] = [];
    showPreviewTable: boolean = true;
    fullJsonData!: QueryBuilderJSON;
    tableWiseSelectedColumnsForm: FormGroup;
    @ViewChild('stepper') private stepper!: MatStepper;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<QueryBuilderComponent>,
        private formBuilder: FormBuilder,
        private customDatasetService: CustomDatasetService,
        private queryBuilderStore: QueryBuilderStore,
        private changeDetectorRef: ChangeDetectorRef,
        private queryBuilderService: QueryBuilderService,
        //private alertMessageService: AlertMessageService,
        private stepProceedValidationService: StepProceedValidationService
    ) {
        this.tableWiseSelectedColumnsForm= this.formBuilder.group({});
        this.createQueryBuilderForm();
        this.assignFormFieldValues();
    }

    private assignFormFieldValues() {
        this.fullJsonData = this.queryBuilderStore.getFullJsonData(
            this.queryBuilderStore.getCurrentQueryIndex()
        );
        this.queryBuilderForm.controls['FormTable'].setValue(
            this.fullJsonData?.formTableName
        );
        this.queryBuilderForm.controls['ApplyGroupBy'].setValue(
            this.fullJsonData?.applyGroupBy
        );

        if (this.fullJsonData?.formTableName) {
            this.onSelectFormTable({
                value: this.fullJsonData?.formTableName,
                label: this.fullJsonData?.formTableName,
            });
        }

        this.initTableWiseSelectedColumnsForm(
            this.fullJsonData?.selectedTableToColumnsMap
        );
    }

    private initTableWiseSelectedColumnsForm(
        tableWiseSelectedColumnsFormValues: any
    ) {
        Object.keys(tableWiseSelectedColumnsFormValues || {})?.forEach(
            (tableName) => {
                this.tableWiseSelectedColumnsForm.addControl(
                    tableName,
                    this.formBuilder.group({})
                );
                let columnsFormGroup: FormGroup =
                    this.tableWiseSelectedColumnsForm.get(
                        tableName
                    ) as FormGroup;

                Object.keys(
                    tableWiseSelectedColumnsFormValues[tableName]
                )?.forEach((columnName) => {
                    columnsFormGroup.addControl(
                        columnName,
                        this.formBuilder.group({
                            isSelected: new FormControl(
                                tableWiseSelectedColumnsFormValues[tableName][
                                    columnName
                                ]['isSelected']
                            ),
                            aggregateFunction: new FormControl(
                                tableWiseSelectedColumnsFormValues[tableName][
                                    columnName
                                ]['aggregateFunction']
                            ),
                            customColumnName: new FormControl(
                                tableWiseSelectedColumnsFormValues[tableName][
                                    columnName
                                ]['customColumnName']
                            ),
                        })
                    );
                });
            }
        );
    }

    private createQueryBuilderForm() {
        this.queryBuilderForm = this.formBuilder.group({
            FormTable: ['', [Validators.required]],
            ApplyGroupBy: [false],
        });
    }

    ngOnInit(): void {
        this.getTableList();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private getTableList() {
        this.customDatasetService
            .getTableList()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                this.tableList = data.map((item: any) => {
                    if (item.value.includes(DotEnum.DOT)) {
                        return {
                            ...item,
                            value: item.value.replace(
                                DotEnum.DOT,
                                DotEnum.REPLACED_VALUE_OF_DOT
                            ),
                        };
                    }
                    return item;
                });
            });
    }

    protected onSelectFormTable(table: IDropdownData) {
        this.queryBuilderForm.controls['FormTable'].setValue(table.value);

        let selectedTablesMapList =
            this.queryBuilderStore.getSelectedTablesMapList();
        let selectedTablesMap =
            selectedTablesMapList[
                this.queryBuilderStore.getCurrentQueryIndex()
            ];
        if (!selectedTablesMap)
            selectedTablesMap = new Map<string, IDropdownData>();

        selectedTablesMap.set('main-form-table', table);

        selectedTablesMapList[this.queryBuilderStore.getCurrentQueryIndex()] =
            selectedTablesMap;

        this.queryBuilderStore.patchState({
            selectedTablesMapList: selectedTablesMapList,
        });

        if (table.value) {
            this.fetchTableColumns(
                table.value,
                table.value.replace(DotEnum.REPLACED_VALUE_OF_DOT, DotEnum.DOT)
            );
        }
    }

    private fetchTableColumns(tableName: string, tableNameForApiCall: string) {
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
            .subscribe((data: IDropdownData[]) => {
                this.formTableColumnList = data;
                this.setFetchedTableColumnDropdownOptions(data);
            });
    }

    private setFetchedTableColumnDropdownOptions(data: IDropdownData[]) {
        let fetchedTableColumnDropdownOptions =
            this.queryBuilderStore.getFetchedTableColumnDropdownOptions();
        fetchedTableColumnDropdownOptions.set(
            this.queryBuilderForm.controls['FormTable'].value,
            data
        );
        this.queryBuilderStore.patchState({
            fetchedTableColumnDropdownOptions:
                fetchedTableColumnDropdownOptions,
        });
    }

    saveQuery() {
        const generatedQuery = this.queryBuilderService.buildQuery(
            this.generateBuildQueryPayload()
        );
        this.dialogRef.close({
            saveClicked: true,
            query: generatedQuery,
            index: this.queryBuilderStore.getCurrentQueryIndex(),
        });

        this.saveFullJsonDataToStore(generatedQuery);
    }

    private generateFullJsonDataObject(generatedQuery: string) {
        return {
            formTableName: this.queryBuilderForm.controls['FormTable'].value,
            applyGroupBy: this.queryBuilderForm.controls['ApplyGroupBy'].value,
            joinConfigs: this.joinConditions,
            filterConditions: this.filterConditions,
            selectedTableToColumnsMap: this.tableWiseSelectedColumnsForm.value,
            selectCases: this.selectCases,
            calculatedColumns: this.calculatedColumns,
            orderByColumns: this.orderByColumns,
            selectClauseCols: this.selectClauseCols,
            webQuery: generatedQuery,
        } as QueryBuilderJSON;
    }

    private saveFullJsonDataToStore(generatedQuery: string) {
        let allQueries = this.queryBuilderStore.getAllQueries();

        const fullJsonData: QueryBuilderJSON =
            this.generateFullJsonDataObject(generatedQuery);

        allQueries[this.queryBuilderStore.getCurrentQueryIndex()] =
            fullJsonData;

        this.queryBuilderStore.patchState({
            allQueries: allQueries,
        });
    }

    onClose() {
        this.dialogRef.close({
            saveClicked: false,
            query: '',
        });
    }

    toggleGroupByCheckbox(event:any) {
        this.queryBuilderForm.controls['ApplyGroupBy'].setValue(event.checked);
    }

    onJoinConfigurationChange(data: JoinConfig[]) {
        this.joinConditions = data;
        console.log('joinConditions::::', data);
        this.queryBuilderStore.QueryBuilderState$.subscribe(res=>console.log(res))
    }

    onFilterConditionChange(data: any) {
        this.filterConditions = data;
    }

    onSelectCaseChange(data: SelectCase[]) {
        console.log('------onSelectCaseChange-------',data)
        this.selectCases = data;
    }

    onCalculatedColumnFormValueChange(data: CalculatedColumn[]) {
        console.log('------onCalculatedColumnFormValueChange-------',data)
        this.calculatedColumns = data;
    }

    onOrderByConfigChange(data: OrderByColumn[]) {
        this.orderByColumns = data;
    }

    onColumnOrderChange(data: SelectClauseCol[]) {
        console.log('____________________________')
        this.selectClauseCols = data;
        this.queryBuilderStore.patchState({
            selectClauseCols: this.selectClauseCols,
        });
    }

    disableSaveButton() {
        return !this.queryBuilderForm.controls['FormTable'].value;
    }

    onPreviewClick() {
        this.previewQueryResult = true;
        this.fetchPreviewData();
        //this.detectChanges();
    }
    

    private detectChanges() {
        this.showPreviewTable = false;
        this.changeDetectorRef.detectChanges();
        this.showPreviewTable = true;
    }

    private generatePreviewTableConfig() {
        this.previewTableConfig = [];
        this.selectClauseCols.forEach((column) => {
            this.previewTableConfig.push({
                field: column.columnName,
                headerName: toTitleCase(column.columnName),
            });
        });
        
    }

    private generateBuildQueryPayload() {
        return {
            sourceTable: this.queryBuilderForm.controls['FormTable'].value,
            tableWiseSelectedColumnsForm: this.tableWiseSelectedColumnsForm,
            calculatedColumns: this.calculatedColumns,
            selectCases: this.selectCases,
            joinConditions: this.joinConditions,
            filterConditions: this.filterConditions,
            applyGroupBy: this.queryBuilderForm.controls['ApplyGroupBy'].value,
            orderByColumns: this.orderByColumns,
        } as BuildQueryPayload;
    }

    private fetchPreviewData() {
        this.generatePreviewTableConfig();
        
        this.previewTableData=this.customDatasetService
            .getPreviewData(
                this.queryBuilderService.buildQuery(
                    this.generateBuildQueryPayload()
                )
            )
            .pipe(
                map((res: any) => res.Data.map((it: any, index:any)=>({...it, id:it.id||index}))),
                tap(res=>console.log(res))
            );
    }

    closePreview() {
        this.previewQueryResult = false;
    }

    goToPreviousStep() {
        this.stepper.previous();
    }

    goToNextStep() {
        const fullJsonData = this.generateFullJsonDataObject('');
        if (
            this.stepProceedValidationService.canProceedToNextStep(
                this.stepper.selectedIndex,
                fullJsonData
            )
        ) {
            this.stepper.next();
        } else {
            /*this.alertMessageService.showWarningMessage(
                this.stepProceedValidationService.getProceedRestrictionWarningMessage(
                    this.stepper.selectedIndex,
                    fullJsonData
                )
            );*/
            alert(this.stepProceedValidationService.getProceedRestrictionWarningMessage(
                this.stepper.selectedIndex,
                fullJsonData
            ));
        }
    }
}
