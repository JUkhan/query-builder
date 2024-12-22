
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IDropdownData } from '../../utils/interfaces';
import { QueryBuilderConstants } from '../../utils/query-builder.constants';
import { QueryBuilderStore } from '../../utils/query-builder.store';
import { QueryBuilderService } from '../../utils/services/query-builder.service';
import { CONDITION_OPERATORS_ENUM } from '../../utils/enums';

@Component({
    standalone:false,
    selector: 'app-condition',
    templateUrl: './condition.component.html',
    styleUrls: ['./condition.component.scss'],
})
export class ConditionComponent implements OnInit {
    private destroy$ = new Subject<void>();
    alreadySelectedTableList$ = new BehaviorSubject<IDropdownData[]>([]);
    operators: IDropdownData[] = QueryBuilderConstants.CONDITION_OPERATORS;
    conditionsForm!: FormGroup;
    showValueField: boolean = true;

    @Input() conditionsFormArray!: FormArray;
    @Input() index!: number;

    constructor(
        private queryBuilderStore: QueryBuilderStore,
        protected queryBuilderService: QueryBuilderService
    ) {}

    ngOnInit(): void {
        this.conditionsForm = this.conditionsFormArray.at(
            this.index
        ) as FormGroup;
        this.initSelectedTableList();
        const operator = this.conditionsForm.controls['operator'].value;
        if (
            operator === CONDITION_OPERATORS_ENUM.IS_NULL ||
            operator === CONDITION_OPERATORS_ENUM.IS_NOT_NULL
        ) {
            this.showValueField = false;
        }
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

    private getAlreadySelectedTableList(selectedTablesMap: any): IDropdownData[] {
        if (!selectedTablesMap) return [];
        return Array.from(selectedTablesMap.values()).filter(
            (dropdownData: any) => dropdownData.value !== null
        ) as IDropdownData[];
    }

    onSelectDropdownData(event:any, index: number, controlName: string) {
        this.conditionsForm.get(controlName)?.setValue(event.value);
        if (
            event.value === CONDITION_OPERATORS_ENUM.IS_NULL ||
            event.value === CONDITION_OPERATORS_ENUM.IS_NOT_NULL
        ) {
            this.showValueField = false;
        } else {
            this.showValueField = true;
        }
    }

    removeCondition(index: number) {
        this.conditionsFormArray.removeAt(index);
    }
}
