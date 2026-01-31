import { ContainerID } from 'loro-crdt';
import { SheetContentBlockBP } from '../SheetBlock/SheetContentBlockBP';

export type SheetStatementGridBlockBP = SheetContentBlockBP & {
  containerId: ContainerID;
  readOnly?: boolean;
};
