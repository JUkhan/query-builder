//@ts-nocheck
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild, inject
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
//import { FuseConfirmationService } from '@streamstech/ui-sdk/fuse/services';
import { ConstantService } from '../../services/constants.service';
import { CustomDatasetService } from '../services/custom-dataset.service';
//import { AlertMessageService } from 'app/shared/services/alert-message.service';
import {
  CustomDatasetConstants,
  IDropdownData,
  QueryCreationModeEnum,
} from '../custom-dataset.constants';
//import { ConstantService } from '../../services/constants.service';
import { QueryType } from '../interfaces/QueryType';
import { map, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import { QueryBuilderStore } from '../query-builder/utils/query-builder.store';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { QueryBuilderConstants } from '../query-builder/utils/query-builder.constants';
import { QueryBuilderJSON } from '../query-builder/utils/interfaces';
import { toTitleCase } from '../../grid/case-conversion';
import { ColDef } from 'ag-grid-community';
import { MneGrid } from '../../grid/stl-grid/stl-grid.component';
import {MatSnackBar} from '@angular/material/snack-bar';

interface INameLabel {
  name: string;
  label: string;
}

@Component({
  standalone: false,
  selector: 'app-custom-dataset-form',
  templateUrl: './custom-dataset-form.component.html',
  styleUrls: ['./custom-dataset-form.component.scss'],
})
export class CustomDatasetFormComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  customDatasetForm: FormGroup;
  @Input() formData: any = {};
  @Output() dataEmitter = new EventEmitter();
  @Output() cancelClickEmitter = new EventEmitter<void>();
  private _snackBar = inject(MatSnackBar);
  previousFormData: any = {};

  title: string = CustomDatasetConstants.DATASET_ADD_TITLE;
  queryCreationModes: IDropdownData[] =
    CustomDatasetConstants.QUERY_CREATION_MODES;
  protected tableList$: Observable<any> = of([]);

  queryTypeData: QueryType[] = [
    { label: 'View', value: 'View' },
    { label: 'Materialized View', value: 'Materialized_View' },
    { label: 'Query', value: 'Query' },
    { label: 'Function', value: 'Function' },
  ];
  selectedQueryType: QueryType;
  isCustomQuery: boolean = true;
  datasetId: string = '';
  queries: any = [];
  showPreviewTable: boolean = false;
  previewTableData = of([]);
  previewTableConfig: ColDef[] = [];
  FullJsonData: string = '';

  @ViewChild('datasetStepper') private datasetStepper!: MatStepper;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    //private messageService: AlertMessageService,
    private customDatasetService: CustomDatasetService,
    //private _fuseConfirmationService: FuseConfirmationService,
    private queryBuilderStore: QueryBuilderStore,
    private location: Location,
    //private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.setValidation();
    this.tableList$ = this.customDatasetService.getTableList();
  }

  setValidation() {
    this.customDatasetForm = this.fb.group({
      DatasetName: ['', [Validators.required, this.customValidator]],
      WebQuery: [
        { value: '', disabled: !this.isCustomQuery },
        [Validators.required],
      ],
      MobileQuery: ['', []],
      IsQueryForMobile: [false, []],
      IsDataDownloadableForMobile: [false, []],
      IsUsedAsReference: [false, []],
      ColumnName: ['', []],
      TableName: ['', []],
      QueryType: ['', [Validators.required]],
      QueryCreationMode: [QueryCreationModeEnum.CUSTOM, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.datasetId = params?.Id;
      });
    this.title = this.datasetId
      ? CustomDatasetConstants.DATASET_EDIT_TITLE
      : CustomDatasetConstants.DATASET_ADD_TITLE;

    if (this.datasetId) {
      this.getCustomDatasetById();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCustomDatasetById() {
    this.customDatasetService
      .getCustomDatasetById(this.datasetId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.assignCustomDatasetFormData(res);
      });
  }

  private assignCustomDatasetFormData(data) {
    const customDatasetFormFields: string[] =
      CustomDatasetConstants.DATASET_FORM_FIELDS;
    if (data.AdditionalConfig) {
      try {
        const additionalConfig = JSON.parse(data.AdditionalConfig);
        for (const key in additionalConfig) {
          this.customDatasetForm.get(key).setValue(additionalConfig[key]);
        }
      } catch (e) {
        console.log('Parse error', e);
      }
    }

    customDatasetFormFields.map((fieldName) => {
      if (data[fieldName]) {
        this.customDatasetForm.get(fieldName).setValue(data[fieldName]);
      }
    });

    this.FullJsonData = data.FullJsonData ?? '';
    this.isCustomQuery =
      data.QueryCreationMode === QueryCreationModeEnum.CUSTOM;
    this.disableQueryFields();

    this.previousFormData = Object.assign({}, this.customDatasetForm.value);
  }

  onSubmit() {
    const operationType = this.datasetId
      ? ConstantService.OperationType.UPDATE
      : ConstantService.OperationType.INSERT;

    let payload = {
      ...this.customDatasetForm.getRawValue(),
      IsQueryForMobile:
        this.customDatasetForm.controls.IsQueryForMobile.value ?? false,
      IsDataDownloadableForMobile:
        this.customDatasetForm.controls.IsDataDownloadableForMobile.value ??
        false,
      FullJsonData: JSON.stringify({
        unionType: this.queries.unionType,
        allQueries: this.queryBuilderStore.getAllQueries(),
      }),
      AdditionalConfig: JSON.stringify({
        IsUsedAsReference:
          this.customDatasetForm.controls.IsUsedAsReference.value ?? false,
        ColumnName: this.customDatasetForm.controls.ColumnName.value ?? '',
        TableName: this.customDatasetForm.controls.TableName.value ?? '',
      }),
    };

    if (this.datasetId) payload['Id'] = this.datasetId;

    this.customDatasetService
      .saveCustomDataset(payload, operationType)
      .subscribe({
        next: (res: any) => {
            this.goBack();
            this._snackBar.open(ConstantService.Message.SAVED_SUCCESSFUL, '', {duration:3000, verticalPosition:'top'});
            this.FullJsonData = '';
            this.emptifyQueryBuilderStore();
        },
        error: (e) => {
          this._snackBar.open(ConstantService.Message.SAVED_FAIL_TITLE, '', {duration:3000, verticalPosition:'top'});
        },
        complete: () => console.info('complete'),
      });
  }

  resetForm() {
    if (this.checkDataValidity()) {
      this.showCancelationWarning();
    } else {
      this.goBack();
      this.customDatasetForm.reset();
      this.FullJsonData = '';
      this.emptifyQueryBuilderStore();
    }
  }

  showCancelationWarning() {
    /*const dialogRef = this._fuseConfirmationService.open({
            message: ConstantService.Message.CANCEL_WARNING,
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
        });

        dialogRef.afterClosed().subscribe((result) => {*/
    if (confirm(ConstantService.Message.CANCEL_WARNING)) {
      this.goBack();
      this.customDatasetForm.reset();
      this.emptifyQueryBuilderStore();
    }
    /* });*/
  }

  updateQueryType() {
    this.selectedQueryType = this.formData['QueryType'];
  }

  private checkDataValidity(): boolean {
    let isDataExist = false;
    if (this.formData['Id']) {
      const areEqual =
        JSON.stringify(this.customDatasetForm.value) ===
        JSON.stringify(this.previousFormData);
      isDataExist = areEqual ? false : true;
    }

    return isDataExist;
  }

  customValidator(control: FormControl) {
    const value = control.value;
    if (!value) {
      return { customError: true };
    }
    return null;
  }

  onSelectQueryCreationMode(queryCreationMode: IDropdownData) {
    this.customDatasetForm.controls.QueryCreationMode.setValue(
      queryCreationMode.value
    );
    this.isCustomQuery =
      queryCreationMode.value === QueryCreationModeEnum.CUSTOM;
    this.disableQueryFields();
  }

  onSelectTableName(tableName: IDropdownData) {
    this.customDatasetForm.controls.TableName.setValue(tableName.value);
  }

  private disableQueryFields() {
    this.isCustomQuery
      ? this.customDatasetForm.get('WebQuery')?.enable()
      : this.customDatasetForm.get('WebQuery')?.disable();
  }

  private emptifyQueryBuilderStore() {
    this.queryBuilderStore.patchState({
      currentQueryIndex: null,
      selectedTablesMapList: [],
      fetchedTableColumnDropdownOptions: new Map<string, IDropdownData[]>(),
      tableToColumnDataTypeMap: new Map<string, any>(),
      allQueries: [],
      selectClauseCols: [],
    });
  }

  goBack() {
    this.location.back();
  }

  onQueriesConfigChange(data) {
    this.queries = data;
  }

  goToPreviousStep() {
    this.datasetStepper.previous();
  }

  goToNextStep() {
    if (this.canProceedToNextStep(this.datasetStepper.selectedIndex)) {
      this.datasetStepper.next();
    } else {
      /*this.messageService.showWarningMessage(
                this.getProceedRestrictionWarningMessage(
                    this.datasetStepper.selectedIndex
                )
            );*/
      this._snackBar.open(
        this.getProceedRestrictionWarningMessage(
          this.datasetStepper.selectedIndex
        ),'',{duration:3000, verticalPosition:'top'}
      );
    }
  }

  private getProceedRestrictionWarningMessage(stepIndex: number): string {
    switch (stepIndex) {
      case 0:
        return QueryBuilderConstants.COLLECT_REQUIRED_DATA_WARNING_MSG;
      case 1:
        return this.getInvalidQueryWarningsMessage();
    }
  }

  private getInvalidQueryWarningsMessage(): string {
    if (
      !this.queries.allQueryFormArray ||
      this.queries.allQueryFormArray?.length === 0
    ) {
      return QueryBuilderConstants.EMPTY_SUB_QUERY_WARNING_MSG;
    } else if (
      !this.queries.allQueryFormArray?.every((query) => query.webQuery)
    ) {
      return QueryBuilderConstants.INVALID_QUERY_WARNING_MSG;
    }
  }

  private canProceedToNextStep(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.isBasicInfoValid();
      case 1:
        return this.isQueriesValid();
      default:
        return true;
    }
  }

  private isBasicInfoValid(): boolean {
    return (
      this.customDatasetForm.controls.DatasetName.value &&
      this.customDatasetForm.controls.QueryType.value &&
      this.customDatasetForm.controls.QueryCreationMode.value
    );
  }

  private isQueriesValid(): boolean {
    const isValid =
      this.queries.allQueryFormArray?.length &&
      this.queries.allQueryFormArray?.every((query) => query.webQuery);
    if (isValid) {
      const query = this.generateQuery();
      this.customDatasetForm.controls.WebQuery.setValue(query);
      const mobileQuery: string = query.replace(
        new RegExp('customdataset.', 'g'),
        ''
      );
      this.customDatasetForm.controls.MobileQuery.setValue(mobileQuery);
    }
    return isValid;
  }

  private generateQuery(): string {
    return this.queries.allQueryFormArray
      ?.map((query) => query.webQuery)
      .join(`\n\n${this.queries.unionType}\n\n`);
  }

  onPreviewClick() {
    this.showPreviewTable = true;
    this.generatePreviewTableConfig();
    this.fetchPreviewData();
  }
  
  private generatePreviewTableConfig() {
    this.previewTableConfig = [];
    let firstQueryFullJson: QueryBuilderJSON = this.queryBuilderStore.getAllQueries()[0];
    firstQueryFullJson.selectClauseCols.forEach((column) => {
      this.previewTableConfig.push({
        field: column.columnName,
        headerComponentParams: toTitleCase(column.columnName),
      });
    });
  }

  private fetchPreviewData() {
    this.generatePreviewTableConfig();
    this.previewTableData = this.customDatasetService
      .getPreviewData(this.generateQuery())
      .pipe(
        map((it) => it.Data.map((it, index) => ({ ...it, id: it.id || index }))),
        tap(()=>{})
      );
  }

  isPreviewEnabled(): boolean {
    return (
      this.queries.allQueryFormArray?.length &&
      this.queries.allQueryFormArray?.every((query) => query.webQuery)
    );
  }
}
