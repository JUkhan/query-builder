import { IPoint } from '@foblex/2d';
import { ENodeType } from '../../e-node-type';

export class AddNewNodeToFlowRequest {

  constructor(
    public readonly groupId: string,
    public readonly name: string,
    public readonly position: IPoint,
    public readonly input?:any,
    public readonly output?:any
  ) {
  }
}
