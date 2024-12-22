import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaType } from '../interfaces/QueryType';
import type { MneGrid } from '../../grid/stl-grid/stl-grid.component';
import { ColDef } from 'ag-grid-community';
//import { SetFilterComponent } from 'app/shared/components/core-components/table-components/table-wrapper2/setFilter';
import { Subject, takeUntil } from 'rxjs';
import { toTitleCase } from '../../grid/case-conversion';
import { CustomDatasetService } from '../services/custom-dataset.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSidenav } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { SidebarActionsService } from '../services/sidebar-actions.service';
import { ISidebarAction } from '../interfaces/SidebarAction';

@Component({
    standalone:false,
    selector: 'app-custom-dataset-view-table',
    templateUrl: './custom-dataset-view-table.component.html',
    styleUrls: ['./custom-dataset-view-table.component.scss'],
})
export class CustomDatasetViewTableComponent implements OnInit {
    isOpen: boolean = false;
    exportExcelPayload: object = {};
    destroy$ = new Subject<void>();
    schemaName!: string;
    tableName!: string;
    queryType!: string;
    webQuery!: string;
    tableTitle!: string;
    @ViewChild('stlFormContainer', { read: TemplateRef<any> })
    stlFormContainer!: TemplateRef<any>;
    dataSetId: string = '';
    columnName: string = '';
    columnQString: string = '';
    pageSize: number = 10;
    currentPage: number = 1;
    sideNavContent!: string;
    //@ViewChild('drawer') public filterDataSidebar: MatSidenav;
    @ViewChild(MatPaginator)
    paginator!: MatPaginator;
    responseID!: string;
    displayedColumns = ['FileName', 'status', 'CreateTime', 'DownloadingPath'];
    pageSizeOptions: number[] = [10, 20, 50, 100];
    dataSource!: MatTableDataSource<any>;
    downloadButtonEnabled: boolean = false;
    dataDeleteButtonEnabled: boolean = false;
    totalRowData = 0;
    pageNumber = 0;
    sidebarActions!: ISidebarAction;
    displayedColumnNames: string[] = [
        'File Name',
        'Status',
        'Create Time',
        'Action',
    ];
    accessControlFilter: { [key: string]: boolean } = {
        'country_id': true,
        'project_id': true,
        'office_id': true,
        'catchment_id': true,
    };
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private customDatasetService: CustomDatasetService,
        private sidebarActionsService: SidebarActionsService
    ) {}

    ngOnInit(): void {}
    private getCustomTableViewConfiguration() {
        this.activatedRoute.params.subscribe((params: any) => {
            this.dataSetId = params.dataSetId;
        });

        this.customDatasetService
            .getDataSetName()
            .subscribe((dataSetName) => (this.tableName = dataSetName));
        this.customDatasetService
            .getQueryType()
            .subscribe((queryType) => (this.queryType = queryType));
        this.customDatasetService
            .getWebQuery()
            .subscribe((webQuery) => (this.webQuery = webQuery));

        this.tableTitle = toTitleCase(this.tableName);
        const tableNameValue = this.tableName;
        this.tableName = tableNameValue;
        if(this.webQuery != "Query"){
            this.schemaName = SchemaType.CUSTOM_DATASET;
        }
        if (this.tableName === '') {
            this.router.navigate(['../../'], {
                relativeTo: this.activatedRoute,
            });
            return;
        }
    }

    onExportExcelData(exportData: { columnFilter: any; selectedColumns: any }): void {
        const { columnFilter, selectedColumns } = exportData;
        this.exportExcelPayload = {
            schema: this.schemaName,
            table: this.tableName,
            dataSetId: this.dataSetId,
            columnFilter: columnFilter,
            selectedClolumns: selectedColumns,
            accessControlFilter: JSON.stringify(this.accessControlFilter),
        };
        this.sidebarActions = {
            sideBarOpenStatus: true,
            dataSetId: this.dataSetId,
            payload: this.exportExcelPayload,
        };
        this.sidebarActionsService.setsidebarActions(this.sidebarActions);
    }
    fileStatus(event: { flag: string }) {
        this.sideNavContent = event.flag;
        this.sidebarActions = {
            sideBarOpenStatus: true,
            dataSetId: this.dataSetId,
            payload: {},
        };
        this.sidebarActionsService.setsidebarActions(this.sidebarActions);
    }
    onGridReady(grid: MneGrid): void {
        this.getCustomTableViewConfiguration();
        this.loadTableColumns(grid);
    }
    loadTableColumns(grid: MneGrid): void {
        if (this.tableName === '') {
            this.router.navigate(['../../'], {
                relativeTo: this.activatedRoute,
            });
            return;
        }

        this.customDatasetService
            .getTableColumns(this.schemaName, this.tableName)
            .pipe(takeUntil(this.destroy$))
            .subscribe((res: any) => {
                const cols = res.data as any[];
                const colDefs = cols.reduce((acc, el) => {
                    acc.push({
                        field: el.columnName,
                        headerName: toTitleCase(el.columnName, ' '),
                        /*filter: SetFilterComponent,
                        filterParams: {
                            schemaName: this.schemaName,
                            tableName: this.tableName,
                            columnName: el.columnName,
                            accessControlFilter: this.accessControlFilter,
                            queryType: this.queryType
                        },*/
                    } as ColDef);
                    return acc;
                }, []);
                grid.api.setColumnDefs(colDefs);
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
