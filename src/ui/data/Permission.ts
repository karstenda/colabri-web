export const Permission = {
  View: 'view',
  Edit: 'edit',
  Approve: 'approve',
  Manage: 'manage',
  AddRemove: 'add-remove',
  Delete: 'delete',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
