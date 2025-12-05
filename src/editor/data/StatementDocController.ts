import { LoroList, LoroMap } from 'loro-crdt';
import { AclLoroMap, StmtLoroDoc } from './ColabDoc';
import { Permission } from '../../ui/data/Permission';

class StatementDocController {
  loroDoc: StmtLoroDoc;

  constructor(loroDoc: StmtLoroDoc) {
    this.loroDoc = loroDoc;
  }

  /**
   * Get the document ACL map
   * @returns
   */
  getDocAclMap(): Record<Permission, string[]> {
    const aclMap = this.loroDoc.getMap('acl');
    return aclMap.toJSON();
  }

  /**
   * Update the document ACL map with new ACLs
   * @param newAcls
   */
  patchDocAclMap(newAcls: Record<Permission, string[]>) {
    const aclMap = this.loroDoc.getMap('acl') as AclLoroMap;
    this.patchAclMap(aclMap, newAcls);
  }

  /**
   * Update the statement element ACL map for a given language
   * @param langCode
   * @param newAcls
   */
  patchStmtElementAclMap(
    langCode: string,
    newAcls: Record<Permission, string[]>,
  ) {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const aclMap = stmtElementMap.getOrCreateContainer(
      'acl',
      new LoroMap(),
    ) as AclLoroMap;
    if (!aclMap) {
      throw new Error(`Could not find ACL map for language ${langCode}`);
    }
    this.patchAclMap(aclMap, newAcls);
  }

  /**
   * Get the statement element ACL map for a given language
   * @param langCode
   * @returns
   */
  getStmtElementAclMap(langCode: string): Record<Permission, string[]> {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const aclMap = stmtElementMap.get('acl');
    if (!aclMap) {
      return {} as Record<Permission, string[]>;
    }
    return aclMap.toJSON();
  }

  /**
   * Add a language to the statement document
   * @param langCode
   * @returns
   */
  addLanguage(langCode: string) {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    // Create it in the loroDoc if it doesn't exist
    const stmtElementMap = contentMap.getOrCreateContainer(
      langCode,
      new LoroMap(),
    );
    const textElementMap = stmtElementMap.getOrCreateContainer(
      'textElement',
      new LoroMap(),
    );
    textElementMap.set('nodeName', 'doc');
  }

  /**
   * Remove a language from the statement document
   * @param langCode
   */
  removeLanguage(langCode: string) {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    contentMap.delete(langCode);
  }

  /**
   * Commit all changes in the loroDoc
   */
  commit() {
    this.loroDoc.commit();
  }

  /**
   * A utility method to patch an ACL map with new ACLs
   * @param aclMap
   * @param newAcls
   */
  patchAclMap(aclMap: AclLoroMap, newAcls: Record<Permission, string[]>) {
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
}
export default StatementDocController;
