import { LoroEventBatch, LoroList, LoroMap } from 'loro-crdt';
import {
  AclLoroMap,
  SheetLoroDoc,
  StmtLoroDoc,
  UserApprovalLoro,
} from '../data/ColabDoc';
import { Permission } from '../../ui/data/Permission';
import ColabDocController from './ColabDocController';
import { pathStartsWith } from '../util/LoroPathUtil';
import { ColabApprovalState, ColabApprovalType } from '../../api/ColabriAPI';

class SheetDocController extends ColabDocController<SheetLoroDoc> {
  // Constructor
  // Loro document, set of authorized principals of the current user
  constructor(
    loroDoc: SheetLoroDoc,
    orgId: string,
    owner: string,
    userId: string,
    authPrpls?: Set<string>,
  ) {
    super(loroDoc, orgId, owner, userId, authPrpls);
  }
}

export default SheetDocController;
