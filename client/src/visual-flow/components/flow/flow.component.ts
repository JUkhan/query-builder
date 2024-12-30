import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FCreateNodeEvent,
  EFMarkerType,
  FCanvasComponent,
  FFlowModule,
  FZoomDirective,
  FReassignConnectionEvent,
  FCreateConnectionEvent,
  EFResizeHandleType,
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
import { IFlowConnectionViewModel } from '../../domain/connection/i-flow-connection-view-model';
import { PropertyComponent } from '../property/property.component';
import { IFlowGroupViewModel } from '../../domain/group/i-flow-group-view-model';
import { CustomDatasetService } from '../../../custom-dataset/services/custom-dataset.service';
import { NavComponent } from '../nav/nav.component';
import { DotEnum } from '../../../custom-dataset/query-builder/utils/enums';
import { QueryBuilderService } from '../../../custom-dataset/query-builder/utils/services/query-builder.service';
import {
  QueryBuilderState,
  QueryBuilderStore,
} from '../../../custom-dataset/query-builder/utils/query-builder.store';
import { IDropdownData } from '../../../custom-dataset/custom-dataset.constants';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { JoinConfig } from '../../../custom-dataset/query-builder/utils/interfaces';

@Component({
  selector: 'visual-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FlowService],
  imports: [
    FFlowModule,
    PropertyComponent,
    ToolbarComponent,
    PaletteComponent,
    NodeComponent,
    GroupComponent,
    NavComponent,
  ],
})
export class FlowComponent implements OnInit {
  getColumns = output<any>();
  tableNames = signal(['Kool']);
  destroy$ = new Subject<void>();

  protected readonly eResizeHandleType = EFResizeHandleType;
  public selectedGroup?: IFlowGroupViewModel;
  public selectedConnection?: IFlowConnectionViewModel;

  public viewModel = signal<IFlowViewModel>({
    nodes: [],
    groups: [],
    connections: [],
  });

  @ViewChild(FCanvasComponent, { static: true })
  public fCanvasComponent!: FCanvasComponent;

  @ViewChild(FZoomDirective, { static: true })
  public fZoomDirective!: FZoomDirective;

  protected readonly eMarkerType = EFMarkerType;

  constructor(
    private flowService: FlowService,
    private customDatasetService: CustomDatasetService,
    private queryBuilderStore: QueryBuilderStore
  ) {}
  
  public ngOnInit(): void {
    this.loadSavedData();
    this.getData();
    this.customDatasetService.getTableList().subscribe((res) => {
      this.tableNames.set(
        res
          .filter((it) => !(it.value == '__EFMigrationsHistory'||it.value.startsWith('customdataset.')))
          .map((it) => it.value)
      );
    });
  }
  protected loadSavedData(){
    const savedData=this.queryBuilderStore.getFullJsonData(this.queryBuilderStore.getCurrentQueryIndex());
    
    if(savedData && savedData.flowConnections){
      const groups=JSON.parse(savedData.flowTables) as IFlowGroupStorageModel[];
      this.flowService.flow={connections:JSON.parse(savedData.flowConnections), groups, nodes:[]}
      const tableToColumnDataTypeMap=this.queryBuilderStore.getTableToColumnDataTypeMap();
      let fetchedTableColumnDropdownOptions = this.queryBuilderStore.getFetchedTableColumnDropdownOptions();
      for(const g of groups){
        if(!tableToColumnDataTypeMap.has(g.name)){
          this.setSelectedTableMap({label:g.name, value:g.name});
          this.customDatasetService
          .getTableColumnListWithType(g.name)
          .subscribe((res:any)=>{
            tableToColumnDataTypeMap.set(g.name, res);
            const mdata=res.map((column: any) => {
              return {
                label: column.ColumnName,
                value: column.ColumnName,
              };
            });
            fetchedTableColumnDropdownOptions.set(g.name, mdata);
          })
        }
      }
      this.queryBuilderStore.patchState({tableToColumnDataTypeMap: tableToColumnDataTypeMap});
      this.queryBuilderStore.patchState({fetchedTableColumnDropdownOptions: fetchedTableColumnDropdownOptions});
      //console.log(this.queryBuilderStore.getST)
    }
  }
  public onCanvasClick(ev: any): void {
    if (ev.target.id === 'f-flow-0') {
      this.selectedGroup = undefined;
      this.selectedConnection = undefined;
    }
  }
  public onGroupClick(group: IFlowGroupViewModel): void {
    this.selectedGroup = group;
    this.selectedConnection = undefined;
  }
  public typeChange(newType: string): void {
    if (this.selectedGroup) {
      this.flowService.typeChange(this.selectedGroup, newType);
      this.getData();
    }
  }
  public removeGroup(): void {
    if (this.selectedGroup) {
      this.flowService.removeGroup(this.selectedGroup);
      this.getData();
      let selectedTablesMapList =
        this.queryBuilderStore.getSelectedTablesMapList();
      let selectedTablesMap =
        selectedTablesMapList[this.queryBuilderStore.getCurrentQueryIndex()];
      selectedTablesMap.delete(this.selectedGroup.name);
      this.selectedGroup = undefined;
    }
  }
  public changeJoin(joinName: string): void {
    if (this.selectedConnection) {
      this.flowService.changeJoin(this.selectedConnection, joinName);
      this.getData();
    }
  }

