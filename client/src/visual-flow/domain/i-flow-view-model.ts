import { IFlowConnectionViewModel } from './connection/i-flow-connection-view-model';
import { IFlowGroupViewModel } from './group/i-flow-group-view-model';
import { IFlowNodeViewModel } from './node/i-flow-node-view-model';

export interface IFlowViewModel {

  nodes: IFlowNodeViewModel[];

  groups:IFlowGroupViewModel[],

  connections: IFlowConnectionViewModel[];
}
