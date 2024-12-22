import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, OnDestroy, ViewChild, AfterViewInit, TemplateRef, ElementRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ColGroupDef, GridReadyEvent, GetRowIdFunc, GridOptions, RowModelType, IDatasource, IGetRowsParams } from 'ag-grid-community';
import { Observable, Subject, forkJoin, fromEvent, map, takeUntil } from 'rxjs';
import { ToolbarButton } from '../interfaces/toolbar-action';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { ActionComponent, DeleteAction, EditAction } from '../action.component';
//import { FuseConfirmationService } from '@streamstech/ui-sdk/fuse/services';
import { SetFilterComponent, RequestForResourceData, ReceivingResourceData, ResourceModel } from '../set-filter.component';
import { CellRendererComponent } from '../cell.renderer.component';
import { toTitleCaseModel, toSnakeCase, toSnakeCaseModel, toTitleCase } from '../case-conversion';
import { MatDialog } from '@angular/material/dialog';
import { ColumnSelectorComponent } from '../column-selector/column-selector.component';
import { ApiService  } from '../../services/api.service';
import { SidebarService,   } from '../../services/sidebar.service';
import { action$, dispatch } from '../../services/state';
import { DateTimeService } from '../../services/date-time.service';
import { EventEmitterService } from '../../services/event-emitter.service';
import { ConstantService } from '../../services/constants.service';


