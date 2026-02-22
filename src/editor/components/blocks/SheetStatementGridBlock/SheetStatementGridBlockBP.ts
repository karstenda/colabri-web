import { ContainerID } from 'loro-crdt';
import { SheetTrackBlockBP } from '../SheetTrack/SheetTrackBlockBP';

export type SheetStatementGridBlockBP = SheetTrackBlockBP & {
  containerId: ContainerID;
  readOnly?: boolean;
};
