import { LoroDoc } from "loro-crdt/base64";

export type PermissionMap = {
    [contentId: string]: {
        canEdit: [string];
        canView: [string];
        canManage: [string];
    }
}

export type ColabDoc = {
    id: number;
    name: string;
    author: string;
    state: "draft" | "approval-pending" | "approved";
    loroDoc?: LoroDoc;
    permissionMap?: PermissionMap;
    modifiedOn: string;
    addedOn: string;
}