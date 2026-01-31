import { ContainerID } from 'loro-crdt';
import SheetDocController from '../../controllers/SheetDocController';
import StatementDocController from '../../controllers/StatementDocController';
import { PermissionChain } from '../PermissionChainEditor/PermissionChain';
import StatementLocalController from '../../controllers/StatementLocalController';

export type ManageModalType =
  | 'statement'
  | 'statement-element'
  | 'sheet'
  | 'sheet-block'
  | 'sheet-statement'
  | 'sheet-statement-element';

export type ManageModalPayload =
  | ManageStatementModalPayload
  | ManageStatementElementModalPayload
  | ManageSheetModalPayload
  | ManageSheetBlockModalPayload
  | ManageSheetStatementModalPayload
  | ManageSheetStatementElementModalPayload;

export type ManageStatementModalPayload = {
  type: 'statement';
  title?: string;
  stmtDocController: StatementDocController;
  readOnly?: boolean;
};

export type ManageStatementElementModalPayload = {
  type: 'statement-element';
  title?: string;
  stmtDocController: StatementDocController;
  langCode: string;
  readOnly?: boolean;
};

export type ManageSheetModalPayload = {
  type: 'sheet';
  title?: string;
  sheetDocController: SheetDocController;
  readOnly?: boolean;
};

export type ManageSheetBlockModalPayload = {
  type: 'sheet-block';
  title?: string;
  sheetDocController: SheetDocController;
  blockContainerId: ContainerID;
  readOnly?: boolean;
};

export type ManageSheetStatementModalPayload = {
  type: 'sheet-statement';
  title?: string;
  stmtDocController: StatementLocalController;
  blockContainerId: ContainerID;
  readOnly?: boolean;
};

export type ManageSheetStatementElementModalPayload = {
  type: 'sheet-statement-element';
  title?: string;
  stmtDocController: StatementLocalController;
  blockContainerId: ContainerID;
  langCode: string;
  readOnly?: boolean;
};
