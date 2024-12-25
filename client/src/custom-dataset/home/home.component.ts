import { Component, OnInit, inject } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { of, map } from 'rxjs';
import { ActionComponent } from '../../grid/action.component';
import { Router } from '@angular/router';
import { CustomDatasetService } from '../services/custom-dataset.service';
import { ConstantService } from '../../services/constants.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  _snackBar=inject(MatSnackBar);
  constructor(
    private customDatasetService: CustomDatasetService,
    private router: Router
  ) {}

  getRowId(params:any){
    return params.data.Id;
  }
  rowData = of<any[]>([]);
  colDef!: ColDef[];
  ngOnInit() {
    this.rowData = this.customDatasetService.getAll(); 
    const router=this.router;
    const that=this;
    this.colDef=[
      { field: 'DatasetName', headerName: 'Dataset Name' },
      { field: 'WebQuery', headerName: 'Query' },
      { field: 'QueryType', headerName: 'Query Type' },
      {
        sortable: false,
        filter: false,
        resizable: false,
        flex: 1,
        field: 'Id',
        headerName: 'Actions',
        cellRenderer: ActionComponent,
        cellRendererParams: {
          hasEditPermission: true,
          hasDeletePermission: true,
          //customButtons:[{actionName:'doSmth', tooltip:'test', icon:'edit'}],
          crudEdit(record: any) {
            console.log(record);
            router.navigateByUrl(`/edit/${record.Id}`);
          },
          crudDelete(record: any) {
            console.log(record);
            that.customDatasetService.deleteCustomDataSet(record.Id).subscribe(res=>{
              that._snackBar.open(ConstantService.Message.DELETE_SUCCESSFUL,'',{duration:3000, verticalPosition:'top'})
              that.rowData=that.rowData.pipe(map(it=>it.filter(it=>it.Id!==record.Id)))
            })
          },
          doSmth(record: any) {
            console.log('doSmth', record);
            
          },
        },
      },
    ];
  }

  newDataSet() {
    this.router.navigateByUrl('/new');
  }
}
