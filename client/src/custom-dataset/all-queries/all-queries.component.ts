import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
//import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CalculatedColumn } from '../query-builder/utils/interfaces';
import { QueryBuilderConstants } from '../query-builder/utils/query-builder.constants';
import { QueryBuilderStore } from '../query-builder/utils/query-builder.store';
import { QueryBuilderComponent } from '../query-builder/query-builder.component';
import { MatDialog } from '@angular/material/dialog';
import { UnionTypeEnum } from '../custom-dataset.constants';
import { ConfirmacionComponent } from '../../grid/confirm/confirm.component';
import { FlowComponent } from '../../visual-flow/components/flow/flow.component';

@Component({
    standalone:false,
    selector: 'app-all-queries',
    templateUrl: './all-queries.component.html',
    styleUrls: ['./all-queries.component.scss'],
})
export class AllQueriesComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    allQueryForm;
    queryIndex = -1;
    unionTypes = UnionTypeEnum;

    @Input() FullJsonData: string = '';
    @Output() allQueryFormValueChanged = new EventEmitter();

    constructor(
        private formBuilder: FormBuilder,
        //private _fuseConfirmationService: FuseConfirmationService,
        private queryBuilderStore: QueryBuilderStore,
        private dialog: MatDialog
    ) {
        this.allQueryForm = this.formBuilder.group({
            unionType: UnionTypeEnum.UNION,
            allQueryFormArray: this.formBuilder.array([]),
        });
    }
    isCard():boolean{
        //@ts-ignore
        return this.allQueryForm.get('allQueryFormArray')?.length
    }
    getUniunTypeCtrl(){
        return this.allQueryForm.get('unionType') as any
    }

    getWebQueryCtrl(i: number){
        return this.allQueryFormArray
        .at(i)
        .get('webQuery') as any;
    }

    ngOnInit(): void {
        this.allQueryForm.valueChanges
            .pipe(debounceTime(1000))
            .subscribe((data: any) => {
                this.allQueryFormValueChanged.emit(data);
            });

        this.initData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get allQueryFormArray(): FormArray {
        const formArray = this.allQueryForm?.get('allQueryFormArray');
        if (!formArray) {
            throw new Error('Form array not initialized');
        }
        return formArray as FormArray;
    }

    private initData() {
        if (this.FullJsonData) {
            const { unionType, allQueries } = JSON.parse(this.FullJsonData);
            this.allQueryForm.controls.unionType.setValue(unionType);
            this.queryBuilderStore.patchState({
                allQueries: allQueries,
            });
        }

        const allQueries = this.queryBuilderStore.getAllQueries();
        allQueries.forEach((query) => {
            this.allQueryFormArray.push(
                this.formBuilder.group({
                    webQuery: [query.webQuery],
                })
            );
        });

        this.allQueryFormValueChanged.emit(this.allQueryForm.value);
    }

    addQuery() {
        this.allQueryFormArray.push(
            this.formBuilder.group({
                webQuery: '',
            })
        );
    }

    removeQuery(index: number) {
        const dialogRef = this.openDialog(
            QueryBuilderConstants.QUERY_DELETE_CONFIRMATION_MSG
        );
        dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                if (result === 'confirmed') {
                    this.allQueryFormArray.removeAt(index);
                    let allQueries = this.queryBuilderStore.getAllQueries();
                    let selectedTablesMapList =
                        this.queryBuilderStore.getSelectedTablesMapList();

                    allQueries.splice(index, 1);
                    selectedTablesMapList.splice(index, 1);

                    this.queryBuilderStore.patchState({
                        allQueries: allQueries,
                        selectedTablesMapList: selectedTablesMapList,
                    });
                }
            });
    }

    openDialog(msg: string) {
        return this.dialog.open(ConfirmacionComponent, {data:{title:'Confirm', message:msg}})
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
    }

    setStep(index: number) {
        this.queryIndex = index;
    }

    protected openQueryBuilderModal(index: number) {
        this.queryBuilderStore.patchState({
            currentQueryIndex: index,
        });

        this.dialog
            .open(FlowComponent, {
                data: {
                    query: '',
                },
                height: "calc(100% - 5px)",
                width: "calc(100% - 100px)",
                maxWidth: "100%",
                maxHeight: "100%",
                disableClose: true,
            })
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((res) => {
                if (res && res.saveClicked && this.allQueryFormArray) {
                    
                    this.allQueryFormArray
                        .at(res.index)
                        .get('webQuery')
                        ?.setValue(res.query);
                }
            });
    }
}
