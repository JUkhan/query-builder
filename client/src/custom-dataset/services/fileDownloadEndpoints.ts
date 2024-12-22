import {Injectable} from '@angular/core'
import {environment} from '../../environment'

@Injectable({
    providedIn: 'root',
})
export class FileDownloadEndpoints {
    public readonly getFileListUrl = environment.coreApiUrl + 'GetFileList';
    public readonly updateDownloadFileNameUrl =
        environment.coreApiUrl + 'UpdateDownloadFileName';
    public readonly deleteFileUrl = environment.coreApiUrl + 'DeleteFile';
    public readonly imageLocationUrl = 'Upload/Media/';
    public readonly getCustomDatasetUrl =
        environment.coreApiUrl + 'crud/CustomDataset/getall';
    public readonly exportExcelDataUrl =
        environment.coreApiUrl + 'ExcelDataExport/ExportData';
}
