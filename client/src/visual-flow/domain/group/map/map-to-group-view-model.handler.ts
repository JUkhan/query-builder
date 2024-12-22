import { IHandler } from '@foblex/mediator';
import { IFlowGroupViewModel } from '../i-flow-group-view-model';
import { IFlowStorage } from '../../flow.storage';
import { GROUP_CONFIGURATION } from '../../configuration';
import { EGroupType } from '../../e-node-type';

export class MapToGroupViewModelHandler implements IHandler<void, IFlowGroupViewModel[]> {

  constructor(
    private flow: IFlowStorage
  ) {
  }

  public handle(): IFlowGroupViewModel[] {
    return this.flow.groups.map((group) => {
      return {
        ...group,
        color: GROUP_CONFIGURATION[ group.properties['type'] as EGroupType ].color,
      };
    });
  }

}
