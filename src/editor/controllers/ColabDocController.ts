import {
  ContainerID,
  LoroCounter,
  LoroEventBatch,
  LoroList,
  LoroMap,
  LoroMovableList,
  LoroText,
  LoroTree,
} from 'loro-crdt';
import { Permission } from '../../ui/data/Permission';
import {
  AclLoroMap,
  ColabLoroDoc,
  UserApprovalLoro,
} from '../data/ColabLoroDoc';
import { pathEquals, pathStartsWith } from '../util/LoroPathUtil';
import { ColabApprovalState } from '../../api/ColabriAPI';

export default class ColabDocController<T extends ColabLoroDoc> {
  // The actual lorodoc
  protected loroDoc: T;

  // The prpl of the owner
  protected owner: string;

  // The ID of the organization
  protected orgId: string;

  // The set of authorized principals of the current user
  protected authPrpls: Set<string>;

  // The user id of the current user in the current organization
  protected userId: string;

  constructor(
    loroDoc: T,
    orgId: string,
    owner: string,
    userId: string,
    authPrpls?: Set<string>,
  ) {
    this.orgId = orgId;
    this.owner = owner;
    this.loroDoc = loroDoc;
    this.userId = userId;
    this.authPrpls = authPrpls ?? new Set<string>();
  }

  /**
   * Whether the current user is the owner of the document
   * @returns
   */
  public isOwner(): boolean {
    return this.authPrpls.has(this.owner);
  }

  /**
   * Get the document ACL map
   * @returns
   */
  public getDocAclMap(): Record<Permission, string[]> {
    const aclMap = this.loroDoc.getMap('acls');
    return aclMap.toJSON();
  }

  /**
   * Get the value of a field given the parent container ID and the field name.
   *
   * @param containerId
   * @param fieldName
   */
  public getFieldValue(containerId: ContainerID, fieldName: string): any {
    const container = this.loroDoc.getContainerById(
      containerId,
    ) as LoroMap<any>;
    if (!container) {
      console.warn(
        `Container with ID ${containerId} not found in the document. Returning undefined for field ${fieldName}.`,
      );
      return undefined;
    }

    const field = container.get(fieldName);
    if (!field) {
      console.warn(
        `Field ${fieldName} not found in container ${containerId}. Returning undefined.`,
      );
      return undefined;
    }
    return field;
  }

  /**
   * Set the value of a field given the parent container ID and the field name.
   *
   * @param containerId
   * @param fieldName
   * @param value
   * @returns
   */
  public setFieldValue(
    containerId: ContainerID,
    fieldName: string,
    value: any,
  ) {
    const container = this.loroDoc.getContainerById(
      containerId,
    ) as LoroMap<any>;
    if (!container) {
      console.warn(
        `Container with ID ${containerId} not found in the document. Cannot set field ${fieldName}.`,
      );
      return;
    }

    // Set the value
    if (
      value instanceof LoroList ||
      value instanceof LoroMap ||
      value instanceof LoroMovableList ||
      value instanceof LoroText ||
      value instanceof LoroCounter ||
      value instanceof LoroTree
    ) {
      container.setContainer(fieldName, value);
    } else {
      container.set(fieldName, value);
    }
  }

