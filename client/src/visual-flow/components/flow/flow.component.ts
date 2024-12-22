import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FCreateNodeEvent, EFMarkerType,
  FCanvasComponent, FFlowModule, FZoomDirective,
  FReassignConnectionEvent, FCreateConnectionEvent,EFResizeHandleType
} from '@foblex/flow';
import { IPoint, Point } from '@foblex/2d';
import { EGroupType, ENodeType } from '../../domain/e-node-type';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { PaletteComponent } from '../palette/palette.component';
import { NodeComponent } from '../node/node.component';
import { FlowService } from '../../domain/flow.service';
import { IFlowViewModel } from '../../domain/i-flow-view-model';
import { GroupComponent } from '../group/group.component';
import { IFlowGroupStorageModel } from '../../domain/group/i-flow-group-storage-model';
import { IFlowNodeStorageModel } from '../../domain/node/i-flow-node-storage-model';
import {IFlowConnectionViewModel} from '../../domain/connection/i-flow-connection-view-model'
import {PropertyComponent} from '../property/property.component'
import { IFlowGroupViewModel } from '../../domain/group/i-flow-group-view-model';
import { CustomDatasetService } from '../../../custom-dataset/services/custom-dataset.service';


@Component({
  selector: 'visual-flow',
  templateUrl: './flow.component.html',
  styleUrls: [ './flow.component.scss' ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    FlowService
  ],
  imports: [
    FFlowModule,
    PropertyComponent,
    ToolbarComponent,
    PaletteComponent,
    NodeComponent,
    GroupComponent,
  ]
})
export class FlowComponent implements OnInit, AfterViewInit {
  
  getColumns=output<any>()
  tableNames=signal(['Kool']);

  protected readonly eResizeHandleType = EFResizeHandleType;
  public selectedGroup?:IFlowGroupViewModel
  public selectedConnection?:IFlowConnectionViewModel


  protected viewModel: IFlowViewModel = {
    nodes: [],
    groups:[],
    connections: []
  };

  @ViewChild(FCanvasComponent, { static: true })
  public fCanvasComponent!: FCanvasComponent;

  @ViewChild(FZoomDirective, { static: true })
  public fZoomDirective!: FZoomDirective;

  protected readonly eMarkerType = EFMarkerType;

  constructor(
    private apiService: FlowService,
    private changeDetectorRef: ChangeDetectorRef,
    private customDataservice: CustomDatasetService,
  ) {

  }
  ngAfterViewInit(): void {
   setTimeout(() => {
    //this.apiService.refreshData();
    this.getData();
   }, 500);
  }

  public ngOnInit(): void {
    this.getData();
    this.customDataservice.getTableList().subscribe((res)=>{
      this.tableNames.set(res.filter(it=>it.value!=='__EFMigrationsHistory').map(it=>it.value));
    })
  }

  public onCanvasClick(ev:any): void{
    if(ev.target.id==='f-flow-0'){
      this.selectedGroup=undefined;
      this.selectedConnection=undefined;
    }
  }
  public onGroupClick(group:IFlowGroupViewModel): void{
    this.selectedGroup=group;
    this.selectedConnection=undefined;
  }
  public typeChange(newType: string): void{
    if(this.selectedGroup){
      this.apiService.typeChange(this.selectedGroup, newType)
      this.getData();
    }
  }
  public removeGroup(): void{
    if(this.selectedGroup){
      this.apiService.removeGroup(this.selectedGroup)
      this.getData();
      this.selectedGroup=undefined;
    }
  }
  public changeJoin(joinName: string):void{
    if(this.selectedConnection){
    this.apiService.changeJoin(this.selectedConnection, joinName)
    this.getData();
    }
  }

  public changeOperator(oprator: string):void{
    if(this.selectedConnection){
    this.apiService.changeOperator(this.selectedConnection, oprator)
    this.getData();
    }
  }
  public removeConnection(): void {
    if(this.selectedConnection){
    this.apiService.removeConnection(this.selectedConnection)
    this.getData();
    this.selectedConnection=undefined;
    }
  }
  public onConnectionClick(conn:IFlowConnectionViewModel): void{
   this.selectedConnection=conn;
   this.selectedGroup=undefined;
  }
  public onGroupSizeChanged(rect: any, group:IFlowGroupViewModel): void {
    this.apiService.onGroupSizeChanged(rect, group)
  }

  public onInitialized(): void {
    //this.fCanvasComponent.fitToScreen(new Point(40, 40), false);
    //this.fCanvasComponent.resetScaleAndCenter()
  }

  public getData(): void {
    this.viewModel = this.apiService.getViewModel();
    this.changeDetectorRef.markForCheck();
  }

  public onNodeAdded(event: FCreateNodeEvent): void {
    const g=this.apiService.addGroup(event.data, event.rect, this.viewModel.groups.length===0?EGroupType.LeftTable:EGroupType.RightTable);
    this.customDataservice.getTableColumnList(event.data).subscribe(res=>{
      g.columnNames=res as any;
      this.getData();
    });
  }

  public onReassignConnection(event: FReassignConnectionEvent): void {
    console.log('reassign connection', event)
  }

  public onConnectionAdded(event: FCreateConnectionEvent): void {
    if (!event.fInputId) {
      return;
    }
    this.apiService.addConnection(event.fOutputId, event.fInputId);
    this.getData();
  }

  public onNodePositionChanged(point: IPoint, node: IFlowGroupStorageModel): void {
    this.apiService.moveGroup(node.id, point);
  }
}
