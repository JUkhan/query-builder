import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileDownloadService } from '../services/file-download.service';
import { FormControl, Validators } from '@angular/forms';
//import { AlertMessageService } from 'app/shared/services/alert-message.service';

@Component({
    standalone:false,
    selector: 'app-custom-dataset-downloaded-file-details-preview',
    templateUrl:
        './custom-dataset-downloaded-file-details-preview.component.html',
    styleUrls: [
        './custom-dataset-downloaded-file-details-preview.component.scss',
    ],
})
export class CustomDatasetDownloadedFileDetailsPreviewComponent
    implements OnInit
{
    file: any;
    updatedFileName!: string;
    fileNameFormControl: FormControl;

    constructor(
        private dialogRef: MatDialogRef<CustomDatasetDownloadedFileDetailsPreviewComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: any,
        private fileDownloadService: FileDownloadService,
        //private messageService: AlertMessageService
    ) {
        this.fileNameFormControl = new FormControl('', [Validators.required]);
    }

    ngOnInit(): void {
        this.file = this.data;
        this.updatedFileName = this.file.fileName;
    }
    updateDisplayName() {
        this.file.fileName = this.updatedFileName;
        this.fileDownloadService
            .updateDownloadFileName(this.file)
            .subscribe((res: any) => {
                if (res.success) {
                    this.data.fileName = this.updatedFileName;
                    //this.messageService.showSuccessMessage();
                    alert('Success')
                    this.closeDialog();
                } else {
                    //this.messageService.showError();
                    alert('Error')
                }
            });
    }
    closeDialog() {
        this.dialogRef.close();
    }
}
