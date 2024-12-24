import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { QueryBuilderConstants } from '../utils/query-builder.constants';
//import { FuseConfirmationService } from '@streamstech/ui-sdk/fuse/services';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { CalculatedColumn } from '../utils/interfaces';

@Component({
    standalone:false,
    selector: 'app-calculated-columns',
    templateUrl: './calculated-columns.component.html',
    styleUrls: ['./calculated-columns.component.scss'],
})
export class CalculatedColumnsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    calculatedColumnsForm;
    calculatedColumnIndex = -1;
    @Output() calculatedColumnFormValueChanged = new EventEmitter();

    constructor(
        private formBuilder: FormBuilder,
        //private _fuseConfirmationService: FuseConfirmationService,
        private queryBuilderStore: QueryBuilderStore
    ) {
        this.calculatedColumnsForm = this.formBuilder.group({
            calculatedColumnsFormArray: this.formBuilder.array([]),
        });
    }
    getExpressionCtl(i:number):FormControl{
        return this.calculatedColumnsFormArray
        .at(i)
        .get('expression') as any;
    }
    isCard():boolean{
        //@ts-ignore
        return this.calculatedColumnsForm.get('calculatedColumnsFormArray')?.length
    }
    ngOnInit(): void {
        this.calculatedColumnsForm.controls.calculatedColumnsFormArray.valueChanges
            .pipe(debounceTime(1000))
            .subscribe((data: any) => {
                this.calculatedColumnFormValueChanged.emit(data);
            });
        const fullJsonData = this.queryBuilderStore.getFullJsonData(
            this.queryBuilderStore.getCurrentQueryIndex()
        );
        if (fullJsonData) {
            this.initCalculatedColumnsFormData(fullJsonData);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get calculatedColumnsFormArray(): FormArray {
        return this.calculatedColumnsForm.get(
            'calculatedColumnsFormArray'
        ) as FormArray;
    }

    private initCalculatedColumnsFormData(fullJsonData: any) {
        const { calculatedColumns } = fullJsonData;
        calculatedColumns?.forEach(
            (calculatedColumn: CalculatedColumn) => {
                this.calculatedColumnsFormArray.push(
                    this.formBuilder.group({
                        columnName: [calculatedColumn.columnName],
                        expression: [calculatedColumn.expression],
                    })
                );
            }
        );

        this.calculatedColumnFormValueChanged.emit(calculatedColumns);
    }

    addCalculatedColumn() {
        this.calculatedColumnsFormArray.push(
            this.formBuilder.group({
                columnName: [''],
                expression: '',
            })
        );
    }

    removeCalculatedColumn(index: number) {
        /*const dialogRef = this.openDialog(
            QueryBuilderConstants.CALCULATED_COLUMN_DELETE_CONFIRMATION_MSG
        );
        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                if (result === 'confirmed') {
                    this.calculatedColumnsFormArray.removeAt(index);
                }
            });*/
            if(this.openDialog(QueryBuilderConstants.CALCULATED_COLUMN_DELETE_CONFIRMATION_MSG)){
                this.calculatedColumnsFormArray.removeAt(index);
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
        return confirm(msg)
    }

    setStep(index: number) {
        this.calculatedColumnIndex = index;
    }
}
