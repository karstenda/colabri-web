import { ContainerID } from 'loro-crdt';
import { SheetContentBlockBP } from '../SheetBlock/SheetContentBlockBP';

export type SheetAttributesBlockBP = SheetContentBlockBP & {
  containerId: ContainerID;
  readOnly?: boolean;
};
