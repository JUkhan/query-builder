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
import { FormBuilder, FormArray, FormGroup, FormControl } from '@angular/forms';
//import { FuseConfirmationService } from '@streamstech/ui-sdk/fuse/services';
import { Subject, BehaviorSubject, debounceTime, takeUntil, map } from 'rxjs';
import { IDropdownData } from '../../custom-dataset.constants';
import { CustomDatasetService } from '../../services/custom-dataset.service';
import { QueryBuilderConstants } from '../utils/query-builder.constants';
import { QueryBuilderService } from '../utils/services/query-builder.service';
import { QueryBuilderStore } from '../utils/query-builder.store';
import {
    CaseConditionTypeEnum,
    CaseResultValueTypeEnum,
    ConditionTypeEnum,
} from '../utils/enums';

@Component({
    standalone:false,
    selector: 'app-select-case',
    templateUrl: './select-case.component.html',
    styleUrls: ['./select-case.component.scss'],
})
export class SelectCaseComponent implements OnInit, OnDestroy, OnChanges {
    private destroy$ = new Subject<void>();
    protected panelOpenState: boolean = false;
    caseForm!: FormGroup;
    caseConfigIndex = -1;
    @Input() tableList: IDropdownData[] = [];
    @Output() selectCaseChanged = new EventEmitter();

    constructor(
        private customDatasetService: CustomDatasetService,
        //private _fuseConfirmationService: FuseConfirmationService,
        private formBuilder: FormBuilder,
        private queryBuilderStore: QueryBuilderStore,
        private queryBuilderService: QueryBuilderService
    ) {
        this.caseForm = this.formBuilder.group({
            caseFormArray: this.formBuilder.array([]),
        });
    }

    isCard(): boolean{
        return (this.caseForm.get('caseFormArray') as FormArray)?.length > 0;
    }
    getForm(f:any){
        return f;
    }
    ngOnChanges(changes: SimpleChanges): void {}

    ngOnInit(): void {
        this.caseForm.controls['caseFormArray'].valueChanges
            .pipe(debounceTime(1000))
            .subscribe((data: any) => {
                this.selectCaseChanged.emit(data);
            });

        const fullJsonData = this.queryBuilderStore.getFullJsonData(
            this.queryBuilderStore.getCurrentQueryIndex()
        );
        if (fullJsonData) {
            this.initCaseFormData(fullJsonData);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get caseFormArray(): FormArray {
        return this.caseForm.get('caseFormArray') as FormArray;
    }

    getFormArray(index: number) {
        return this.caseFormArray.at(index) as FormGroup;
    }

    private initCaseFormData(fullJsonData: any) {
        const { selectCases } = fullJsonData;

        selectCases.forEach((selectCase: any, index: number) => {
            let conditionsFormArray = this.formBuilder.array([]) as FormArray;

            selectCase.conditionsFormArray.forEach((condition: any) => {
                conditionsFormArray.push(
                    this.formBuilder.group({
                        type: [condition.type],
                        filterConditionsForm: this.initFilterConditionsFormData(
                            condition.filterConditionsForm
                        ),
                        resultForm: this.formBuilder.group({
                            resultType: [condition.resultForm.resultType],
                            tableName: [condition.resultForm.tableName],
                            tableColumnName: [
                                condition.resultForm.tableColumnName,
                            ],
                            specificValue: [condition.resultForm.specificValue],
                        }),
                    })
                );
            });

            this.caseFormArray.push(
                this.formBuilder.group({
                    columnName: [selectCase.columnName],
                    conditionsFormArray: conditionsFormArray,
                })
            );
        });

        this.selectCaseChanged.emit(selectCases);
    }

    createConditions(rules: any[] = []): FormGroup[] {
        return rules.map((rule) => {
            if (rule.type === ConditionTypeEnum.NORMAL_CONDITION) {
                return this.formBuilder.group({
                    type: [rule.type],
                    leftTableName: [rule.leftTableName],
                    leftTableColumn: [rule.leftTableColumn],
                    operator: [rule.operator],
                    specificValue: [rule.specificValue],
                });
            } else if (rule.type === ConditionTypeEnum.GROUP_CONDITION) {
                return this.formBuilder.group({
                    type: [rule.type],
                    condition: [rule.condition],
                    rulesFormArray: this.formBuilder.array(
                        this.createConditions(rule.rulesFormArray)
                    ),
                });
            }
            return this.formBuilder.group({});
        });
    }

    private initFilterConditionsFormData(filterConditions: any) {
        let filterConditionsForm = this.formBuilder.group({
            condition: [filterConditions?.condition],
            rulesFormArray: this.formBuilder.array(
                this.createConditions(filterConditions?.rulesFormArray) as any
            ),
        });
        return filterConditionsForm;
    }

    addCase() {
        this.caseFormArray.push(
            this.formBuilder.group({
                columnName: [''],
                conditionsFormArray: this.formBuilder.array([]),
            })
        );
    }

    protected conditionsFormArray(index: number): FormArray {
        return this.caseFormArray
            .at(index)
            .get('conditionsFormArray') as FormArray;
    }

    addWhen(index: number) {
        this.conditionsFormArray(index).push(
            this.formBuilder.group({
                type: CaseConditionTypeEnum.WHEN,
                filterConditionsForm: this.formBuilder.group({
                    condition: new FormControl('and'),
                    rulesFormArray: this.formBuilder.array([]),
                }),
                resultForm: this.formBuilder.group({
                    resultType: CaseResultValueTypeEnum.TABLE_COLUMN,
                    tableName: '',
                    tableColumnName: '',
                    specificValue: '',
                }),
            })
        );
    }

    addElse(index: number) {
        this.conditionsFormArray(index).push(
            this.formBuilder.group({
                type: CaseConditionTypeEnum.ELSE,
                resultForm: this.formBuilder.group({
                    resultType: CaseResultValueTypeEnum.TABLE_COLUMN,
                    tableName: '',
                    tableColumnName: '',
                    specificValue: '',
                }),
            })
        );
    }

    removeCase(index: number) {
       /* const dialogRef = this.openDialog(
            QueryBuilderConstants.CASE_DELETE_CONFIRMATION_MSG
        );
        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                if (result === 'confirmed') {
                    this.caseFormArray.removeAt(index);
                }
            });*/
            if(this.openDialog(QueryBuilderConstants.CASE_DELETE_CONFIRMATION_MSG)){
                this.caseFormArray.removeAt(index);
            }
    }

    removeJoinCondition(joinTableArrayIndex: number, joinConditionIndex: number) {
        this.conditionsFormArray(joinTableArrayIndex).removeAt(
            joinConditionIndex
        );
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
        this.caseConfigIndex = index;
    }

    isWhenCondition(formGroup: any): boolean {
        return formGroup.value.type === CaseConditionTypeEnum.WHEN;
    }

    disableElseButton(index: number): boolean {
        const conditions = this.conditionsFormArray(index).value;
        const hasElse = conditions.some(
            (item: any) => item.type === CaseConditionTypeEnum.ELSE
        );
        const noWhen = conditions.every(
            (item: any) => item.type !== CaseConditionTypeEnum.WHEN
        );

        return hasElse || noWhen;
    }

    disableWhenButton(index: number): boolean {
        const conditions = this.conditionsFormArray(index).value;
        return conditions.some(
            (item: any) => item.type === CaseConditionTypeEnum.ELSE
        );
    }
}
