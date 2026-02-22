import { ContainerID } from 'loro-crdt';
import { SheetTrackBlockBP } from '../SheetTrack/SheetTrackBlockBP';

export type SheetAttributesBlockBP = SheetTrackBlockBP & {
  containerId: ContainerID;
  readOnly?: boolean;
};
