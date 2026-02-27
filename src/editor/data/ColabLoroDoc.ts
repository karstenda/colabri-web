import {
  ContainerID,
  LoroDoc,
  LoroList,
  LoroMap,
  LoroMovableList,
  LoroText,
} from 'loro-crdt';
import {
  ColabApprovalState,
  ColabApprovalType,
  DocumentType,
  ColabSheetBlockType,
  StatementGridRowType,
} from '../../api/ColabriAPI';
import { Permission } from '../../ui/data/Permission';
import { LoroNodeContainerType } from 'loro-prosemirror';

export type ColabDocType =
  | DocumentType.DocumentTypeColabStatement
  | DocumentType.DocumentTypeColabSheet;

export type StmtDocSchema = {
  properties: DocPropertiesLoro;
  attributes: LoroMap<Record<string, string>>;
  acls: AclLoroMap;
  content: LoroMap<Record<string, StmtElementLoro>>;
};

export type SheetDocSchema = {
  properties: DocPropertiesLoro;
  attributes: LoroMap<Record<string, string>>;
  approvals: LoroMap<Record<string, ApprovalLoro>>;
  acls: AclLoroMap;
  content: LoroMovableList<SheetBlockLoro>;
};

export type ColabLoroDoc = LoroDoc<StmtDocSchema | SheetDocSchema>;

export type StmtLoroDoc = LoroDoc<StmtDocSchema>;

export type SheetLoroDoc = LoroDoc<SheetDocSchema>;

export type AclLoroMap = LoroMap<Record<Permission, LoroList<string>>>;

export type DocPropertiesLoro = LoroMap<{
  type: string;
  contentType: string;
  masterLangCode?: string;
  langCodes?: LoroList<string>;
  countryCodes?: LoroList<string>;
  scope?: LoroMap<Record<string, LoroList<string>>>;
}>;

export type StmtElementLoro = LoroMap<{
  textElement: TextElementLoro;
  acls: AclLoroMap;
  approvals: LoroMap<Record<string, UserApprovalLoro>>;
}>;

export type SheetBlockLoro = LoroMap<
  SheetTextBlockSchema | SheetStatementGridBlockSchema
>;

export type SheetPropertiesBlockSchema = {
  type: ColabSheetBlockType;
};

export type SheetPropertiesBlockLoro = LoroMap<SheetPropertiesBlockSchema>;

export type SheetAttributesBlockSchema = {
  type: ColabSheetBlockType;
  acls: AclLoroMap;
  title: TextElementLoro;
  attributeRefs: LoroMap<Record<string, string>>;
  config: any;
};

export type SheetAttributesBlockLoro = LoroMap<SheetAttributesBlockSchema>;

export type SheetTextBlockSchema = {
  type: ColabSheetBlockType;
  acls: AclLoroMap;
  title: TextElementLoro;
  textElement: TextElementLoro;
  approvals: LoroMap<Record<string, UserApprovalLoro>>;
};

export type SheetTextBlockLoro = LoroMap<SheetTextBlockSchema>;

export type SheetBarcodeGridBlockSchema = {
  type: ColabSheetBlockType;
  acls: AclLoroMap;
  title: TextElementLoro;
  rows: LoroMovableList<SheetBarcodeGridRowLoro>;
};

export type SheetBarcodeGridBlockLoro = LoroMap<SheetBarcodeGridBlockSchema>;

export type SheetBarcodeGridRowLoro = LoroMap<{
  barcode: BarcodeDataLoro;
  instance: number;
  scope?: LoroMap<Record<string, LoroList<string>>>;
}>;

export type BarcodeDataLoro = LoroMap<{
  type: string;
  data: string;
  symbolComponentCode?: string;
}>;

export type SheetSymbolGridBlockSchema = {
  type: ColabSheetBlockType;
  acls: AclLoroMap;
  title: TextElementLoro;
  rows: LoroMovableList<SheetSymbolGridRowLoro>;
};

export type SheetSymbolGridBlockLoro = LoroMap<SheetSymbolGridBlockSchema>;

export type SheetSymbolGridRowLoro = LoroMap<{
  symbol: SymbolDataLoro;
  instance: number;
  scope?: LoroMap<Record<string, LoroList<string>>>;
}>;

export type SymbolDataLoro = LoroMap<{
  type: string;
}>;

export type SheetStatementGridBlockSchema = {
  type: ColabSheetBlockType;
  acls: AclLoroMap;
  title: TextElementLoro;
  rows: LoroMovableList<SheetStatementGridRowLoro>;
};

export type SheetStatementGridBlockLoro =
  LoroMap<SheetStatementGridBlockSchema>;

export type SheetStatementGridRowLoro = LoroMap<{
  type: StatementGridRowType;
  statement?: LoroMap<StmtDocSchema>;
  statementRef?: LoroMap<StmtRefSchema>;
  instance: number;
  scope?: LoroMap<Record<string, LoroList<string>>>;
}>;

export type StmtRefSchema = {
  docId: string;
  version: number;
  versionV: string;
};

export type ApprovalLoro = GroupApprovalLoro | UserApprovalLoro;

export type UserApprovalLoro = LoroMap<{
  type: ColabApprovalType.ColabApprovalTypeUser;
  state: ColabApprovalState;
  user: string;
  date: Date;
}>;

export type GroupApprovalLoro = LoroMap<{
  type: ColabApprovalType.ColabApprovalTypeGroup;
  state: ColabApprovalState;
  group: string;
  onOfGroup: boolean;
  approvals: LoroMap<Record<string, UserApprovalLoro>>;
}>;

export type TextElementLoro = LoroNodeContainerType & { id: ContainerID };
