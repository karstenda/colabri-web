import { ContainerID } from 'loro-crdt';
import { SheetTrackBlockBP } from '../SheetTrack/SheetTrackBlockBP';

export type SheetTextBlockBP = SheetTrackBlockBP & {
  containerId: ContainerID;
  langCode: string;
  readOnly?: boolean;
};
