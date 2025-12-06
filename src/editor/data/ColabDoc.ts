import { LoroDoc, LoroList, LoroMap } from 'loro-crdt';
import { ColabModelType } from '../../api/ColabriAPI';
import { Permission } from '../../ui/data/Permission';

export type ColabDocType =
  | ColabModelType.ColabModelStatementType
  | ColabModelType.ColabModelSheetType;

export type ColabLoroDoc = StmtLoroDoc | SheetLoroDoc;

export type StmtLoroDoc = LoroDoc<{
  properties: StmtDocPropertiesLoro;
  content: LoroMap<Record<string, StmtElementLoro>>;
  acl?: AclLoroMap;
}>;

export type SheetLoroDoc = LoroDoc<{
  properties: StmtDocPropertiesLoro;
  content: LoroList<LoroMap>;
  acl?: AclLoroMap;
}>;

export type AclLoroMap = LoroMap<Record<Permission, LoroList<string>>>;

export type StmtDocPropertiesLoro = LoroMap<{
  type: string;
  contentType: string;
}>;

export type StmtElementLoro = LoroMap<{
  textElement: textElementLoro;
  acl?: AclLoroMap;
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
