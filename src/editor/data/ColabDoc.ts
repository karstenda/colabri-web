import { LoroDoc, LoroList, LoroMap } from 'loro-crdt';
import {
  ColabApprovalState,
  ColabApprovalType,
  ColabModelType,
  DocumentStream,
  StatementDocument,
} from '../../api/ColabriAPI';
import { Permission } from '../../ui/data/Permission';

export type ColabDocType =
  | ColabModelType.ColabModelStatementType
  | ColabModelType.ColabModelSheetType;

export type ColabDoc =
  | StatementDocument
  | {
      acls: Record<string, string[]>;
      createdAt: string;
      createdBy: string;
      id: string;
      name: string;
      owner: string;
      streams: Record<string, DocumentStream[]>;
      type: string;
      updatedAt: string;
      updatedBy: string;
    };

export type StmtDocSchema = {
  properties: StmtDocPropertiesLoro;
  content: LoroMap<Record<string, StmtElementLoro>>;
  acls: AclLoroMap;
};

export type SheetDocSchema = {
  properties: StmtDocPropertiesLoro;
  content: LoroList<LoroMap>;
  acls: AclLoroMap;
  approvals: LoroMap<Record<string, ApprovalLoro>>;
};

export type ColabLoroDoc = LoroDoc<StmtDocSchema | SheetDocSchema>;

export type StmtLoroDoc = LoroDoc<StmtDocSchema>;

export type SheetLoroDoc = LoroDoc<SheetDocSchema>;

export type AclLoroMap = LoroMap<Record<Permission, LoroList<string>>>;

export type StmtDocPropertiesLoro = LoroMap<{
  type: string;
  contentType: string;
}>;

export type StmtElementLoro = LoroMap<{
  textElement: textElementLoro;
  acls: AclLoroMap;
  approvals: LoroMap<Record<string, UserApprovalLoro>>;
}>;

export type ApprovalLoro = GroupApprovalLoro | UserApprovalLoro;

export type UserApprovalLoro = LoroMap<{
  type: ColabApprovalType.User;
  state: ColabApprovalState;
  user: string;
  date: Date;
}>;

export type GroupApprovalLoro = LoroMap<{
  type: ColabApprovalType.Group;
  state: ColabApprovalState;
  group: string;
  onOfGroup: boolean;
  approvals: LoroMap<Record<string, UserApprovalLoro>>;
}>;

export type textElementLoro = LoroMap<{
  type: string;
  children?: LoroList<TextElementChild>;
  attributes?: LoroMap<{ [key: string]: string }>;
}>;

export type TextElementChild = LoroMap<{
  type: string;
  children?: LoroList<TextElementChild> | string;
  attributes?: LoroMap<{ [key: string]: string }>;
}>;
