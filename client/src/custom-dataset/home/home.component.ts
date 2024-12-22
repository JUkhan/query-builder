import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ActionComponent } from '../../grid/action.component';
import { Router } from '@angular/router';
import { CustomDatasetService } from '../services/custom-dataset.service';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
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
