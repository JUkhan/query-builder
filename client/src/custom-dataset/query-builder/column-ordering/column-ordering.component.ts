import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    CalculatedColumn,
    SelectCase,
    SelectClauseCol,
} from '../utils/interfaces';
import { QueryBuilderStore } from '../utils/query-builder.store';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormGroup } from '@angular/forms';
import { QueryBuilderService } from '../utils/services/query-builder.service';
import { UtilsService } from '../utils/services/utils.service';

@Component({
    standalone:false,
    selector: 'app-column-ordering',
    templateUrl: './column-ordering.component.html',
    styleUrls: ['./column-ordering.component.scss'],
})
export class ColumnOrderingComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    selectClausePartsArray: SelectClauseCol[] = [];

    @Input() tableWiseSelectedColumnsForm!: FormGroup;
    @Input() selectCases: SelectCase[] = [];
    @Input() calculatedColumns: CalculatedColumn[] = [];
    @Output() columnOrderChanged = new EventEmitter();

    constructor(
        private queryBuilderStore: QueryBuilderStore,
        private queryBuilderService: QueryBuilderService,
        private utilService: UtilsService
    ) {}

    ngOnInit(): void {
        this.utilService.initSelectClause$
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res) this.initColumns();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initColumns(): void {
        console.log('init-columns::::::')
        this.selectClausePartsArray =
            this.queryBuilderService.generateSelectClauseColumnsArray({
                tableWiseSelectedColumnsForm: this.tableWiseSelectedColumnsForm,
                calculatedColumns: this.calculatedColumns,
                selectCases: this.selectCases,
            });
        this.columnOrderChanged.emit(this.selectClausePartsArray);
    }

    dropColumns($event: CdkDragDrop<SelectClauseCol[]>) {
        moveItemInArray(
            this.selectClausePartsArray,
            $event.previousIndex,
            $event.currentIndex
        );
        this.columnOrderChanged.emit(this.selectClausePartsArray);
    }
}
