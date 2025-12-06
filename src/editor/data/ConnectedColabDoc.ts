import { ColabLoroDoc, StmtLoroDoc } from './ColabDoc';
import ColabDocController from '../controllers/ColabDocController';
import ColabEphemeralStoreManager from '../components/ColabDocEditor/EphemeralStoreManager';
import StatementDocController from '../controllers/StatementDocController';
import { StatementDocument } from '../../api/ColabriAPI';

/**
 * A connected Colab document
 */
export class ConnectedColabDoc<T extends ColabLoroDoc> {
  protected loroDoc: T;

  protected loroDocController: ColabDocController<T>;

  protected ephStoreMgr: ColabEphemeralStoreManager;

  constructor(
    loroDoc: T,
    loroDocController: ColabDocController<T>,
    ephStoreMgr: ColabEphemeralStoreManager,
  ) {
    this.loroDoc = loroDoc;
    this.loroDocController = loroDocController;
    this.ephStoreMgr = ephStoreMgr;
  }

  public getDocName(): string {
    throw new Error('Method not implemented.');
  }

  public getLoroDoc(): T {
    return this.loroDoc;
  }

  public getDocController(): ColabDocController<T> {
    return this.loroDocController;
  }

  public getEphStoreMgr(): ColabEphemeralStoreManager {
    return this.ephStoreMgr;
  }
}

/**
 * A connected statement document
 */
export class ConnectedStmtDoc extends ConnectedColabDoc<StmtLoroDoc> {
  private statementDoc: StatementDocument;

  constructor(
    loroDoc: StmtLoroDoc,
    loroDocController: StatementDocController,
    ephStoreMgr: ColabEphemeralStoreManager,
    statementDoc: StatementDocument,
  ) {
    super(loroDoc, loroDocController, ephStoreMgr);
    this.statementDoc = statementDoc;
  }

  public getDocController(): StatementDocController {
    return this.loroDocController as StatementDocController;
  }

  public getLoroDoc(): StmtLoroDoc {
    return this.loroDoc;
  }

  public getStatementDoc(): StatementDocument {
    return this.statementDoc;
  }

  public getDocName(): string {
    return this.statementDoc.name;
  }
}
