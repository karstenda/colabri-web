import { LoroList } from 'loro-crdt';
import { Permission } from '../../ui/data/Permission';
import { AclLoroMap, ColabLoroDoc } from '../data/ColabDoc';

export default class ColabDocController<T extends ColabLoroDoc> {
  protected loroDoc: T;

  // The set of authorized principals of the current user
  protected authPrpls: Set<string>;

  constructor(loroDoc: T, authPrpls?: Set<string>) {
    this.loroDoc = loroDoc;
    this.authPrpls = authPrpls ?? new Set<string>();
  }

  /**
   * Get the document ACL map
   * @returns
   */
  public getDocAclMap(): Record<Permission, string[]> {
    const aclMap = this.loroDoc.getMap('acl');
    return aclMap.toJSON();
  }

  /**
   * Update the document ACL map with new ACLs
   * @param newAcls
   */
  public patchDocAclMap(newAcls: Record<Permission, string[]>) {
    const aclMap = this.loroDoc.getMap('acl') as AclLoroMap;
    this.patchAclMap(aclMap, newAcls);
  }

  /**
   * A utility method to patch an ACL map with new ACLs
   * @param aclMap
   * @param newAcls
   */
  protected patchAclMap(
    aclMap: AclLoroMap,
    newAcls: Record<Permission, string[]>,
  ) {
    // First get the current ACLs
    const currentAcls = aclMap.toJSON() as Record<Permission, string[]>;

    // Get all permission keys from both current and new ACLs
    const allPermissions = new Set([
      ...Object.keys(currentAcls),
      ...Object.keys(newAcls),
    ]) as Set<Permission>;

    // Process each permission
    allPermissions.forEach((permission) => {
      const currentPrpls = currentAcls[permission] || [];
      const newPrpls = newAcls[permission] || [];

      // If the permission doesn't exist in newAcls, remove it entirely
      if (!newAcls[permission]) {
        aclMap.delete(permission);
        return;
      }

      // Convert to sets for efficient comparison
      const currentSet = new Set(currentPrpls);
      const newSet = new Set(newPrpls);

      // Get the permission's array container (or create it if it doesn't exist)
      let permissionList = aclMap.get(permission);
      if (!permissionList) {
        // If it doesn't exist or isn't an array, set the new list
        permissionList = aclMap.setContainer(permission, new LoroList());
        for (const prpl of newPrpls) {
          permissionList.push(prpl);
        }
        return;
      }

      // Find prpls to remove (in current but not in new)
      const toRemove = currentPrpls.filter((prpl) => !newSet.has(prpl));

      // Find prpls to add (in new but not in current)
      const toAdd = newPrpls.filter((prpl) => !currentSet.has(prpl));

      // Remove prpls that are no longer present
      toRemove.forEach((prpl) => {
        const array = permissionList.toArray();
        const index = array.indexOf(prpl);
        if (index !== -1) {
          permissionList.delete(index, 1);
        }
      });

      // Add new prpls
      toAdd.forEach((prpl) => {
        permissionList.push(prpl);
      });
    });
  }

  /**
   * Commit all changes in the loroDoc
   */
  public commit() {
    this.loroDoc.commit();
  }
}
