import { IHandler } from '@foblex/mediator';
import { MoveGroupRequest } from './move-group.request';
import { IFlowStorage } from '../../flow.storage';

export class MoveGroupHandler implements IHandler<MoveGroupRequest> {

  constructor(
    private flow: IFlowStorage
  ) {
  }

  public handle(request: MoveGroupRequest): void {
    const node = this.flow.groups.find((x) => x.id === request.id);
    if (!node) {
      throw new Error(`Node with id ${ request.id } not found`);
    }
    node.position = request.position;
  }
}
