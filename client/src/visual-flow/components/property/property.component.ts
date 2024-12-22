import {
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { FlowComponent } from '../flow/flow.component';
import { AsyncPipe } from '@angular/common';
import { IFlowGroupViewModel } from '../../domain/group/i-flow-group-view-model';
import {IFlowConnectionViewModel} from '../../domain/connection/i-flow-connection-view-model'
import { QueryBuilderConstants } from '../../../custom-dataset/query-builder/utils/query-builder.constants';

@Component({
  selector: 'visual-programming-property',
  templateUrl: './property.component.html',
  styleUrls: [ './property.component.scss' ],
  imports:[MatSelectModule, MatFormFieldModule, MatButtonModule],
  viewProviders:[AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyComponent {

  @Input()
  public selectedGroup?:IFlowGroupViewModel
  
  public selectedConnection= input<IFlowConnectionViewModel>()
  public operators=QueryBuilderConstants.RELATION_OPERATORS;
  public joinTypes=QueryBuilderConstants.JOIN_TYPES;
  
  constructor(
    public flowComponent: FlowComponent
  ) {
    
  }

  public changeJoin(ev:any): void{
    this.flowComponent.changeJoin(ev)
  }

  public changeOperator(ev:any): void{
    this.flowComponent.changeOperator(ev)
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
}
