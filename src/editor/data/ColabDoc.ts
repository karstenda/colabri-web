import { LoroDoc } from 'loro-crdt';
import { ColabModelType, StatementDocument } from '../../api/ColabriAPI';
import ColabEphemeralStoreManager from '../components/ColabDocEditor/ColabEphemeralStoreManager';

export type ColabDocType =
  | ColabModelType.ColabModelStatementType
  | ColabModelType.ColabModelSheetType;

export type UnconnectedColabDoc = StatementDocument;

export type ConnectedColabDoc = Omit<UnconnectedColabDoc, 'statement'> & {
  loroDoc: LoroDoc;
  ephStoreMgr: ColabEphemeralStoreManager;
};
