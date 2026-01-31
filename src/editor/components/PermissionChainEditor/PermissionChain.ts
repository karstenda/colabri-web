import { ContainerID } from 'loro-crdt';
import { Permission } from '../../../ui/data/Permission';

export type PermissionChain = {
  chain: Array<{
    name: string;
    label: string;
    containerId?: ContainerID;
    type: 'doc' | 'block' | 'statement' | 'element';
    acls: Record<Permission, string[]>;
    canManage: boolean;
  }>;
};
