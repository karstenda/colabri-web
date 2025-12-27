import { LoroEventBatch, LoroMap } from 'loro-crdt';
import { AclLoroMap, StmtLoroDoc } from '../data/ColabDoc';
import { Permission } from '../../ui/data/Permission';
import ColabDocController from './ColabDocController';
import { pathStartsWith } from '../util/LoroPathUtil';
import { ColabContentState } from '../../api/ColabriAPI';

class StatementDocController extends ColabDocController<StmtLoroDoc> {
  // Constructor
  // Loro document, set of authorized principals of the current user
  constructor(
    loroDoc: StmtLoroDoc,
    orgId: string,
    owner: string,
    authPrpls?: Set<string>,
  ) {
    super(loroDoc, orgId, owner, authPrpls);
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
    // Set the state to draft
    stmtElementMap.set('state', ColabContentState.ColabContentStateDraft);
    // Create the textElement
    const textElementMap = stmtElementMap.getOrCreateContainer(
      'textElement',
      new LoroMap(),
    );
    // Create the ACL map
    stmtElementMap.getOrCreateContainer('acl', new LoroMap());
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
   * Get the state of the specified statement element
   * @returns
   */
  getStatementElementState(langCode: string): ColabContentState {
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
    return stmtElementMap.get('state');
  }

  /**
   * Can the current user edit the statement element for the given language
   *
   * @param langCode
   * @returns
   */
  canEditStatementElement(langCode: string): boolean {
    // Check if the element is approved
    const elementState = this.getStatementElementState(langCode);
    if (
      elementState === ColabContentState.ColabContentStateApproved ||
      elementState === ColabContentState.ColabContentStatePending
    ) {
      return false;
    }

    // Check if the user has global edit permission
    const aclMap = this.getDocAclMap();
    for (const prpl of this.authPrpls) {
      const editPrpls = aclMap[Permission.Edit] || [];
      if (editPrpls.includes(prpl)) {
        return true;
      }
    }

    // Check if the user has edit permission on the element
    const elementAclMap = this.getStmtElementAclMap(langCode);
    for (const prpl of this.authPrpls) {
      const editPrpls = elementAclMap[Permission.Edit] || [];
      if (editPrpls.includes(prpl)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Can the current user edit the statement element for the given language
   *
   * @param langCode
   * @returns
   */
  canApproveStatementElement(langCode: string): boolean {
    // Check if the element is approved
    const elementState = this.getStatementElementState(langCode);
    if (elementState === ColabContentState.ColabContentStateApproved) {
      return false;
    }

    // Check if the user has global edit permission
    const aclMap = this.getDocAclMap();
    for (const prpl of this.authPrpls) {
      const editPrpls = aclMap[Permission.Approve] || [];
      if (editPrpls.includes(prpl)) {
        return true;
      }
    }

    // Check if the user has edit permission on the element
    const elementAclMap = this.getStmtElementAclMap(langCode);
    for (const prpl of this.authPrpls) {
      const editPrpls = elementAclMap[Permission.Approve] || [];
      if (editPrpls.includes(prpl)) {
        return true;
      }
    }
    return false;
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
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      for (const ev of event.events) {
        if (
          pathStartsWith(ev.path, ['acl']) ||
          pathStartsWith(ev.path, ['content', langCode, 'acl'])
        ) {
          callback(event);
          break;
        }
      }
    });
  }
}
export default StatementDocController;
