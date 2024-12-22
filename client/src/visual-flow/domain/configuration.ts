import { EGroupType, ENodeType } from './e-node-type';

export const NODE_CONFIGURATION = {
  [ ENodeType.Input ]: {
    color: '#8e5cd9',
    text: 'Input',
  },
  [ ENodeType.Assign ]: {
    color: '#8e5cd9',
    text: 'Assign',
  },
  [ ENodeType.Switch ]: {
    color: '#8e5cd9',
    text: 'Switch',
  },
  [ ENodeType.Cycle ]: {
    color: '#8e5cd9',
    text: 'Cycle',
  },
  [ ENodeType.Error ]: {
    color: '#8e5cd9',
    text: 'Error',
  },
  [ ENodeType.Database ]: {
    color: '#8e5cd9',
    text: 'Database',
  },
  [ ENodeType.Hash ]: {
    color: '#8e5cd9',
    text: 'Function',
  },
};

export const GROUP_CONFIGURATION ={
  [EGroupType.LeftTable]:{color:'#e0575b'},
  [EGroupType.RightTable]:{color:'#30a46c'}
}
