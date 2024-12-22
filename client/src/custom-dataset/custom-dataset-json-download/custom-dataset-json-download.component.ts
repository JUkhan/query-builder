import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { CustomDatasetService } from '../services/custom-dataset.service';
import { JSON_DOWNLOAD_ICON } from './json-icon';

@Component({
    standalone:false,
    selector: 'app-custom-dataset-json-download',
    templateUrl: './custom-dataset-json-download.component.html',
    styleUrls: ['./custom-dataset-json-download.component.scss'],
})
export class CustomDatasetJsonDownloadComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<void>();
    @Input() data: any;
    constructor(
        private customDatasetService: CustomDatasetService,
        iconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer
    ) {
        iconRegistry.addSvgIconLiteral('json-download', sanitizer.bypassSecurityTrustHtml(JSON_DOWNLOAD_ICON));
    }
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngOnInit(): void {}
    downloadJson() {
        this.customDatasetService
            .downloadJson(this.data.Id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    const jsonContent = JSON.stringify(res);
                    const blob = new Blob([jsonContent], {
                        type: 'application/json',
                    });
                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${this.data.DatasetName}.json`; // Set the filename here
                    document.body.appendChild(a);
                    a.click();

                    // Cleanup
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                },
            });
    }
}
