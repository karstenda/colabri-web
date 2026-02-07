import { LoroDoc, LoroList, LoroMap, LoroMovableList } from 'loro-crdt';
import {
  ColabApprovalState,
  ColabApprovalType,
  DocumentType,
  ColabSheetBlockType,
  DocumentStream,
  StatementDocument,
  StatementGridRowType,
} from '../../api/ColabriAPI';
import { Permission } from '../../ui/data/Permission';

export type ColabDocType =
  | DocumentType.DocumentTypeColabStatement
  | DocumentType.DocumentTypeColabSheet;

export type StmtDocSchema = {
  properties: DocPropertiesLoro;
  content: LoroMap<Record<string, StmtElementLoro>>;
  acls: AclLoroMap;
};

export type SheetDocSchema = {
  properties: DocPropertiesLoro;
  content: LoroMovableList<SheetBlockLoro>;
  acls: AclLoroMap;
  approvals: LoroMap<Record<string, ApprovalLoro>>;
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
}>;

export type StmtElementLoro = LoroMap<{
  textElement: TextElementLoro;
  acls: AclLoroMap;
  approvals: LoroMap<Record<string, UserApprovalLoro>>;
}>;

export type SheetBlockLoro = LoroMap<
  SheetTextBlockSchema | SheetStatementGridBlockSchema
>;

export type SheetTextBlockSchema = {
  type: ColabSheetBlockType;
  acls: AclLoroMap;
  title: TextElementLoro;
  textElement: TextElementLoro;
  approvals: LoroMap<Record<string, UserApprovalLoro>>;
};

export type SheetTextBlockLoro = LoroMap<SheetTextBlockSchema>;

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

export type TextElementLoro = LoroMap<{
  nodeName: string;
  children?: LoroList<TextElementChild>;
  attributes?: LoroMap<{ [key: string]: string }>;
}>;

export type TextElementChild = LoroMap<{
  nodeName: string;
  children?: LoroList<TextElementChild> | string;
  attributes?: LoroMap<{ [key: string]: string }>;
}>;
