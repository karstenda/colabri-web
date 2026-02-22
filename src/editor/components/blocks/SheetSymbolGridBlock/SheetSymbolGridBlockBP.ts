import { ContainerID } from 'loro-crdt';
import { SheetTrackBlockBP } from '../SheetTrack/SheetTrackBlockBP';

export type SheetSymbolGridBlockBP = SheetTrackBlockBP & {
  containerId: ContainerID;
  readOnly?: boolean;
};
