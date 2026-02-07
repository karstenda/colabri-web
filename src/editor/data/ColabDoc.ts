import { ColabLoroDoc, SheetLoroDoc, StmtLoroDoc } from './ColabLoroDoc';
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
import { EphemeralStore, Value, VersionVector } from 'loro-crdt';
import EphemeralStoreManager from '../components/ColabDocEditor/EphemeralStoreManager';

/**
 * A Colab document
 */
export class ColabDoc<T extends ColabLoroDoc> {
  protected loroDoc: T;

  protected loroDocController: ColabDocController<T>;

  constructor(loroDoc: T, loroDocController: ColabDocController<T>) {
    this.loroDoc = loroDoc;
    this.loroDocController = loroDocController;
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
}

/**
 * A sheet document
 */
export class ColabSheetDoc extends ColabDoc<SheetLoroDoc> {
  private sheetDoc: SheetDocument;

  constructor(
    loroDoc: SheetLoroDoc,
    loroDocController: SheetDocController,
    sheetDoc: SheetDocument,
  ) {
    super(loroDoc, loroDocController);
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
 * A connected Colab sheet document
 */
export class ConnectedSheetDoc extends ColabSheetDoc {
  protected ephStoreMgr: ColabEphemeralStoreManager;

  constructor(
    loroDoc: SheetLoroDoc,
    loroDocController: SheetDocController,
    sheetDoc: SheetDocument,
    ephStoreMgr: ColabEphemeralStoreManager,
  ) {
    super(loroDoc, loroDocController, sheetDoc);
    this.ephStoreMgr = ephStoreMgr;
  }

  public getEphStoreMgr(): ColabEphemeralStoreManager {
    return this.ephStoreMgr;
  }
}

/**
 * A frozen sheet document
 */
export class FrozenSheetDoc extends ColabSheetDoc {
  protected version: number;
  protected versionV: VersionVector;

  constructor(
    loroDoc: SheetLoroDoc,
    loroDocController: SheetDocController,
    sheetDoc: SheetDocument,
    version: number,
    versionV: VersionVector,
  ) {
    super(loroDoc, loroDocController, sheetDoc);
    this.version = version;
    this.versionV = versionV;
  }

  public getVersion(): number {
    return this.version;
  }

  public getVersionV(): VersionVector {
    return this.versionV;
  }

  public getEphStoreMgr(): ColabEphemeralStoreManager {
    // Return a dummy Ephemeral store
    return new EphemeralStoreManager(
      new EphemeralStore<Record<string, Value>>(),
      this.loroDoc.peerId + '',
      {
        name: '',
        color: '',
        id: '',
      },
    );
  }
}

/**
 * A statement document
 */
export class ColabStmtDoc extends ColabDoc<StmtLoroDoc> {
  private statementDoc: StatementDocument;

  constructor(
    loroDoc: StmtLoroDoc,
    loroDocController: StatementDocController,
    statementDoc: StatementDocument,
  ) {
    super(loroDoc, loroDocController);
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

/**
 * A connected Colab statement document
 */
export class ConnectedStmtDoc extends ColabStmtDoc {
  protected ephStoreMgr: ColabEphemeralStoreManager;

  constructor(
    loroDoc: StmtLoroDoc,
    loroDocController: StatementDocController,
    statementDoc: StatementDocument,
    ephStoreMgr: ColabEphemeralStoreManager,
  ) {
    super(loroDoc, loroDocController, statementDoc);
    this.ephStoreMgr = ephStoreMgr;
  }

  public getEphStoreMgr(): ColabEphemeralStoreManager {
    return this.ephStoreMgr;
  }
}

/**
 * A frozen statement document
 */
export class FrozenStmtDoc extends ColabStmtDoc {
  protected version: number;
  protected versionV: VersionVector;

  constructor(
    loroDoc: StmtLoroDoc,
    loroDocController: StatementDocController,
    statementDoc: StatementDocument,
    version: number,
    versionV: VersionVector,
  ) {
    super(loroDoc, loroDocController, statementDoc);
    this.version = version;
    this.versionV = versionV;
  }

  public getVersion(): number {
    return this.version;
  }

  public getVersionV(): VersionVector {
    return this.versionV;
  }

  public getEphStoreMgr(): ColabEphemeralStoreManager {
    // Return a dummy Ephemeral store
    return new EphemeralStoreManager(
      new EphemeralStore<Record<string, Value>>(),
      this.loroDoc.peerId + '',
      {
        name: '',
        color: '',
        id: '',
      },
    );
  }
}
