import { IPoint, ISize } from '@foblex/2d';
import { EGroupType } from '../../e-node-type';
import { IFlowNodeStorageModel } from '../../node/i-flow-node-storage-model';

export class AddNewGroupToFlowRequest {

  constructor(
    public readonly name: string,
    public readonly position: IPoint,
    public readonly type:EGroupType,
    public readonly size:ISize,
    public readonly columnNames:string[]
  ) {
  }
}
