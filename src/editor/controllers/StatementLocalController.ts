import { ContainerID, LoroEventBatch, LoroList, LoroMap } from 'loro-crdt';
import {
  AclLoroMap,
  SheetLoroDoc,
  StmtDocSchema,
  StmtElementLoro,
  StmtLoroDoc,
} from '../data/ColabDoc';
import ColabDocController from './ColabDocController';
import { pathStartsWith } from '../util/LoroPathUtil';
import StatementController from './StatementController';
import { Permission } from '../../ui/data/Permission';
import SheetDocController from './SheetDocController';

/**
 * A controller for a statement embedded in another document
 */
class StatementLocalController extends StatementController<SheetLoroDoc> {
  protected stmtMap: LoroMap<StmtDocSchema>;
  protected sheetController: SheetDocController;
  protected blockId: ContainerID;

  // Constructor
  constructor(
    loroDoc: SheetLoroDoc,
    sheetController: SheetDocController,
    blockId: ContainerID,
    stmtMap: LoroMap<StmtDocSchema>,
    orgId: string,
    owner: string,
    userId: string,
    authPrpls?: Set<string>,
  ) {
    super(loroDoc, orgId, owner, userId, authPrpls);
    this.stmtMap = stmtMap;
    this.sheetController = sheetController;
    this.blockId = blockId;
  }

  /**
   * Get the controller for the main sheet
   * @returns
   */
  getSheetController(): SheetDocController {
    return this.sheetController;
  }

  /**
   * The ID of the block that contains this statement
   * @returns
   */
  getBlockId(): ContainerID {
    return this.blockId;
  }

  /**
   * Get the main properties map
   */
  getPropertiesMap(): LoroMap<Record<string, any>> {
    const propertiesMap = this.stmtMap.get('properties');
    if (!propertiesMap) {
      throw new Error(
        'Could not find properties map in the embedded statement',
      );
    }
    return propertiesMap;
  }

  /**
   * Get the main content map
   * @returns
   */
  getContentMap(): LoroMap<Record<string, StmtElementLoro>> {
    const contentMap = this.stmtMap.get('content');
    if (!contentMap) {
      throw new Error('Could not find content map in the embedded statement');
    }
    return contentMap;
  }

  /**
   * Get the main acl map
   */
  getStmtAclMap() {
    const aclsMap = this.stmtMap.get('acls');
    if (!aclsMap) {
      throw new Error('Could not find acls map in the embedded statement');
    }
    return aclsMap.toJSON();
  }

  /**
   * Get the all ACLs that the statement elements inherit
   * @returns
   */
  getTopAcls(): Record<Permission, string[]> {
    // Get the acls from all the levels
    const docAcls = this.getDocAclMap();
    const blockAcls = this.sheetController.getBlockAclMap(this.blockId);
    const stmtAcls = this.getStmtAclMap();

    // Merge them together - combine arrays for each permission key
    return [docAcls, blockAcls, stmtAcls].reduce(
      (merged, acls) => {
        for (const [permission, prpls] of Object.entries(acls) as [
          Permission,
          string[],
        ][]) {
          merged[permission] = [
            ...new Set([...(merged[permission] || []), ...prpls]),
          ];
        }
        return merged;
      },
      {} as Record<Permission, string[]>,
    );
  }

  /**
   * Patch the ACL map for the statement.
   * @param newAcls
   * @returns
   */
  patchStatementAclMap(newAcls: Record<Permission, string[]>) {
    // Check permissions
    if (!this.hasManagePermission()) {
      console.warn('User does not have permission to manage statement ACLs.');
      return;
    }
    // Patch the ACL map
    const aclMap = this.stmtMap.get('acls') as AclLoroMap;
    this.patchAclMap(aclMap, newAcls);
  }

  /**
   * Subscribe to ACL changes for the statement.
   *
   * @param langCode
   * @param callback
   * @returns
   */
  subscribeToStatementAclChanges(callback: (event: LoroEventBatch) => void) {
    // Get the path to the root map
    const stmtMapPath = this.loroDoc.getPathToContainer(this.stmtMap.id);
    if (!stmtMapPath) {
      throw new Error('Could not find path to root map in embedded statement');
    }

    // Subscribe to changes under the root map
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      for (const ev of event.events) {
        if (pathStartsWith(ev.path, [...stmtMapPath, 'acls'])) {
          callback(event);
          break;
        }
      }
    });
  }

  /**
   * Subscribe to ACL changes for the statement element.
   *
   * @param langCode
   * @param callback
   * @returns
   */
  subscribeToStatementElementAclChanges(
    langCode: string,
    callback: (event: LoroEventBatch) => void,
  ) {
    // Get the path to the root map
    const stmtMapPath = this.loroDoc.getPathToContainer(this.stmtMap.id);
    if (!stmtMapPath) {
      throw new Error('Could not find path to root map in embedded statement');
    }

    // Subscribe to changes under the root map
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      for (const ev of event.events) {
        if (
          pathStartsWith(ev.path, [...stmtMapPath, 'acls']) ||
          pathStartsWith(ev.path, [...stmtMapPath, 'content', langCode, 'acls'])
        ) {
          callback(event);
          break;
        }
      }
    });
  }

  /**
   * Subscribe to ACL changes for the statement element.
   *
   * @param langCode
   * @param callback
   * @returns
   */
  subscribeToStatementElementApprovalChanges(
    langCode: string,
    callback: (event: LoroEventBatch) => void,
  ) {
    // Get the path to the root map
    const stmtMapPath = this.loroDoc.getPathToContainer(this.stmtMap.id);
    if (!stmtMapPath) {
      throw new Error('Could not find path to root map in embedded statement');
    }

    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      for (const ev of event.events) {
        if (
          pathStartsWith(ev.path, [
            ...stmtMapPath,
            'content',
            langCode,
            'approvals',
          ])
        ) {
          callback(event);
          break;
        }
      }
    });
  }
}

export default StatementLocalController;
