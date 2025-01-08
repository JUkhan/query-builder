import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  inject,
  Input,
  model,
  signal,
} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon'
import { FlowComponent } from '../flow/flow.component';
import { AsyncPipe } from '@angular/common';
import { IFlowGroupViewModel } from '../../domain/group/i-flow-group-view-model';
import {IFlowConnectionViewModel} from '../../domain/connection/i-flow-connection-view-model'
import { QueryBuilderConstants } from '../../../custom-dataset/query-builder/utils/query-builder.constants';
import { JoinCondition } from '../../../custom-dataset/query-builder/utils/interfaces';
import { QueryBuilderStore } from '../../../custom-dataset/query-builder/utils/query-builder.store';
import { IDropdownData } from '../../../custom-dataset/custom-dataset.constants';
import { CustomDatasetModule } from '../../../custom-dataset/custom-dataset.module';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmacionComponent } from '../../../grid/confirm/confirm.component';
import { ConstantService } from '../../../services';
import { SingleSelectDropdownComponent } from '../../../custom-dataset/single-select-dropdown/single-select-dropdown.component';

@Component({
  selector: 'visual-programming-property',
  templateUrl: './property.component.html',
  styleUrls: [ './property.component.scss' ],
  imports:[MatSelectModule, MatFormFieldModule, MatButtonModule, MatIconModule,],
  viewProviders:[AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyComponent {

  @Input()
  public selectedGroup?:IFlowGroupViewModel
  
  public selectedConnection= model<IFlowConnectionViewModel>()
  public operators=QueryBuilderConstants.RELATION_OPERATORS;
  public joinTypes=QueryBuilderConstants.JOIN_TYPES;
  private queryBuilderStore = inject(QueryBuilderStore);
  constructor(
    public dialogo: MatDialog,
    public flowComponent: FlowComponent
  ) {
    
  }

  public changeJoin(ev:any): void{
    this.flowComponent.changeJoin(ev)
  }

  public changeOperator(item:JoinCondition, value:string): void{
   
    this.flowComponent.changeConnection(this.selectedConnection()?.joinCondistins!)
  }
  public changeLeft(item:JoinCondition, value:string): void{
    this.flowComponent.changeConnection(this.selectedConnection()?.joinCondistins!)
  }
  public changeRight(item:JoinCondition, value:string): void{
    this.flowComponent.changeConnection(this.selectedConnection()?.joinCondistins!)
  }

  public getTableColumns(name:string):IDropdownData[]{
    return this.queryBuilderStore. getFetchedTableColumnDropdownOptions().get(name)||[]
  }

  public removeConnection(): void{
    this.flowComponent.removeConnection()
  }

  public typeChange(ev: any): void{
    this.flowComponent.typeChange(ev)
  }

  public removeTable():void{
    this.flowComponent.removeGroup();
  }
  public deleteJoinCondition(join: JoinCondition){
    ConstantService
    this.dialogo.open(ConfirmacionComponent, { data:{
      title: ConstantService.Message.DELETE_SUCCESSFUL_TITLE,
      message: ConstantService.Message.DELETE_SUCCESSFUL_MESSAGE,
      }}).afterClosed()
      .subscribe((result: boolean) =>{
      if (result){
        this.selectedConnection.update(it => {
          if (!it) return it;
          return {
            ...it,
            joinCondistins: it.joinCondistins.filter(x=>x.id!==join.id)
          } 
        });
        this.flowComponent.changeConnection(this.selectedConnection()?.joinCondistins!)
      }
  });
    
  }
  public addJoinCondition(): void{
    this.selectedConnection.update(it => {
      if (!it) return it;
      return {
        ...it,
        joinCondistins: [...it.joinCondistins, {
          id: Number(new Date()),
          leftColumn: '',
          operator: '',
          rightColumn: ''
        }]
      } 
    });
    
  }
}
