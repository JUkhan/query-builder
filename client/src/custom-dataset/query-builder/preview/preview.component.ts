import { Component, OnInit, inject } from '@angular/core';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { QueryBuilderService } from '../utils/services/query-builder.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  BuildQueryPayload,
  CalculatedColumn,
  JoinConfig,
  SelectCase,
  SelectClauseCol,
} from '../utils/interfaces';
import { ColDef } from 'ag-grid-community';
import { toTitleCase } from '../../../grid/case-conversion';
import { catchError, map, of, tap } from 'rxjs';
import { CustomDatasetService } from '../../services/custom-dataset.service';
import { UtilsService } from '../utils/services/utils.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-preview',
  standalone: false,
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss',
})
export class PreviewComponent implements OnInit{
  tableWiseSelectedColumnsForm: FormGroup;
  previewTableConfig: ColDef[] = [];
  selectCases: SelectCase[] = [];
  calculatedColumns: CalculatedColumn[] = [];
  selectClauseCols: SelectClauseCol[] = [];
  previewTableData = of([]);
  private _snackBar = inject(MatSnackBar);

  constructor(
    private formBuilder: FormBuilder,
    private customDatasetService: CustomDatasetService,
    private queryBuilderStore: QueryBuilderStore,
    private utilService: UtilsService,
    private queryBuilderService: QueryBuilderService
  ) {
    this.tableWiseSelectedColumnsForm = this.formBuilder.group({});
    this.assignFormFieldValues();
  }
  ngOnInit(): void {
    
  }

  onColumnOrderChange(data: SelectClauseCol[]) {
    this.selectClauseCols = data;
    this.queryBuilderStore.patchStateAllQueries('selectClauseCols',data);
    this.queryBuilderStore.patchState({selectClauseCols:data});
    this.generatePreviewTableConfig();
    this.fetchPreviewData();
  }

  private generateBuildQueryPayload() {
    const fullJsonData = this.queryBuilderStore.getFullJsonData(
      this.queryBuilderStore.getCurrentQueryIndex()
    );
    return {
        sourceTable: this.queryBuilderStore.getSourceTable(),
        tableWiseSelectedColumnsForm: this.tableWiseSelectedColumnsForm,
        calculatedColumns: this.calculatedColumns,
        selectCases: this.selectCases,
        joinConditions: fullJsonData.joinConfigs,
        filterConditions: fullJsonData.filterConditions||[],
        applyGroupBy: fullJsonData.applyGroupBy||false,
        orderByColumns: fullJsonData.orderByColumns||[],
    } as BuildQueryPayload;
    
}

private fetchPreviewData() {
    this.generatePreviewTableConfig();
    const query= this.queryBuilderService.buildQuery(this.generateBuildQueryPayload());
    this.queryBuilderStore.patchStateAllQueries('webQuery', query)
    this.previewTableData=this.customDatasetService
        .getPreviewData(query)
        .pipe(
            map((res: any) => res.Data.map((it: any, index:any)=>({...it, id:it.id||index}))),
            tap(res=>console.log(res)),
            catchError(err=>{
              this._snackBar.open(err.error.error, '', {duration:3000, verticalPosition:'top'});
              return []
            })
        );
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

  private assignFormFieldValues() {
    const fullJsonData = this.queryBuilderStore.getFullJsonData(
      this.queryBuilderStore.getCurrentQueryIndex()
    );
    this.selectCases = fullJsonData?.selectCases ?? [];
    this.calculatedColumns = fullJsonData?.calculatedColumns ?? [];
    this.selectClauseCols=fullJsonData?.selectClauseCols??[];
    this.initTableWiseSelectedColumnsForm(
      fullJsonData?.selectedTableToColumnsMap
    );
    this.utilService.initSelectClauseGeneration();
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
        let columnsFormGroup: FormGroup = this.tableWiseSelectedColumnsForm.get(
          tableName
        ) as FormGroup;

        Object.keys(tableWiseSelectedColumnsFormValues[tableName])?.forEach(
          (columnName) => {
            columnsFormGroup.addControl(
              columnName,
              this.formBuilder.group({
                isSelected: new FormControl(
                  tableWiseSelectedColumnsFormValues[tableName][columnName][
                    'isSelected'
                  ]
                ),
                aggregateFunction: new FormControl(
                  tableWiseSelectedColumnsFormValues[tableName][columnName][
                    'aggregateFunction'
                  ]
                ),
                customColumnName: new FormControl(
                  tableWiseSelectedColumnsFormValues[tableName][columnName][
                    'customColumnName'
                  ]
                ),
              })
            );
          }
        );
      }
    );
  }
}
