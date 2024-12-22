import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomDatasetService } from '../services/custom-dataset.service';
import { SidebarActionsService } from '../services/sidebar-actions.service';
import { ISidebarAction } from '../interfaces/SidebarAction';

@Component({
    standalone:false,
    selector: 'app-custom-dataset-view-button',
    templateUrl: './custom-dataset-view-button.component.html',
    styleUrls: ['./custom-dataset-view-button.component.scss'],
})
export class CustomDatasetViewButtonComponent implements OnInit {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private customDatasetService: CustomDatasetService,
        private sidebarActionsService: SidebarActionsService
    ) {}
    tableTitle!: string;
    tableName!: string;
    dataSetId!: string;
    queryType!: string;
    webQuery!: string;
    sidebarActions!: ISidebarAction;
    @Input() data: any;

    ngOnInit(): void {}
    onClick() {
        this.dataSetId = this.data.Id;
        this.tableName = this.data.DatasetName;
        this.queryType = this.data.QueryType;
        this.webQuery = this.data.WebQuery;
        this.customDatasetService.setDataSetIdParams(this.dataSetId);
        this.customDatasetService.setDataSetName(this.tableName);
        this.customDatasetService.setQueryType(this.queryType);
        this.customDatasetService.setWebQuery(this.webQuery);

        this.sidebarActions = {
            sideBarOpenStatus: false,
            dataSetId: this.dataSetId,
            payload: {},
        };
        this.sidebarActionsService.setsidebarActions(this.sidebarActions);
        this.router.navigate([`tableView/${this.dataSetId}`], {
            relativeTo: this.activatedRoute,
        });
    }
}
