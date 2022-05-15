import { ObjectId } from 'mongoose';
import { IRun } from './run';
export interface ITableauItem {
  autoTestId: ObjectId;
  runs: IRun[]
}

export interface ITableau {
  tableauItems: ITableauItem[]
}
