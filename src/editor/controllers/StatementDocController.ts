import { LoroEventBatch, LoroList, LoroMap, Subscription } from 'loro-crdt';
import { AclLoroMap, StmtElementLoro, StmtLoroDoc } from '../data/ColabLoroDoc';
import StatementController from './StatementController';
import { pathStartsWith } from '../util/LoroPathUtil';
import { Permission } from '../../ui/data/Permission';

/**
 * A controller for a statement document
 */
class StatementDocController extends StatementController<StmtLoroDoc> {
  constructor(
    loroDoc: StmtLoroDoc,
    orgId: string,
    owner: string,
    userId: string,
    authPrpls?: Set<string>,
  ) {
    super(loroDoc, orgId, owner, userId, authPrpls);
  }

  /**
   * Get the content type of the document
   *
   * @returns
   */
  getContentType(): string | undefined {
    const propertiesMap = this.getPropertiesMap();
    const contentType = propertiesMap.get('contentType');
    return contentType;
  }

  /**
   * Get the main properties map
   */
  getPropertiesMap(): LoroMap<Record<string, any>> {
    const propertiesMap = this.loroDoc.getMap('properties');
    if (!propertiesMap) {
      throw new Error('Could not find properties map in loroDoc');
    }
    return propertiesMap;
  }

  /**
   * Get the main content map
   * @returns
   */
  getContentMap(): LoroMap<Record<string, StmtElementLoro>> {
    const contentMap = this.loroDoc.getMap('content');
    if (!contentMap) {
      throw new Error('Could not find content map in loroDoc');
    }
    return contentMap;
  }

  /**
   * Get the main properties map
   */
  getAclMap(): AclLoroMap {
    const aclsMap = this.loroDoc.getMap('acls');
    if (!aclsMap) {
      throw new Error('Could not find acls map in loroDoc');
    }
    return aclsMap;
  }

  /**
   * Get the all ACLs that the statement elements inherit
   * @returns
   */
  getTopAcls(): Record<Permission, string[]> {
    return this.getDocAclMap();
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
  ): Subscription {
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      for (const ev of event.events) {
        if (
          pathStartsWith(ev.path, ['acls']) ||
          pathStartsWith(ev.path, ['content', langCode, 'acls'])
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
  ): Subscription {
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      for (const ev of event.events) {
        if (pathStartsWith(ev.path, ['content', langCode, 'approvals'])) {
          callback(event);
          break;
        }
      }
    });
  }
}

export default StatementDocController;
