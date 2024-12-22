import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CaseResultValueTypeEnum } from '../../utils/enums';
import { IDropdownData } from '../../utils/interfaces';
import { QueryBuilderConstants } from '../../utils/query-builder.constants';
import { QueryBuilderService } from '../../utils/services/query-builder.service';
import { QueryBuilderStore } from '../../utils/query-builder.store';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

@Component({
    standalone:false,
    selector: 'app-result',
    templateUrl: './result.component.html',
    styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    resultTypes: IDropdownData[] = QueryBuilderConstants.RESULT_TYPES;
    alreadySelectedTableList$ = new BehaviorSubject<IDropdownData[]>([]);
    @Input() resultForm!: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private queryBuilderStore: QueryBuilderStore,
        public queryBuilderService: QueryBuilderService
    ) {
        this.resultForm = this.formBuilder.group({
            resultType: CaseResultValueTypeEnum.TABLE_COLUMN,
            tableName: '',
            tableColumnName: '',
            specificValue: '',
        });
    }

    ngOnInit(): void {
        this.initSelectedData();
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
    }

    getAlreadySelectedTableList(selectedTablesMap: any): IDropdownData[] {
        return Array.from(selectedTablesMap.values()).filter(
            (dropdownData: any) => dropdownData.value !== null
        ) as IDropdownData[];
    }

    onSelectTableColumn(event: any) {
        this.resultForm.get('tableColumnName')?.setValue(event.value);
    }

    onSelectTable(event: any) {
        this.resultForm.get('tableName')?.setValue(event.value);
    }

    onSelectResultType(event:any ) {
        this.resultForm.get('resultType')?.setValue(event.value);
    }

    isTableColumnValue() {
        return (
            this.resultForm.value.resultType ===
            CaseResultValueTypeEnum.TABLE_COLUMN
        );
    }
}