@Component({
    standalone:false,
    selector: 'stl-grid',
    templateUrl: './stl-grid.component.html',
    styleUrls: ['./stl-grid.component.scss']
})
export class StlGridComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() columnDefs: ColDef[] = [];
    @Input() defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 150,
        flex: 1
    };
    @Input() defaultColGroupDef: ColGroupDef | undefined;
    //@ts-ignore
    @Input() rowData: Observable<any[]> = null;
    @Output() gridReady = new EventEmitter<MneGrid>();
    @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
    @Input() model: string | undefined;
    @Input() actionsCol: ColDef | undefined;
    @Input() pageSize = 10;
    @Input() gridOptions: GridOptions = {
        animateRows: true,
        pagination: true,
        cacheBlockSize: this.pageSize,
        suppressServerSideInfiniteScroll: true,
        paginationPageSize: this.pageSize,
        enableCellChangeFlash: true,
    };
    @Input() rowModelType: RowModelType = 'infinite';
    @Input() formTitle: string = '';
    //@ts-ignore
    @Input() title: string;
    @Input() downLoadPdfEnabled: boolean = true;
    @Input() downLoadCsvEnabled: boolean = true;
    @Input() downLoadExcelEnabled: boolean = false;
    @Input() downLoadJpgEnabled: boolean = false;
    @Input() showDownLoadButton: boolean = true;
    @Input() showColumnsButton: boolean = true;
    @Input() showSearchButton: boolean = false;
    //@ts-ignore
    @Input() toolbarButtons: ToolbarButton[] = [];
    //@ts-ignore
    @ViewChild('stlFormContainer', { read: TemplateRef<any> }) stlFormContainer: TemplateRef<any>;
    //@ts-ignore
    @Input() formTemplate: TemplateRef<any>;
    //@ts-ignore
    @Input() toolbarTemplate: TemplateRef<any>;
    @Input() haveAdditionalFormFields: boolean = false;
    @Input() buttonPermissions: string[] = [];
    @Input() showCreateButton: boolean = true;
    //@ts-ignore
    @Input() permittedActionsPrefix: string;
    @Input() strictlyHideOrShowCreateButton: boolean = false;
    //@ts-ignore
    @Input() formSelector: string;
    //@ViewChild(StlFormComponent) stlFormComponent: StlFormComponent;
    @Output() selectedIdsEmitter = new EventEmitter();
    @Output() selectedRowDataEmitter = new EventEmitter();
    @Output() createDataEmitter = new EventEmitter();
    @Output() saveOrCancelEmitter = new EventEmitter();
    //@ts-ignore
    @Input() customFormInfo;
    @Input() inputComponents: string[] = [];
    @Input() tableConfig: any[] = [];
    @Input() showBackButton = false;
    @Output() backHandler = new EventEmitter();
    @Input() tableName='';
    @ViewChild('tableContent') tableContent!: ElementRef<HTMLElement>;
    searchBoxVisibility: boolean = false;
    searchInputValue = '';
    sliderWidth: number = 45;
    showFilter: boolean = false;
    invokingUrlList: string[] = [];
    resourceStorage: { [key: string]: ResourceModel[] } = {};
    inputFormTitle: string = '';
    formRowData: any = [];

    private destroy$ = new Subject<void>();
    private isDataAddModeOn: boolean = false;
    constructor(
        private changeDetector: ChangeDetectorRef,
        private constant: ConstantService,
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private eventEmitterService: EventEmitterService,
        //private messageService: AlertMessageService,
        private dateTimeService: DateTimeService,
        //private _fuseConfirmationService: FuseConfirmationService,
        private dialog: MatDialog,
        private sidebarService: SidebarService
    ) {
    }

    @Input() getRowId: GetRowIdFunc = (params: any) => params.data.id;
    ngOnInit(): void {
        if (this.tableConfig.length === 0) {
            this.loadConfig();
        }
        action$.isA(RequestForResourceData)
            .pipe(takeUntil(this.destroy$)).subscribe((req) => {
                if (!this.resourceStorage[req.resourceKey]) { return; }
                dispatch(new ReceivingResourceData(req.resourceKey, this.resourceStorage[req.resourceKey].filter(el => el.label.toLowerCase().includes(req.search))));
            });
    }
    ngAfterViewInit(): void {
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    onGridReady(params: GridReadyEvent): void {
        const mneGrid = this.agGrid as MneGrid;
        mneGrid.stlGrid = this;
       
        if (this.rowModelType === 'infinite') {
            params.api.setDatasource(this.getDataSource());
        }
        this.injectPageSizeElm();
        this.gridReady.emit(mneGrid);
    }
    injectPageSizeElm(): void {
        const pageSize: HTMLElement = document.createElement('span');
        pageSize.classList.add('ag-paging-page-size');
        const pageSizes=[10,20,50,100].map(it=>it===this.pageSize? `<option selected value="${it}">${it}</option>`:`<option value="${it}">${it}</option>`)
        pageSize.innerHTML = `<span class="ag-label">Page Size</span><select title="" value=${this.pageSize} name="pageSize" class="pageSize">${pageSizes}</select>`;
        
        const pagingPanel = this.tableContent.nativeElement.querySelector('.ag-paging-panel');
        const pageSizeSelect:any = pageSize.querySelector('.pageSize');
        
        if (pagingPanel && pageSizeSelect) {
            pagingPanel.prepend(pageSize);
            pageSizeSelect.addEventListener('change', (el: any) => {
                this.agGrid.api.paginationSetPageSize(+el.target.value);
                this.agGrid.api.paginationGoToPage(0);
            });
        }
    }
    detectChanges(): void {
        this.changeDetector.detectChanges();
    }
    emitCreateEvent(): void {
        /*this.openSidebar();
        this.isDataAddModeOn = true;
        this.inputFormTitle = 'New ' + this.formTitle;
        this.formRowData = {};*/
        this.createDataEmitter.emit();
    }
    openDialog(): any {
        /*return this._fuseConfirmationService.open({
            title: ConstantService.Message.INCOMPLETE_TASK_TITLE,
            message: ConstantService.Message.INCOMPLETE_TASK_WARNING_MESSAGE,
            // message: `Are you sure you want to delete this ${this.row.model}?`,
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
    openColumnsDialog(event: MouseEvent): void {
        const clickedButton: ElementRef = new ElementRef(event.currentTarget);
        const dialogRef = this.dialog.open(ColumnSelectorComponent, {
            data: {
                trigger: clickedButton,
                //@ts-ignore
                columnDefs: this.agGrid.api.getColumnDefs().map((it: any) => ({ field: it.field, headerName: it.headerName || toTitleCase(it.field, ' '), visible: !it.hide })),
                callback: (arr: string[], flag: boolean) => this.agGrid.columnApi.setColumnsVisible(arr, flag),
                scrollEvent: fromEvent(document, 'scroll')
            },
        });

        dialogRef.afterClosed().subscribe();
    }
    canDeactivate(): boolean | Promise<boolean> {
        return false;
        /*if (this.isDataAddModeOn === true) {
            return this.openDialog()
                .afterClosed()
                .pipe(
                    map((res: string) => res === 'confirmed')
                )
                .toPromise();
        } else {
            return true;
        }*/
    }
    toggleSearchBox(): void {
        this.searchBoxVisibility = !this.searchBoxVisibility;
        this.searchInputValue = '';
        this.agGrid.api.setQuickFilter(this.searchInputValue);
    }
    applySearch(ev: any): void {
        this.agGrid.api.setQuickFilter(this.searchInputValue);
    }
    formCancel(): void {
        this.closeSidebar();
        this.isDataAddModeOn = false;
        this.saveOrCancelEmitter.emit();
    }
    receiveComponentData(data: any): void {
        const operationKey = data.Id
            ?ConstantService.OperationType.UPDATE
            : ConstantService.OperationType.INSERT;
        if (!data.Id) {
            delete data['Id'];
        }
        if (this.model === 'User') {
            data.ClientUrl = window.location.protocol + '//' + window.location.host;
        }
        const grid = this.agGrid as MneGrid;
        if (grid.beforeSubmit) {
            data = grid.beforeSubmit(data);
        }
        /*this.apiService
            .post(getCrudUrl(this.model!, ConstantService.ApiType.CRUD, operationKey), data)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    if (!res.isSuccess) {
                        this.messageService.showErrorMessage(res.message);
                    } else {
                        this.closeSidebar();
                        this.saveOrCancelEmitter.emit();
                        this.isDataAddModeOn = false;
                        this.messageService.showSuccessMessage();
                        if (operationKey === ConstantService.OperationType.INSERT) {
                            this.updateRowCount(1);
                        } else {
                            const record = toSnakeCaseModel(res.data);
                            const rowNode = this.agGrid.api.getRowNode(record.id);
                            rowNode?.updateData(record);
                            setTimeout(() => {
                                rowNode?.setData(record);
                            }, 100);
                        }
                    }
                },
                error: (e: any) => {
                    this.messageService.showError();
                    console.error(e);
                }
            });*/
    }
    closeSidebar(): void {
        this.sidebarService.close();
    }
    manualFormData(data: any): void {
        this.isDataAddModeOn = false;
        this.saveOrCancelEmitter.emit();
        this.initializeTable();
    }
    goBack(): void {
        this.backHandler.emit();
    }
    private openSidebar(): void {
        const grid = this.agGrid as MneGrid;
        if (grid.sidebarOpening) {
            grid.sidebarOpening();
        }
        this.sidebarService.sidebarWidth = 45;
        this.sidebarService.sidebarContainerRef.clear();
        this.sidebarService.sidebarContainerRef.createEmbeddedView(this.formTemplate || this.stlFormContainer);
        this.sidebarService.open();
    }
    private deleteRow(data: any): void {
        /*this.apiService
            .post(
                getCrudUrl(
                    this.model!,
                    ConstantService.ApiType.CRUD,
                    ConstantService.OperationType.DELETE,
                    data.Id
                ),
                data.Id
            )
            .subscribe({
                next: (res: any) => {
                    if (!res.isSuccess) {
                        this.messageService.showErrorMessage(res.message);
                    } else {
                        this.updateRowCount(-1);
                        this.eventEmitterService.emitClickEvent(data.Id);
                        this.messageService.showDeleteMessage();
                    }
                },
                error: (error) => {
                    console.error('There was an error!', error);
                },
            });*/
    }

    private loadConfig(): void {
        if (!this.model) {
            this.activatedRoute.data.pipe(takeUntil(this.destroy$)).subscribe({
                next: (res: any) => {
                    this.model = res.model;
                    if (!this.model) { return; }
                    this.title = res.title;
                    this.showFilter = res.showFilter;
                    this.haveAdditionalFormFields = res.haveAdditionalFormFields
                        ? true
                        : false;
                    if (res.actionsCol) {
                        this.actionsCol = res.actionsCol;
                    }
                    this.initializeTable();
                    this.formTitle = res.formTitle;
                    this.inputComponents = res.inputComponents;
                    this.buttonPermissions = res.buttonPermissions
                        ? res.buttonPermissions
                        : [];
                    this.formSelector = res.formSelector;
                    this.customFormInfo = res.customFormInfo;
                    this.showCreateButton =
                        res.showCreateButton === undefined
                            ? true
                            : res.showCreateButton;
                    this.permittedActionsPrefix = res.permittedActionsPrefix
                        ? res.permittedActionsPrefix
                        : '';
                    this.strictlyHideOrShowCreateButton =
                        res.strictlyHideOrShowCreateButton === undefined
                            ? false
                            : res.strictlyHideOrShowCreateButton;
                    this.setPermittedActions();
                },
                error: (err) => {
                    console.log(err.message);
                },
                complete: () => { },
            });
        } else {
            this.setPermittedActions();
            this.initializeTable();
        }
    }

    private getTableConfig(): Observable<any[]> {
        return this.apiService
            .get(
                getCrudUrl(
                    this.model!,
                    this.haveAdditionalFormFields
                        ? ConstantService.ApiType.DYNAMIC_CONFIG
                        : ConstantService.ApiType.CONFIG,
                        ConstantService.OperationType.GET
                )
            ) as any;
    }
    private initializeTable(): void {
        if (!this.model) { return; }
        this.getTableConfig()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (configs) => {
                    this.tableConfig = configs;
                    const grid = this.agGrid as MneGrid;
                    if (grid.mutateTableConfig) {
                        this.tableConfig = grid.mutateTableConfig(this.tableConfig);
                    }
                    let cols = configs.reduce(this.mapCol, []);
                    const customButtons = configs.find(it => it.isCrudButtons);
                    cols = this.addActionsCol(cols, customButtons);
                    if (grid.mutateColDefs) {
                        cols = grid.mutateColDefs(cols);
                    }
                    this.columnDefs = cols;
                    this.setMultiOptionValue();
                },
                error: (e: any) => console.error(e)
            });
    }
    private mapCol = (acc: ColDef[], it: any): ColDef[] => {
        if (it.isCrudButtons || it.name === 'Crud-Buttons' || !it.label) {
            return acc;
        }
        if (!(it.list && it.list.hidden)) {
            const col: ColDef = { field: toSnakeCase(it.name), headerName: it.label, filter: SetFilterComponent, filterParams: { tableName: this.model, columnName: it.name } };
            if (this.hasAnotherDataSource(it)) {
                col.cellRenderer = (params: any): any => {
                    const find = (this.resourceStorage[params.resourceKey] ?? []).find(el => el.value === params.value);
                    return find ? find.label : '';
                };
                col.cellRendererParams = { resourceKey: it.list.optionSource };
            }
            else if (this.isDateType(it)) {
                col.cellRenderer = (params: any): any => {
                    if (!params.value || params.value === '0001-01-01T00:00:00') {
                        return '';
                    }
                    return this.dateTimeService.formatDate(params.value);
                };
            }
            else if (it.list && it.list.cellTemplate) {
                col.cellRenderer = CellRendererComponent;
                col.cellRendererParams = { templateName: it.list.cellTemplate };
            }
            if (it.list && it.list.width) {
                col.flex = 0;
                col.width = it.list.width;
            }
            acc.push(col);
        }
        return acc;
    };
    private addActionsCol(columnDefs: ColDef[], config: any): ColDef[] {
        if (!this.actionsCol) {
            const col = {
                sortable: false,
                filter: false,
                resizable: false,
                flex: 1, field: 'id',
                headerName: 'Actions',
                cellRenderer: ActionComponent,
                cellRendererParams: {}
            };
            this.setCrudActions(col, config);
            columnDefs.push(col);
            return columnDefs;
        } else {
            if (!this.actionsCol.field) {
                this.actionsCol.field = 'id';
            }
            this.setCrudActions(this.actionsCol, config);
            columnDefs.push(this.actionsCol);
        }
        return columnDefs;
    }

    private setCrudActions(col: ColDef, config: any): void {
        if (!col.cellRendererParams) { col.cellRendererParams = {}; }
        col.cellRendererParams.hasEditPermission = this.buttonPermissions.includes('edit');
        col.cellRendererParams.hasDeletePermission = this.buttonPermissions.includes('delete');
        col.cellRendererParams.crudEdit = (data: any): void => {
            data = toTitleCaseModel(data);
            this.inputFormTitle = 'Edit ' + this.formTitle;
            this.formRowData = Object.assign({}, data);
            this.openSidebar();
            dispatch(new EditAction(this.model, data));
        };
        col.cellRendererParams.crudDelete = (data: any): void => {
            data = toTitleCaseModel(data);
            this.deleteRow(data);
            dispatch(new DeleteAction(this.model, data));
        };
        col.cellRendererParams.customButtons = [];
        if (config) {
            col.cellRendererParams.customButtons = config.list.customButtons;
        }
    }
    private setPermittedActions(): void {
        this.constant.permittedAction$.subscribe({
            next: (res) => {
                if (res.length && this.permittedActionsPrefix) {
                    if (!this.strictlyHideOrShowCreateButton) {
                        //we will strictly hide or shown the add button if strictlyHideOrShowCreateButton = true even if there is a permission
                        this.showCreateButton = res.includes(
                            this.permittedActionsPrefix + '_create'
                        );
                    }

                    if (res.includes(this.permittedActionsPrefix + '_update')) {
                        if (!this.buttonPermissions.includes('edit')) {
                            this.buttonPermissions.push('edit');
                        }
                    }
                    if (res.includes(this.permittedActionsPrefix + '_delete')) {
                        if (!this.buttonPermissions.includes('delete')) {
                            this.buttonPermissions.push('delete');
                        }
                    }
                } else if (res.length && this.model) {
                    if (!this.strictlyHideOrShowCreateButton) {
                        //we will strictly hide or shown the add button if strictlyHideOrShowCreateButton = true even if there is a permission
                        this.showCreateButton = res.includes(
                            this.model + '_create'
                        );
                    }
                    if (res.includes(this.model + '_update')) {
                        if (!this.buttonPermissions.includes('edit')) {
                            this.buttonPermissions.push('edit');
                        }
                    }
                    if (res.includes(this.model + '_delete')) {
                        if (!this.buttonPermissions.includes('delete')) {
                            this.buttonPermissions.push('delete');
                        }
                    }
                }
            },
            error: (e) => {
                console.log(e);
            },
        });
    }

    private setMultiOptionValue(): void {
        const observables: Observable<any>[] = [];
        this.invokingUrlList = [];

        this.tableConfig?.forEach((element) => {
            if (this.hasAnotherDataSource(element)) {
                if (!this.invokingUrlList.includes(element.list.optionSource)) {
                    this.invokingUrlList.push(element.list.optionSource);

                    const observable = this.apiService
                        .get(element.list.optionSource)
                        .pipe(takeUntil(this.destroy$));

                    observables.push(observable);
                }
            }
        });

        if (observables.length > 0) {
            forkJoin(observables).subscribe((responses: any[]) => {
                responses.forEach((res, index) => {
                    const optionSource = this.invokingUrlList[index];
                    this.resourceStorage[optionSource] = res;
                });
                this.agGrid.api.redrawRows();
            });
        }
    }

    private hasAnotherDataSource(element: any): boolean {
        return element.hasOwnProperty('list') &&
            element.list.hasOwnProperty('type') &&
            (element.list.type === 'multiOption' ||
                element.list.type === 'dropdown');
    }
    private isDateType(element: any): boolean {
        return (
            element.hasOwnProperty('edit') &&
            element.edit.hasOwnProperty('type') &&
            element.edit.type === 'datepicker'
        );
    }
    private getDataSource(): IDatasource {
        return {
            getRows: (params: IGetRowsParams): void => {
                if(!(this.model||this.tableName)){return;}
                this.apiService.post('Table/GetFilteredTableData', this.getPayload(params))
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((res: any) => {
                        params.successCallback(
                            res.data,
                            res.rowCount.total
                        );
                    });
            }
        };
    };
    private getPayload(params: IGetRowsParams): any {
        let orderBy = '';
        if (params.sortModel.length) {
            orderBy = `${params.sortModel[0].colId} ${params.sortModel[0].sort}`;
        }
        return {
            table: `"${toSnakeCase(this.model||this.tableName)}"`,
            page: Math.floor(params.startRow / (this.gridOptions.paginationPageSize??1)),
            limit: this.gridOptions.paginationPageSize,
            orderBy,
            condition: JSON.stringify(params.filterModel)
        };
    }
    public updateRowCount(count: number): void {
        const maxRowFound = this.agGrid.api.isLastRowIndexKnown();
        if (maxRowFound) {
            const rowCount = this.agGrid.api.getInfiniteRowCount() || 0;
            this.agGrid.api.setRowCount(rowCount + count);
        }
        this.agGrid.api.refreshInfiniteCache();
    }
}

export interface MneGrid extends AgGridAngular {
    mutateTableConfig: (config: any[]) => any[];
    beforeSubmit: (formData: any) => any;
    sidebarOpening: () => void;
    mutateColDefs: (config: ColDef[]) => ColDef[];
    sidebarInstance: MatSidenav;
    stlGrid:StlGridComponent;
}

function buildUrl(routingKey: string, apiType: string, operationType: string) {
    return `${apiType}/${
        routingKey.charAt(0).toUpperCase() + routingKey.slice(1)
    }/${operationType}`;
  }

  export function getCrudUrl(routingKey: string, apiType: string, operationType: string, id?: string) {
    return buildUrl(routingKey, apiType, operationType) + (id? `/${id}` : '');
  }
  