
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormControl, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { Subject, BehaviorSubject, debounceTime, takeUntil } from 'rxjs';
import { IDropdownData } from '../../utils/interfaces';
import { QueryBuilderConstants } from '../../utils/query-builder.constants';
import { QueryBuilderService } from '../../utils/services/query-builder.service';
import { QueryBuilderStore } from '../../utils/query-builder.store';
import { ConditionTypeEnum } from '../../utils/enums';

@Component({
    standalone:false,
    selector: 'app-condition-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
})
export class GroupComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    alreadySelectedTableList$ = new BehaviorSubject<IDropdownData[]>([]);
    operators: IDropdownData[] = QueryBuilderConstants.CONDITION_OPERATORS;

    @Input() filterConditionsForm!: FormGroup;
    @Input() isFirstGroup: boolean = false;
    @Input() parentFormArray!: FormArray;
    @Input() index!: number;
    @Output() filterConditionChanged = new EventEmitter();

    constructor(
        private formBuilder: FormBuilder,
        private queryBuilderStore: QueryBuilderStore,
        private queryBuilderService: QueryBuilderService
    ) {}
    typeCheck(val: any){
        return val;
    }
    ngOnInit(): void {
        this.initSelectedTableList();
        this.filterConditionsForm.valueChanges
            .pipe(debounceTime(1000))
            .subscribe((data: any) => {
                this.filterConditionChanged.emit(data);
            });
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

    onSelectDropdownData(event:any, index:number, controlName: string) {
        this.rulesFormArray.at(index).get(controlName)?.setValue(event.value);
    }

    private getAlreadySelectedTableList(selectedTablesMap: any): IDropdownData[] {
        if (!selectedTablesMap) return [];
        return Array.from(selectedTablesMap.values()).filter(
            (dropdownData: any) => dropdownData.value !== null
        ) as IDropdownData[];
    }

    get rulesFormArray(): FormArray {
        return this.filterConditionsForm.get('rulesFormArray') as FormArray;
    }

    protected addCondition(formGroup: FormGroup) {
        const rulesFormArray = formGroup.get('rulesFormArray') as FormArray;
        rulesFormArray.push(
            this.formBuilder.group({
                type: [ConditionTypeEnum.NORMAL_CONDITION],
                leftTableName: [''],
                leftTableColumn: [''],
                operator: [''],
                specificValue: [''],
            })
        );
    }

    protected addGroup(formGroup: FormGroup) {
        const rulesFormArray = formGroup.get('rulesFormArray') as FormArray;
        rulesFormArray.push(
            this.formBuilder.group({
                type: [ConditionTypeEnum.GROUP_CONDITION],
                condition: new FormControl('and'),
                rulesFormArray: this.formBuilder.array([]),
            })
        );
    }

    isCondition(formGroup: any) {
        return formGroup.value.type === ConditionTypeEnum.NORMAL_CONDITION;
    }

    removeGroup() {
        this.parentFormArray.removeAt(this.index);
    }
}