  /**
   * Subscribe to changes on a specific field given the parent container ID and the field name.
   *
   * @param containerId
   * @param fieldName
   * @param callback
   * @returns
   */
  subscribeToFieldChanges(
    containerId: ContainerID,
    fieldName: string,
    callback: (ev: LoroEventBatch) => void,
  ) {
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      const containerPath = this.loroDoc.getPathToContainer(containerId);
      if (!containerPath) {
        // Probably because the container was deleted
        return;
      }
      for (const ev of event.events) {
        if (pathEquals(ev.path, [...containerPath])) {
          if (ev.diff?.type === 'map' && ev.diff.updated[fieldName]) {
            callback(event);
            break;
          }
          callback(event);
          break;
        }
        if (pathEquals(ev.path, [...containerPath, fieldName])) {
          callback(event);
          break;
        }
      }
    });
  }

  /**
   * Update the document ACL map with new ACLs
   * @param newAcls
   */
  public patchDocAclMap(newAcls: Record<Permission, string[]>) {
    // Check permissions
    if (!this.hasManagePermission()) {
      console.warn('User does not have permission to manage document ACLs.');
      return;
    }

    // Patch the ACL map
    const aclMap = this.loroDoc.getMap('acls') as AclLoroMap;
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
   * Whether all approvals have been done on the document
   */
  public isFullyApproved(): boolean {
    throw new Error('Method not implemented.');
  }

  /**
   * A utility method to get the state from an Approval map
   * @param approvalMap
   */
  protected getApprovalStateFromMap(
    approvalMap: LoroMap<Record<string, UserApprovalLoro>>,
  ) {
    if (!approvalMap || approvalMap.size === 0) {
      return ColabApprovalState.Draft;
    } else {
      // Iterate over the approvals to see if any are pending
      let lowestStateScore = 4;
      for (let [key, value] of approvalMap.entries()) {
        const approval = value as any as UserApprovalLoro;
        // Associate a score with this state
        let score = 1;
        if (approval.get('state') === ColabApprovalState.Rejected) {
          score = 0;
        } else if (approval.get('state') === ColabApprovalState.Approved) {
          score = 3;
        } else if (approval.get('state') === ColabApprovalState.Pending) {
          score = 2;
        } else if (approval.get('state') === ColabApprovalState.Draft) {
          score = 1;
        }

        if (score < lowestStateScore) {
          lowestStateScore = score;
        }
      }

      // Map the lowest score back to a state
      if (lowestStateScore === 3) {
        return ColabApprovalState.Approved;
      } else if (lowestStateScore === 2) {
        return ColabApprovalState.Pending;
      } else if (lowestStateScore === 1) {
        return ColabApprovalState.Draft;
      } else if (lowestStateScore === 0) {
        return ColabApprovalState.Rejected;
      } else {
        console.log('Unknown state score: ' + lowestStateScore);
        return ColabApprovalState.Draft;
      }
    }
  }

  /**
   * Subscribe to document ACL changes
   *
   * @param callback
   * @returns
   */
  public subscribeToDocAclChanges(callback: (event: LoroEventBatch) => void) {
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      // Iterate over the events
      for (const ev of event.events) {
        if (pathStartsWith(ev.path, ['acls'])) {
          callback(event);
          break;
        }
      }
    });
  }

  /**
   * Whether the current user can manage the document
   *
   * @returns
   */
  public hasManagePermission(): boolean {
    // Check if the current user is the owner.
    if (this.authPrpls.has(this.owner)) {
      return true;
    }
    // Check if the current user is a cloud admin.
    if (this.authPrpls.has('r/Colabri-CloudAdmin')) {
      return true;
    }
    // Check if the current user is an org admin.
    if (this.authPrpls.has(this.orgId + '/f/admin')) {
      return true;
    }
    // Check if the current user has ACLs that give him manage permission.
    const aclMap = this.getDocAclMap();
    const managePrpls = aclMap[Permission.Manage] || [];
    return managePrpls.some((prpl) => this.authPrpls.has(prpl));
  }

  /**
   * Whether the current user can add/remove to and from document
   */
  public hasAddRemovePermission(): boolean {
    // If you can manage the document, you can add/remove
    if (this.hasManagePermission()) {
      return true;
    }

    // Otherwise, check if the current user has specific add/remove ACLs
    const aclMap = this.getDocAclMap();
    const addRemovePrpls = aclMap[Permission.AddRemove] || [];
    return addRemovePrpls.some((prpl) => this.authPrpls.has(prpl));
  }

  /**
   * Commit all changes in the loroDoc
   */
  public commit() {
    this.loroDoc.commit();
  }
}
