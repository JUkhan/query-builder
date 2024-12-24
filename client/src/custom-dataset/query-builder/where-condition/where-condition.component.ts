import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { QueryBuilderService } from '../utils/services/query-builder.service';
import { ConditionTypeEnum } from '../utils/enums';

@Component({
    standalone:false,
    selector: 'app-where-condition',
    templateUrl: './where-condition.component.html',
    styleUrls: ['./where-condition.component.scss'],
})
export class WhereConditionComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    @Input() filterConditionsForm!: FormGroup;
    @Input() populateFromStore: boolean = true;
    @Output() filterConditionChanged = new EventEmitter();

    constructor(
        private formBuilder: FormBuilder,
        private queryBuilderStore: QueryBuilderStore,
        private queryBuilderService: QueryBuilderService
    ) {
        this.filterConditionsForm = this.formBuilder.group({
            condition: new FormControl('and'),
            rulesFormArray: this.formBuilder.array([]),
        });
    }

    ngOnInit(): void {
        const fullJsonData = this.queryBuilderStore.getFullJsonData(
            this.queryBuilderStore.getCurrentQueryIndex()
        );
        if(fullJsonData && !fullJsonData.filterConditions)fullJsonData.filterConditions={}
        if (fullJsonData && this.populateFromStore) {
            this.initFilterConditionsFormData(fullJsonData);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onFilterConditionChanged(data: any) {
        this.filterConditionChanged.emit(data);
        let allQueries = this.queryBuilderStore.getAllQueries();
        
        if(this.queryBuilderStore.getCurrentQueryIndex()!==allQueries.length-1){
            allQueries[this.queryBuilderStore.getCurrentQueryIndex()]={filterConditions:data} as any
        }else{
            allQueries[this.queryBuilderStore.getCurrentQueryIndex()]={...allQueries[this.queryBuilderStore.getCurrentQueryIndex()], filterConditions:data} 
        }
        this.queryBuilderStore.patchState({
            allQueries: allQueries,
        });
    }

    createConditions(rules: any[]): FormGroup[] {
        if (!rules) return [];
        return rules.map((rule) => {
            if (rule.type === ConditionTypeEnum.NORMAL_CONDITION) {
                return this.formBuilder.group({
                    type: [rule.type],
                    leftTableName: [rule.leftTableName],
                    leftTableColumn: [rule.leftTableColumn],
                    operator: [rule.operator],
                    specificValue: [rule.specificValue],
                });
            }
            // GROUP_CONDITION case
            return this.formBuilder.group({
                type: [rule.type],
                condition: [rule.condition],
                rulesFormArray: this.formBuilder.array(
                    this.createConditions(rule.rulesFormArray)
                ),
            });
        });
    }

    private initFilterConditionsFormData(fullJsonData: any) {
        const { filterConditions } = fullJsonData;
        this.filterConditionsForm = this.formBuilder.group({
            condition: [filterConditions.condition],
            rulesFormArray: this.formBuilder.array(
                this.createConditions(
                    filterConditions.rulesFormArray ?? []
                ) as any
            ),
        });

        this.filterConditionChanged.emit(filterConditions);
    }
}
