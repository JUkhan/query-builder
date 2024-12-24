import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
//import { SharedModule } from 'app/shared/shared.module';
//import { environment } from 'environments/environment';
//import { CanDeactivateGuard } from 'app/core/can-deactivate.guard';
import { CustomDatasetFormComponent } from './custom-dataset-form/custom-dataset-form.component';
import { CustomDatasetViewButtonComponent } from './custom-dataset-view-button/custom-dataset-view-button.component';
import { CustomDatasetViewTableComponent } from './custom-dataset-view-table/custom-dataset-view-table.component';
import { CustomDatasetFileStatusButtonComponent } from './custom-dataset-file-status-button/custom-dataset-file-status-button.component';
import { CustomDatasetDownloadButtonComponent } from './custom-dataset-download-button/custom-dataset-download-button.component';
import { CustomDatasetSidebarComponent } from './custom-dataset-sidebar/custom-dataset-sidebar.component';
//import { CustomDatasetComponent } from './custom-dataset/custom-dataset.component';
import { CustomDatasetDownloadedFileDetailsPreviewComponent } from './custom-dataset-downloaded-file-details-preview/custom-dataset-downloaded-file-details-preview.component';
//import { FilterStore } from 'app/shared/components/core-components/table-components/filter/filter.store';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { JoinConditionComponent } from './query-builder/join-condition/join-condition.component';
import { MatIconModule } from '@angular/material/icon';
import { CustomDatasetJsonDownloadComponent } from './custom-dataset-json-download/custom-dataset-json-download.component';
//import { JsonUploadButtonComponent } from './json-upload-button/json-upload-button.component';
import { WhereConditionComponent } from './query-builder/where-condition/where-condition.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ConditionComponent } from './query-builder/where-condition/condition/condition.component';
import { GroupComponent } from './query-builder/where-condition/group/group.component';
import { MatStepperModule } from '@angular/material/stepper';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { SelectCaseComponent } from './query-builder/select-case/select-case.component';
import { ResultComponent } from './query-builder/select-case/result/result.component';
import { SelectColumnsComponent } from './query-builder/select-columns/select-columns.component';
import { CalculatedColumnsComponent } from './query-builder/calculated-columns/calculated-columns.component';
import { OrderByComponent } from './query-builder/order-by/order-by.component';
import { AllQueriesComponent } from './all-queries/all-queries.component';
import { ColumnOrderingComponent } from './query-builder/column-ordering/column-ordering.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StlGridModule } from "../grid/grid.module";
import {HomeComponent} from './home/home.component'
import { MatCheckboxModule } from '@angular/material/checkbox';
import {SingleSelectDropdownComponent} from './single-select-dropdown/single-select-dropdown.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {StlTextareaComponent} from './stl-textarea/stl-textarea.component'
import {MatPaginatorModule} from '@angular/material/paginator'
import {MatTableModule} from '@angular/material/table'
import {MatSidenavModule} from '@angular/material/sidenav'
import {MatSelectModule} from '@angular/material/select'
import {MatRadioModule} from '@angular/material/radio';
import {MatMenuModule} from '@angular/material/menu'
import {MatTooltipModule} from '@angular/material/tooltip'
import {FormsModule} from '@angular/forms'
import {DropdownSearchInputFocusDirective} from './directives/dropdown-search-input.directive'
import {DynamicComponentLoaderDirective} from './directives/dynamic-component-loader.directive'
import {CloseMatInputOnOutsideClickDirective} from './directives/edit-component-loader'
import { SelectContainerComponent } from './query-builder/select-container/select-container.component';

const userRoutes: Route[] = [
    {
        path: '',
        component: HomeComponent,
        //canDeactivate: [CanDeactivateGuard],
    },
    {
        path: 'new',
        component: CustomDatasetFormComponent,
    },
    {
        path: 'edit/:Id',
        component: CustomDatasetFormComponent,
    },
    {
        path: 'tableView/:dataSetId',
        component: CustomDatasetViewTableComponent,
    },
];

@NgModule({
    declarations: [
        CustomDatasetFormComponent,
        CustomDatasetViewButtonComponent,
        CustomDatasetViewTableComponent,
        CustomDatasetFileStatusButtonComponent,
        CustomDatasetDownloadButtonComponent,
        CustomDatasetSidebarComponent,
        //CustomDatasetComponent,
        CustomDatasetDownloadedFileDetailsPreviewComponent,
        QueryBuilderComponent,
        JoinConditionComponent,
        CustomDatasetJsonDownloadComponent,
        //JsonUploadButtonComponent,
        WhereConditionComponent,
        ConditionComponent,
        GroupComponent,
        SelectCaseComponent,
        ResultComponent,
        SelectColumnsComponent,
        CalculatedColumnsComponent,
        OrderByComponent,
        AllQueriesComponent,
        ColumnOrderingComponent,
        HomeComponent,
        SingleSelectDropdownComponent,
        StlTextareaComponent,
        CloseMatInputOnOutsideClickDirective,
        DynamicComponentLoaderDirective,
        DropdownSearchInputFocusDirective,
        SelectContainerComponent
    ],
    imports: [
    CommonModule,
    //SharedModule.forRoot(environment),
    RouterModule.forChild(userRoutes),
    MatIconModule,
    MatButtonToggleModule,
    MatStepperModule,
    CdkStepperModule,
    DragDropModule,
    StlGridModule,
    MatCheckboxModule,
    MatExpansionModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    MatSidenavModule,
    MatSelectModule,
    MatRadioModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule
],
    //providers: [FilterStore],
})
export class CustomDatasetModule {}
