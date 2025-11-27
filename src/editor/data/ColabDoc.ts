import { EphemeralStore, LoroDoc } from 'loro-crdt';
import { ColabModelType, StatementDocument } from '../../api/ColabriAPI';

export type ColabDocType =
  | ColabModelType.ColabModelStatementType
  | ColabModelType.ColabModelSheetType;

export type UnconnectedColabDoc = StatementDocument;

export type ConnectedColabDoc = Omit<UnconnectedColabDoc, 'statement'> & {
  loroDoc: LoroDoc;
  ephStore: EphemeralStore;
};
