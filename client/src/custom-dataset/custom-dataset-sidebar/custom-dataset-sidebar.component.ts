import {
    Component,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomDatasetService } from '../services/custom-dataset.service';
/*import {
    AlertMessageService,
    DateTimeService,
    SidebarService,
} from '@streamstech/ui-sdk/services';*/
import {ConstantService, DateTimeService} from '../../services'
import { FileDownloadService } from '../services/file-download.service';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSidenav } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { SidebarActionsService } from '../services/sidebar-actions.service';
import { ISidebarAction } from '../interfaces/SidebarAction';
import { MatDialog } from '@angular/material/dialog';
import { CustomDatasetDownloadedFileDetailsPreviewComponent } from '../custom-dataset-downloaded-file-details-preview/custom-dataset-downloaded-file-details-preview.component';

@Component({
    standalone:false,
    selector: 'app-custom-dataset-sidebar',
    templateUrl: './custom-dataset-sidebar.component.html',
    styleUrls: ['./custom-dataset-sidebar.component.scss'],
})
export class CustomDatasetSidebarComponent implements OnInit {
    isOpen: boolean = false;
    dataSetId: string = '';
    exportExcelPayload: any;
    destroy$ = new Subject<void>();
    schemaName!: string;
    tableName!: string;
    tableTitle!: string;
    @ViewChild('stlFormContainer', { read: TemplateRef<any> })
    stlFormContainer!: TemplateRef<any>;
    columnName: string = '';
    columnQString: string = '';
    pageSize: number = 10;
    currentPage: number = 1;
    sideNavContent!: string;
    @ViewChild('drawer') public filterDataSidebar!: MatSidenav;
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
    private sidebarActionsSubscription!: Subscription;

    displayedColumnNames: string[] = [
        'File Name',
        'Status',
        'Create Time',
        'Action',
    ];
    constructor(
        private location: Location,
        private fileDownloadService: FileDownloadService,
        private dateTimeService: DateTimeService,
        //private messageService: AlertMessageService,
        private sidebarActionsService: SidebarActionsService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.sidebarActionsSubscription = this.sidebarActionsService
            .getsidebarActions()
            .subscribe((sidebarAction) => {
                this.isOpen = sidebarAction.sideBarOpenStatus;
                this.dataSetId = sidebarAction.dataSetId;
                this.exportExcelPayload = sidebarAction.payload;
                if (Object.keys(this.exportExcelPayload).length !== 0) {
                    this.exportExcelData(this.exportExcelPayload);
                } else if (this.isOpen && this.dataSetId.length > 0) {
                    this.getFileList();
                }
            });
    }
    ngOnDestroy(): void {
        if (this.sidebarActionsSubscription) {
            this.sidebarActionsSubscription.unsubscribe();
        }
    }

    pageChanged(event: PageEvent) {
        this.pageNumber = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getFileList();
    }
    closeMatDrawer() {
        this.columnQString = '';
        this.pageNumber = 0;
        this.isOpen = false;
        this.sidebarActions = {
            sideBarOpenStatus: false,
            dataSetId: '',
            payload: {},
        };
        this.sidebarActionsService.setsidebarActions(this.sidebarActions);
    }

    exportExcelData(exportExcelPayload: any) {
        this.fileDownloadService
            .exportExcelData(JSON.stringify(exportExcelPayload))
            .subscribe((res: any) => {
                this.fileStatus({ flag: 'fileStatus' });
            });
    }
    fileStatus(event: { flag: string }) {
        this.getFileList();
        this.sideNavContent = event.flag;
        this.isOpen = true;
    }
    downloadFile(filename: any, downloadPath: any) {
        this.fileDownloadService.downloadFile(downloadPath).subscribe((res) => {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(res);
            link.download = filename;
            link.click();
        });
    }
    getFileList() {
        this.fileDownloadService
            .getFileDownloadingStatus(
                this.pageNumber,
                this.pageSize,
                this.dataSetId
            )
            .subscribe((res: any) => {
                res.list.forEach((x: any) => {
                    x.createdTime = this.dateTimeService.formatDateWithTime(
                        new Date(x.createdTime).toLocaleString()
                    );
                });

                this.dataSource = new MatTableDataSource<any>(res.list);
                this.totalRowData = res.count;
                if (this.paginator) {
                    this.paginator.pageIndex = this.pageNumber;
                    this.paginator.length = this.totalRowData;
                }
            });
    }

    deleteFile(id: string) {
        this.fileDownloadService.deleteFile(id).subscribe(
            (res: any) => {
                alert(
                    ConstantService.Message.DELETE_SUCCESSFUL
                );
                this.pageNumber = 0;
                this.getFileList();
            },
            (err: any) => {
                //this.messageService.showError();
                alert('Error')
            }
        );
    }
    openDownloadedFileDetailsDialog(id: string) {
        const element = this.dataSource.filteredData.find((data) => {
            return data.id === id;
        });
        this.dialog.open(CustomDatasetDownloadedFileDetailsPreviewComponent, {
            data: element,
            minWidth: '60%',
            disableClose: false,
        });
    }

    goBack() {
        this.location.back();
    }
    closeSidebar() {
        this.isOpen = false;
        this.sidebarActions = {
            sideBarOpenStatus: false,
            dataSetId: '',
            payload: {},
        };
        this.sidebarActionsService.setsidebarActions(this.sidebarActions);
    }
}
