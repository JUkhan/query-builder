import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomDatasetService } from '../services/custom-dataset.service';
import { SidebarActionsService } from '../services/sidebar-actions.service';
import { SchemaType } from '../interfaces/QueryType';
import { ISidebarAction } from '../interfaces/SidebarAction';

@Component({
    standalone:false,
    selector: 'app-custom-dataset-download-button',
    templateUrl: './custom-dataset-download-button.component.html',
    styleUrls: ['./custom-dataset-download-button.component.scss'],
})
export class CustomDatasetDownloadButtonComponent implements OnInit {
    constructor(
        private sidebarActionsService: SidebarActionsService
    ) {}
    dataSetId!: string;
    schemaName!: string;
    @Input() data: any;
    sidebarActions!: ISidebarAction;
    ngOnInit(): void {}
    onClick() {
        this.dataSetId = this.data.Id;

        this.schemaName = SchemaType.CUSTOM_DATASET;
        const exportExcelPayload = {
            schema:this.schemaName,
            table:this.data.DatasetName,
            dataSetId: this.dataSetId,
        };

        this.sidebarActions = {
            sideBarOpenStatus: true,
            dataSetId: this.dataSetId,
            payload: exportExcelPayload,
        };
        this.sidebarActionsService.setsidebarActions(this.sidebarActions);
    }
}
