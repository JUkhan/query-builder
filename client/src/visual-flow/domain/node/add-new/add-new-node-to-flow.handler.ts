import { IHandler } from '@foblex/mediator';
import { AddNewNodeToFlowRequest } from './add-new-node-to-flow.request';
import { IFlowStorage } from '../../flow.storage';

export class AddNewNodeToFlowHandler implements IHandler<AddNewNodeToFlowRequest> {

  constructor(
    private flow: IFlowStorage
  ) {
  }

  public handle(request: AddNewNodeToFlowRequest): void {
    this.flow.nodes.push({
      id:`${request.groupId}-${request.name}`,
      input: request.input,
      output: request.output,
      name: request.name,
      position: request.position,
      groupId:'',
    });
  }
}
