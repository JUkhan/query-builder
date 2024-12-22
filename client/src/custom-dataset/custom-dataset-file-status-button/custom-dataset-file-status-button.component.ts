import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomDatasetService } from '../services/custom-dataset.service';
import { SidebarActionsService } from '../services/sidebar-actions.service';
import { ISidebarAction } from '../interfaces/SidebarAction';

@Component({
    standalone:false,
    selector: 'app-custom-dataset-file-status-button',
    templateUrl: './custom-dataset-file-status-button.component.html',
    styleUrls: ['./custom-dataset-file-status-button.component.scss'],
})
export class CustomDatasetFileStatusButtonComponent implements OnInit {
    constructor(
        private customDatasetService: CustomDatasetService,
        private sidebarActionsService: SidebarActionsService
    ) {}

    dataSetId!: string;
    @Input() data: any;
    sidebarActions!: ISidebarAction;

    ngOnInit(): void {}

    onClick() {
        this.dataSetId = this.data.Id;
        this.sidebarActions = {
            sideBarOpenStatus: true,
            dataSetId: this.dataSetId,
            payload: {},
        };
        this.sidebarActionsService.setsidebarActions(this.sidebarActions);
    }
}
