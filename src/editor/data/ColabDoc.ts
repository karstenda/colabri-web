import { LoroDoc } from 'loro-crdt';

export type PermissionMap = {
  [contentId: string]: {
    canEdit: [string];
    canView: [string];
    canManage: [string];
  };
};

export type ColabDoc = {
  id: number;
  name: string;
  author: string;
  state: 'draft' | 'approval-pending' | 'approved';
  loroDoc: LoroDoc;
  permissionMap?: PermissionMap;
  modifiedOn: string;
  addedOn: string;
};

export type SerializedColabDoc = Omit<ColabDoc, 'loroDoc'> & {
  loroDoc: string;
};
