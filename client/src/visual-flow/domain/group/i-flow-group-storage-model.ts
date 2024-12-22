//import { ENodeType } from '../e-node-type';
import { IPoint, ISize } from '@foblex/2d';
import { IFlowNodeStorageModel } from '../node/i-flow-node-storage-model';

export interface IFlowGroupStorageModel {
  id: string;
  name:string;
  properties:Record<string, any>
  columnNames:string[]
  position: IPoint;
  size: ISize
}
