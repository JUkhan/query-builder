import { ENodeType } from './e-node-type';
import { IFlowGroupStorageModel } from './group/i-flow-group-storage-model';
import { IFlowConnectionStorageModel } from './connection/i-flow-connection-storage-model';
import { IFlowNodeStorageModel } from './node/i-flow-node-storage-model';


export interface IFlowStorage {

  groups: IFlowGroupStorageModel[];
  nodes: IFlowNodeStorageModel[];

  connections: IFlowConnectionStorageModel[];
}

export const FLOW_STORAGE: IFlowStorage = {
  groups:[
    {id:'g1', name:'Table1', columnNames:['id','name','age','email','address1_amar_tumar_r_karo_noi'], position:{x:100, y:100}, properties:{type:'left-table'},size:{width:171, height:232}},
    {id:'g2', name:'Table2', columnNames:['id','name'], position:{x:500, y:100}, properties:{type:'right-table'},size:{width:171, height:232}},
  ],
  nodes:[],
  connections:[{from:'g1-id-0', to:'g2-id-0', name:'JOIN', operator:'='},{from:'g1-name-1', to:'g2-name-1', name:'', operator:'!='}]
}
const abc={

  nodes: [ {
    id: 'input1',
    output: 'input_output',
    type: ENodeType.Input,
    position: { x: 300, y: 100 }
  }, {
    id: 'assign',
    input: 'assign_input',
    output: 'assign_output',
    type: ENodeType.Assign,
    position: { x: 300, y: 180 }
  }, {
    id: 'cycle1',
    output: 'cycle1_output',
    input: 'cycle1_input',
    type: ENodeType.Cycle,
    position: { x: 300, y: 260 }
  }, {
    id: 'switch1',
    output: 'switch1_output',
    input: 'switch1_input',
    type: ENodeType.Switch,
    position: { x: 540, y: 260 }
  }, {
    id: 'db_connector1',
    output: 'db_connector1_output',
    input: 'db_connector1_input',
    type: ENodeType.Database,
    position: { x: 580, y: 520 }

  }, {
    id: 'db_connector2',
    output: 'db_connector2_output',
    input: 'db_connector2_input',
    type: ENodeType.Database,
    position: { x: 660, y: 520 }
  }, {
    id: 'db_connector3',
    output: 'db_connector3_output',
    input: 'db_connector3_input',
    type: ENodeType.Database,
    position: { x: 740, y: 520 }
  }, {
    id: 'function1',
    output: 'function1_output',
    input: 'function1_input',
    type: ENodeType.Hash,
    position: { x: 360, y: 400 }
  }, {
    id: 'function2',
    output: 'function2_output',
    input: 'function2_input',
    type: ENodeType.Hash,
    position: { x: 440, y: 400 }
  }, {
    id: 'function3',
    output: 'function3_output',
    input: 'function3_input',
    type: ENodeType.Hash,
    position: { x: 520, y: 400 }
  }, {
    id: 'exception1',
    output: 'exception1_output',
    input: 'exception1_input',
    type: ENodeType.Error,
    position: { x: 700, y: 260 }
  }, {
    id: 'cycle2',
    output: 'cycle2_output',
    input: 'cycle2_input',
    type: ENodeType.Cycle,
    position: { x: 300, y: 500 }
  }, {
    id: 'output',
    input: 'output_input',
    type: ENodeType.Hash,
    position: { x: 300, y: 580 }
  } ],
  connections: [
    { from: 'input_output', to: 'assign_input' },
    { from: 'assign_output', to: 'cycle1_input' },
    { from: 'cycle1_output', to: 'switch1_input' },
    { from: 'switch1_output', to: 'exception1_input' },
    { from: 'cycle1_output', to: 'cycle2_input' },
    { from: 'cycle2_output', to: 'output_input' },
    { from: 'switch1_output', to: 'db_connector1_input' },
    { from: 'switch1_output', to: 'db_connector2_input' },
    { from: 'switch1_output', to: 'db_connector3_input' },
    { from: 'db_connector1_output', to: 'function1_input' },
    { from: 'db_connector2_output', to: 'function2_input' },
    { from: 'db_connector3_output', to: 'function3_input' },
    { from: 'function1_output', to: 'cycle1_input' },
    { from: 'function2_output', to: 'cycle1_input' },
    { from: 'function3_output', to: 'cycle1_input' },
  ]
};
