import { ColabLoroDoc, SheetLoroDoc, StmtLoroDoc } from './ColabDoc';
import ColabDocController from '../controllers/ColabDocController';
import ColabEphemeralStoreManager from '../components/ColabDocEditor/EphemeralStoreManager';
import StatementDocController from '../controllers/StatementDocController';
import {
  SheetDocument,
  StatementDocument,
  DocumentType,
} from '../../api/ColabriAPI';
import SheetDocController from '../controllers/SheetDocController';
import { DocContainer } from './DocContainer';

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

  public getDocId(): string {
    throw new Error('Method not implemented.');
  }

  public getDocName(): string {
    throw new Error('Method not implemented.');
  }

  public getDocType(): DocumentType {
    throw new Error('Method not implemented.');
  }

  public getDocContainer(): DocContainer | undefined {
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
 * A connected sheet document
 */
export class ConnectedSheetDoc extends ConnectedColabDoc<SheetLoroDoc> {
  private sheetDoc: SheetDocument;

  constructor(
    loroDoc: SheetLoroDoc,
    loroDocController: SheetDocController,
    ephStoreMgr: ColabEphemeralStoreManager,
    sheetDoc: SheetDocument,
  ) {
    super(loroDoc, loroDocController, ephStoreMgr);
    this.sheetDoc = sheetDoc;
  }

  public getDocController(): SheetDocController {
    return this.loroDocController as SheetDocController;
  }

  public getLoroDoc(): SheetLoroDoc {
    return this.loroDoc;
  }

  public getSheetDoc(): SheetDocument {
    return this.sheetDoc;
  }

  public getDocId(): string {
    return this.sheetDoc.id;
  }

  public getDocName(): string {
    return this.sheetDoc.name;
  }

  public getDocContainer(): DocContainer | undefined {
    if (this.sheetDoc.container) {
      return {
        type: this.sheetDoc.containerType as 'library' | undefined,
        id: this.sheetDoc.container,
      };
    }
    return undefined;
  }

  public getDocType(): DocumentType {
    return DocumentType.DocumentTypeColabSheet;
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

  public getDocId(): string {
    return this.statementDoc.id;
  }

  public getDocName(): string {
    return this.statementDoc.name;
  }

  public getDocContainer(): DocContainer | undefined {
    if (this.statementDoc.container) {
      return {
        type: this.statementDoc.containerType as 'library' | undefined,
        id: this.statementDoc.container,
      };
    }
    return undefined;
  }

  public getDocType(): DocumentType {
    return DocumentType.DocumentTypeColabStatement;
  }
}
