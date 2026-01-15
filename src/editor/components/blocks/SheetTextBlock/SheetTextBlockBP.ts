import { ContainerID } from 'loro-crdt';
import { SheetContentBlockBP } from '../SheetBlock/SheetContentBlockBP';

export type SheetTextBlockBP = SheetContentBlockBP & {
  containerId: ContainerID;
  langCode: string;
};
