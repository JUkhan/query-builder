import { Component } from '@angular/core';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CalculatedColumn, SelectCase } from '../utils/interfaces';

@Component({
  selector: 'app-select-container',
  standalone: false,
  templateUrl: './select-container.component.html',
  styleUrl: './select-container.component.scss',
})
export class SelectContainerComponent {
  tableWiseSelectedColumnsForm: FormGroup;
  queryBuilderForm!: FormGroup;
  constructor(
    private queryBuilderStore: QueryBuilderStore,
    private formBuilder: FormBuilder
  ) {
    this.tableWiseSelectedColumnsForm = this.formBuilder.group({});
    this.queryBuilderForm = this.formBuilder.group({
      FormTable: ['', [Validators.required]],
      ApplyGroupBy: [false],
    });
    this.assignFormFieldValues();
  }

  toggleGroupByCheckbox(event: any) {
    this.queryBuilderForm.controls['ApplyGroupBy'].setValue(event.checked);
    this.queryBuilderStore.patchStateAllQueries('applyGroupBy',event.checked)
  }

  onSelectCaseChange(data: SelectCase[]) {
    console.log('onSelectCaseChange::', data)
    this.queryBuilderStore.patchStateAllQueries('selectCases', data);
  }

  onCalculatedColumnFormValueChange(data: CalculatedColumn[]) {
    console.log('onCalculatedColumnFormValueChange::', data)
    this.queryBuilderStore.patchStateAllQueries('calculatedColumns', data);
  }

  

  private assignFormFieldValues() {
    const fullJsonData = this.queryBuilderStore.getFullJsonData(
        this.queryBuilderStore.getCurrentQueryIndex()
    );
    this.queryBuilderForm.controls['FormTable'].setValue(
        fullJsonData?.formTableName
    );
    this.queryBuilderForm.controls['ApplyGroupBy'].setValue(
        fullJsonData?.applyGroupBy
    );
    this.initTableWiseSelectedColumnsForm(
        fullJsonData?.selectedTableToColumnsMap
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
}
