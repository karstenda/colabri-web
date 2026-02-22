import { ContainerID } from 'loro-crdt';
import { SheetTrackBlockBP } from '../SheetTrack/SheetTrackBlockBP';

export type SheetBarcodeGridBlockBP = SheetTrackBlockBP & {
  containerId: ContainerID;
  readOnly?: boolean;
};
