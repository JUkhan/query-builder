import { ENodeType } from '../e-node-type';
import { IPoint } from '@foblex/2d';

export interface IFlowNodeStorageModel {

  id: string;

  input?: string;

  output?: string;

  name: string;

  position: IPoint;

  groupId: string;
}
