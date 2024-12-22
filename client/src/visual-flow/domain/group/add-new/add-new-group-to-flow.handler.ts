import { IHandler } from "@foblex/mediator";
import { AddNewGroupToFlowRequest } from "./add-new-group-to-flow.request";
import { IFlowStorage } from "../../flow.storage";
import { IFlowGroupStorageModel } from "../i-flow-group-storage-model";
import { IFlowNodeStorageModel } from "../../node/i-flow-node-storage-model";
import { EGroupType } from "../../e-node-type";

export class AddNewGroupToFlowHandler
  implements IHandler<AddNewGroupToFlowRequest>
{
  constructor(private flow: IFlowStorage) {}

  public handle(request: AddNewGroupToFlowRequest): IFlowGroupStorageModel {
    const group: IFlowGroupStorageModel = {
      id: request.name + Number(Date.now()),
      name: request.name,
      properties: { type: request.type },
      position: request.position,
      size: request.size,
      columnNames:request.columnNames ,
    };
    this.flow.groups.push(group);
    return group;
    
  }
}
