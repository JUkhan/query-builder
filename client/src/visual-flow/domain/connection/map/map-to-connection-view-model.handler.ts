import { IFlowStorage } from '../../flow.storage';
import { IHandler } from '@foblex/mediator';
import { IFlowConnectionViewModel } from '../i-flow-connection-view-model';
import { IFlowConnectionStorageModel } from '../i-flow-connection-storage-model';
import { IFlowNodeStorageModel } from '../../node/i-flow-node-storage-model';
import { GROUP_CONFIGURATION } from '../../configuration';
import { EGroupType } from '../../e-node-type';
import {QueryBuilderConstants} from '../../../../custom-dataset/query-builder/utils/query-builder.constants'

export class MapToConnectionViewModelHandler implements IHandler<void, IFlowConnectionViewModel[]>{

  constructor(
    private flow: IFlowStorage
  ) {
  }

  public handle(): IFlowConnectionViewModel[] {
    return this.getConnections().map((x) => {
      return this.mapConnection(x, this.getFromNode(x), this.getToNode(x));
    });
  }

  private getConnections(): IFlowConnectionStorageModel[] {
    return this.flow.connections;
  }
  private operators=QueryBuilderConstants.RELATION_OPERATORS.reduce((acc, it)=>{
    acc[it.value]=it.label
    return acc;
  },{} as Record<string, string>)

  private mapConnection(
    connection: IFlowConnectionStorageModel, fromNode: IFlowNodeStorageModel, toNode: IFlowNodeStorageModel
  ): IFlowConnectionViewModel {
    
    return {
      ...connection,
      color1:GROUP_CONFIGURATION[EGroupType.LeftTable].color, 
      color2:GROUP_CONFIGURATION[EGroupType.RightTable].color,
      text: connection.name||this.operators[connection.operator],
    };
  }

  private getFromNode(connection: IFlowConnectionStorageModel): IFlowNodeStorageModel {
    
    const result = this.getNodes(connection.from).find((node) => node.output === connection.from);
    if (!result) {
      throw new Error('From node not found');
    }
    return result;
  }

  private getToNode(connection: IFlowConnectionStorageModel): IFlowNodeStorageModel {
    const result = this.getNodes(connection.to).find((node) => node.input === connection.to);
    if (!result) {
      throw new Error('To node not found');
    }
    return result;
  }

  private getNodes(fromToId: string): IFlowNodeStorageModel[] {
    const groupId=fromToId.split('-')[0]
    return this.flow.nodes.filter(n=>n.groupId===groupId);
  }
}
