import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { SidebarService } from '@streamstech/ui-sdk/services';
import { Message } from 'app/config/constants';
import { ToolbarButton } from 'app/shared/components/core-components/table-components/interfaces/toolbar-action';
import { AlertMessageService } from 'app/shared/services/alert-message.service';
import { ReloadTableDataService } from 'app/shared/services/reload-table-data.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { CustomDatasetService } from '../services/custom-dataset.service';

@Component({
    selector: 'app-json-upload-button',
    templateUrl: './json-upload-button.component.html',
    styleUrls: ['./json-upload-button.component.scss'],
})
export class JsonUploadButtonComponent
    implements OnInit, ToolbarButton, OnDestroy
{
    private destroy$ = new Subject<void>();
    @ViewChild('jsonUploaderForm', { read: TemplateRef<any> })
    stlFormContainer: TemplateRef<any>;

    @Input() data: any;
    selectedFile: any = null;
    dataUploadErrors$ = new BehaviorSubject<string[]>(null);

    constructor(
        private messageService: AlertMessageService,
        private sidebarService: SidebarService,
        private customDatasetService: CustomDatasetService,
        private reloadDataService: ReloadTableDataService
    ) {}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit(): void {}

    openUploadDataSidebar() {
        this.sidebarService.sidebarContainerRef.clear();
        this.sidebarService.sidebarContainerRef.createEmbeddedView(
            this.stlFormContainer
        );
        this.sidebarService.open();
    }

    uploadJson(inputFile) {
        let formData = new FormData();

        if (this.selectedFile === null) {
            this.messageService.showErrorMessage(Message.SELECT_A_FILE);
            return;
        }

        // formData.append('surveyFormId', this.formId);
        formData.append('file', this.selectedFile);

        this.customDatasetService
            .UploadJsonData(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: { isSuccess; message }) => {
                    if (res.isSuccess) {
                        this.messageService.showGivenSuccessMessage(
                            Message.CUSTOM_DATASET_DATA_UPLOAD_JSON
                        );
                        this.sidebarService.close();
                        this.selectedFile = null;
                        inputFile.value = '';
                        this.dataUploadErrors$.next(null);
                        this.reloadDataService.reloadTableData();
                    } else {
                        this.messageService.showErrorMessage(
                            Message.DATA_UPLOAD_FAILED
                        );
                        this.dataUploadErrors$.next(res.message);
                    }
                },
            });
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    closeMatDrawer() {
        this.sidebarService.close();
        this.dataUploadErrors$.next(null);
    }
}
