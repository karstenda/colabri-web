import { ContainerID } from 'loro-crdt';
import { SheetContentBlockBP } from '../SheetBlock/SheetContentBlockBP';

export type SheetPropertiesBlockBP = SheetContentBlockBP & {
  containerId: ContainerID;
  readOnly?: boolean;
};
