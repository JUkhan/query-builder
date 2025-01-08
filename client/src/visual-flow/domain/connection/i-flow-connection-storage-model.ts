import { JoinCondition } from "../../../custom-dataset/query-builder/utils/interfaces";

export interface IFlowConnectionStorageModel {
  id:number;

  from: string;

  to: string;
  
  name: string;

  operator:string;

  joinCondistins:JoinCondition[];
}
