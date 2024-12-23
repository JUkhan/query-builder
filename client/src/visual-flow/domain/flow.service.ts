import { Injectable } from "@angular/core";
import { FLOW_STORAGE, IFlowStorage } from "./flow.storage";
import { MapToNodeViewModelHandler } from "./node/map/map-to-node-view-model.handler";
import { MapToConnectionViewModelHandler } from "./connection/map/map-to-connection-view-model.handler";
import { IPoint } from "@foblex/2d";
import { MoveGroupHandler } from "./group/move-groups/move-group.handler";
import { MoveNodeHandler } from "./node/move-nodes/move-node.handler";
import { MoveGroupRequest } from "./group/move-groups/move-group.request";
import { MoveNodeRequest } from "./node/move-nodes/move-node.request";
import { AddNewNodeToFlowHandler } from "./node/add-new/add-new-node-to-flow.handler";
import { AddNewNodeToFlowRequest } from "./node/add-new/add-new-node-to-flow.request";
import { AddNewGroupToFlowHandler } from "./group/add-new/add-new-group-to-flow.handler";
import { AddNewGroupToFlowRequest } from "./group/add-new/add-new-group-to-flow.request";
import { ENodeType } from "./e-node-type";
import { IFlowViewModel } from "./i-flow-view-model";
import { ReassignConnectionHandler } from "./connection/reassign/reassign-connection.handler";
import { ReassignConnectionRequest } from "./connection/reassign/reassign-connection.request";
import { CreateConnectionRequest } from "./connection/add-new/create-connection.request";
import { CreateConnectionHandler } from "./connection/add-new/create-connection.handler";
import { EGroupType } from "./e-node-type";
import { MapToGroupViewModelHandler } from "./group/map/map-to-group-view-model.handler";
import { IFlowConnectionViewModel } from "../domain/connection/i-flow-connection-view-model";
import { IFlowGroupViewModel } from "./group/i-flow-group-view-model";
import { IFlowGroupStorageModel } from "./group/i-flow-group-storage-model";


@Injectable()
export class FlowService {
  public flow: IFlowStorage = {connections:[], groups:[], nodes:[]};
  public changeJoin(
    connection: IFlowConnectionViewModel,
    joinName: string
  ): void {
    const conn = this.flow.connections.find(
      (it) => it.from === connection.from && it.to === connection.to
    );
    if (conn) {
      conn.name = joinName;
    }
  }

  public changeOperator(
    connection: IFlowConnectionViewModel,
    operatorName: string
  ): void {
    const conn = this.flow.connections.find(
      (it) => it.from === connection.from && it.to === connection.to
    );
    if (conn) {
      conn.operator = operatorName;
    }
  }

  public removeConnection(connection: IFlowConnectionViewModel): void {
    this.flow.connections = this.flow.connections.filter(
      (it) => !(it.from === connection.from && it.to === connection.to)
    );
  }

  public typeChange(group: IFlowGroupViewModel, newType: string): void{
    const temp = this.flow.groups.find(it=>it.id===group.id)
    if(temp){
      this.flow.connections = this.flow.connections.filter(
        (it) => !(it.from.startsWith(temp.id) || it.to.startsWith(temp.id))
      );
      temp.properties['type']=newType;
    }
  }

  public removeGroup(group: IFlowGroupViewModel):void{
    this.flow.groups = this.flow.groups.filter(it=>it.id!==group.id)
      this.flow.connections = this.flow.connections.filter(
        (it) => !(it.from.startsWith(group.id) || it.to.startsWith(group.id))
      );
  }

  public getViewModel(): IFlowViewModel {
    return {
      groups: new MapToGroupViewModelHandler(this.flow).handle(),
      nodes: new MapToNodeViewModelHandler(this.flow).handle(),
      connections: new MapToConnectionViewModelHandler(this.flow).handle(),
    };
  }

  public addGroup(name: string, position: IPoint, type: EGroupType): IFlowGroupStorageModel {
    return new AddNewGroupToFlowHandler(this.flow).handle(
      new AddNewGroupToFlowRequest(
        name,
        position,
        type,
        { width: 171, height: 232 },
        []
      )
    );
    
  }

  /*public addNode(name: string, position: IPoint): void {
    console.log('add node', name, position)
    new AddNewNodeToFlowHandler(this.flow).handle(
      new AddNewNodeToFlowRequest(type, position)
    );
  }*/

  public moveGroup(id: string, position: IPoint): void {
    new MoveGroupHandler(this.flow).handle(new MoveGroupRequest(id, position));
  }

  public moveNode(id: string, position: IPoint): void {
    new MoveNodeHandler(this.flow).handle(new MoveNodeRequest(id, position));
  }

  public addConnection(outputId: string, inputId: string): void {
    new CreateConnectionHandler(this.flow).handle(
      new CreateConnectionRequest(outputId, inputId)
    );
  }

  public reassignConnection(
    outputId: string,
    oldInputId: string,
    newInputId: string
  ): void {
    new ReassignConnectionHandler(this.flow).handle(
      new ReassignConnectionRequest(outputId, oldInputId, newInputId)
    );
  }

  public onGroupSizeChanged(rect: any, group:IFlowGroupViewModel): void {
    const temp = this.flow.groups.find(it=>it.id===group.id)
    if(temp){
      temp.size={width:rect.width, height:rect.height};
      temp.position={x:rect.x, y:rect.y};
    }
  }
}
