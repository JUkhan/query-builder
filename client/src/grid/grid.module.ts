import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip'
import { MatCheckboxModule} from '@angular/material/checkbox'
import {MatInputModule} from '@angular/material/input'
import {MatFormFieldModule} from '@angular/material/form-field'
import {MatGridListModule} from '@angular/material/grid-list'
import { MatDialogModule } from '@angular/material/dialog';

//import {SetFilterComponent} from './set-filter.component'
//import {CellRendererComponent} from './cell.renderer.component'
//import {ActionComponent} from './action.component'
import {AgGridModule} from 'ag-grid-angular'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StlGridComponent } from './stl-grid/stl-grid.component';
import {ColumnSelectorComponent} from './column-selector/column-selector.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
    declarations: [
        ColumnSelectorComponent,
        StlGridComponent,
    ],
    imports     : [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        AgGridModule,
        MatCheckboxModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatTooltipModule,
        FormsModule,
        ReactiveFormsModule,
        MatGridListModule,
        FontAwesomeModule
    ],
    exports     : [
        ColumnSelectorComponent,
        StlGridComponent
    ]
})
export class StlGridModule
{
}