  public changeOperator(oprator: string): void {
    if (this.selectedConnection) {
      this.flowService.changeOperator(this.selectedConnection, oprator);
      this.getData();
    }
  }
  public removeConnection(): void {
    if (this.selectedConnection) {
      this.flowService.removeConnection(this.selectedConnection);
      this.getData();
      this.selectedConnection = undefined;
    }
  }
  public onConnectionClick(conn: IFlowConnectionViewModel): void {
    this.selectedConnection = conn;
    this.selectedGroup = undefined;
  }
  public onGroupSizeChanged(rect: any, group: IFlowGroupViewModel): void {
    this.flowService.onGroupSizeChanged(rect, group);
  }

  public onInitialized(): void {
    //this.fCanvasComponent.fitToScreen(new Point(40, 40), false);
    this.fCanvasComponent.resetScaleAndCenter();
  }

  public getData(): void {
    this.viewModel.set(this.flowService.getViewModel());
  }
  private currentGroup!: IFlowGroupStorageModel;
  public onNodeAdded(event: FCreateNodeEvent): void {
    this.currentGroup = this.flowService.addGroup(
      event.data,
      event.rect,
      this.flowService.flow.groups.length==0?EGroupType.LeftTable: EGroupType.RightTable
    );

    this.onDropTable({ label: event.data, value: event.data });
  }

  public onReassignConnection(event: FReassignConnectionEvent): void {
    console.log('reassign connection', event);
  }

  public onConnectionAdded(event: FCreateConnectionEvent): void {
    if (!event.fInputId) {
      return;
    }
    this.flowService.addConnection(event.fOutputId, event.fInputId);
    this.getData();
  }

  public onNodePositionChanged(
    point: IPoint,
    node: IFlowGroupStorageModel
  ): void {
    this.flowService.moveGroup(node.id, point);
  }

  // table columns logic
  protected setSelectedTableMap(table: IDropdownData){
    let selectedTablesMapList = this.queryBuilderStore.getSelectedTablesMapList();
    let selectedTablesMap = selectedTablesMapList[this.queryBuilderStore.getCurrentQueryIndex()];
    if (!selectedTablesMap) selectedTablesMap = new Map<string, IDropdownData>();
    selectedTablesMap.set(table.value, table);
    selectedTablesMapList[this.queryBuilderStore.getCurrentQueryIndex()] = selectedTablesMap;
    this.queryBuilderStore.patchState({selectedTablesMapList: selectedTablesMapList});
  }
  protected onDropTable(table: IDropdownData) {
    this.setSelectedTableMap(table);
    if (table.value) {
      this.fetchTableColumns(
        table.value,
        table.value.replace(DotEnum.REPLACED_VALUE_OF_DOT, DotEnum.DOT)
      );
    }
  }

  private fetchTableColumns(tableName: string, tableNameForApiCall: string) {
    this.customDatasetService
      .getTableColumnListWithType(tableNameForApiCall)
      .pipe(
        map((res: any) => {
          let tableToColumnDataTypeMap = this.queryBuilderStore.getTableToColumnDataTypeMap();
          tableToColumnDataTypeMap.set(tableName, res);
          this.queryBuilderStore.patchState({tableToColumnDataTypeMap: tableToColumnDataTypeMap,});
          return res.map((column: any) => {
            return {
              label: column.ColumnName,
              value: column.ColumnName,
            };
          });
        })
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: IDropdownData[]) => {
        this.setFetchedTableColumnDropdownOptions(data);
      });
  }

  private setFetchedTableColumnDropdownOptions(data: IDropdownData[]) {
    let fetchedTableColumnDropdownOptions = this.queryBuilderStore.getFetchedTableColumnDropdownOptions();
    fetchedTableColumnDropdownOptions.set(this.currentGroup.name, data);
    this.queryBuilderStore.patchState({fetchedTableColumnDropdownOptions: fetchedTableColumnDropdownOptions});
    this.currentGroup.columnNames = data.map((it) => it.value).sort();
    this.getData();
  }
  // table columns logic end
  private saveFlowData(){
    this.queryBuilderStore.patchStateAllQueries('flowConnections', JSON.stringify(this.flowService.flow.connections));
    this.queryBuilderStore.patchStateAllQueries('flowTables', JSON.stringify(this.flowService.flow.groups))
  }
  public getJoinConditions(): JoinConfig[] {
    this.saveFlowData();
    const joinConditions: JoinConfig[] = [];
    const map = new Map<string, Record<string, any>[]>();
    const group = this.flowService.flow.groups.find(it=>it.properties['type']==EGroupType.LeftTable);
    console.log(group)
    if(group){
      this.queryBuilderStore.patchState({sourceTable:group.name})
    }
    for (const conn of this.flowService.flow.connections) {
      const fromArr = conn.from.split('-');
      const toArr = conn.to.split('-');
      const key = `${fromArr[0]}${toArr[0]}`;
      const record = {
        from: fromArr,
        to: toArr,
        joinType: conn.name,
        operator: conn.operator,
      };
      if (map.has(key)) map.get(key)?.push(record);
      else map.set(key, [record]);
    }
    for (const records of map.values()){
        const joinRecord=records.find(it=>it['joinType'])
        const join:Partial<JoinConfig>={};
        if(joinRecord){
          join.joinType=joinRecord['joinType'];
          join.leftTableName=joinRecord['from'][0];
          join.rightTableName=joinRecord['to'][0]
        }
        join.joinConditionFormArray=[];
        for(const it of records){
          join.joinConditionFormArray.push({leftColumn:it['from'][2],operator:it['operator'], rightColumn:it['to'][2]})
        }
        joinConditions.push(join as any);
    }
    
    return joinConditions;
  }
}
