import { LoroEventBatch, LoroList, LoroMap, Subscription } from 'loro-crdt';
import {
  AclLoroMap,
  ColabLoroDoc,
  SheetLoroDoc,
  StmtDocSchema,
  StmtElementLoro,
  StmtLoroDoc,
  UserApprovalLoro,
} from '../data/ColabDoc';
import { Permission } from '../../ui/data/Permission';
import ColabDocController from './ColabDocController';
import { ColabApprovalState, ColabApprovalType } from '../../api/ColabriAPI';

class StatementController<
  T extends ColabLoroDoc,
> extends ColabDocController<T> {
  // Constructor
  // Loro document, set of authorized principals of the current user
  constructor(
    loroDoc: T,
    orgId: string,
    owner: string,
    userId: string,
    authPrpls?: Set<string>,
  ) {
    super(loroDoc, orgId, owner, userId, authPrpls);
  }

  /**
   * Get the main properties map
   */
  getPropertiesMap(): LoroMap<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  /**
   * Get the main content map
   * @returns
   */
  getContentMap(): LoroMap<Record<string, StmtElementLoro>> {
    throw new Error('Method not implemented.');
  }

  /**
   * Get all ACLs that the statement elements inherit from parents
   */
  getTopAcls(): Record<Permission, string[]> {
    throw new Error('Method not implemented.');
  }

  /**
   * Get all language codes in the statement
   * @returns
   */
  getLangCodes(): string[] {
    const contentMap = this.getContentMap();
    return Array.from(contentMap.keys());
  }

  /**
   * Check if the statement has a specific language
   * @param langCode
   * @returns
   */
  hasLangCode(langCode: string): boolean {
    return this.getLangCodes().includes(langCode);
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
    const contentMap = this.getContentMap();
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const aclMap = stmtElementMap.getOrCreateContainer(
      'acls',
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
    const contentMap = this.getContentMap();
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const aclMap = stmtElementMap.get('acls');
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
    const contentMap = this.getContentMap();
    // Create it in the loroDoc if it doesn't exist
    const stmtElementMap = contentMap.getOrCreateContainer(
      langCode,
      new LoroMap(),
    );
    // Create the ACL map
    stmtElementMap.getOrCreateContainer('acl', new LoroMap());
    // Create the approvals list
    stmtElementMap.getOrCreateContainer('approvals', new LoroMap());
    // Create the textElement
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
    const contentMap = this.getContentMap();
    contentMap.delete(langCode);
  }

  /**
   * Get the state of the specified statement element
   * @returns
   */
  getStatementElementState(langCode: string): ColabApprovalState {
    const contentMap = this.getContentMap();
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const stmtElementApprovalMap = stmtElementMap.get('approvals');
    return this.getApprovalStateFromMap(stmtElementApprovalMap);
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
      elementState === ColabApprovalState.Approved ||
      elementState === ColabApprovalState.Pending
    ) {
      return false;
    }

    // Check if the user has edit permissions through parents
    const aclMap = this.getTopAcls();
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
   * Check if the user has approve permission for the statement element
   * @param langCode
   * @returns
   */
  hasApprovePermission(langCode: string): boolean {
    // Check if the user has global edit permission
    const aclMap = this.getTopAcls();
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
   * Approve the statement element for the given language
   * @param langCode
   */
  approveStatementElement(langCode: string, approvalKey: string): boolean {
    // Double check whether the user can approve
    if (!this.hasApprovePermission(langCode)) {
      console.warn('User cannot approve this statement element: ' + langCode);
      return false;
    }

    // Target the right statement element
    const contentMap = this.getContentMap();
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    let stmtElementApprovalMap = stmtElementMap.get('approvals');
    if (!stmtElementApprovalMap) {
      stmtElementApprovalMap = stmtElementMap.getOrCreateContainer(
        'approvals',
        new LoroMap<Record<string, UserApprovalLoro>>(),
      );
    }

    // Target the specified appoval
    let approval = stmtElementApprovalMap.get(approvalKey);
    // If it doesn't exist, create it
    if (!approval) {
      approval = stmtElementApprovalMap.getOrCreateContainer(
        approvalKey,
        new LoroMap(),
      );
      approval.set('type', ColabApprovalType.User);
      approval.set('user', this.userId);
      approval.set('state', ColabApprovalState.Approved);
      approval.set('date', new Date());
      return true;
    }
    // Else, update it
    else {
      // But first check if it's allowed.
      if (approval.get('state') === ColabApprovalState.Approved) {
        return false;
      }
      // Update the approval
      approval.set('type', ColabApprovalType.User);
      approval.set('user', this.userId);
      approval.set('state', ColabApprovalState.Approved);
      approval.set('date', new Date());
      return true;
    }
  }

  /**
   * Reject the statement element for the given language
   * @param langCode
   * @param approvalKey
   */
  rejectStatementElement(langCode: string, approvalKey: string): boolean {
    // Check permissions
    if (!this.hasApprovePermission(langCode)) {
      console.warn('User cannot reject this statement element: ' + langCode);
      return false;
    }

    // Target the right statement element
    const contentMap = this.getContentMap();
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    let stmtElementApprovalMap = stmtElementMap.get('approvals');
    if (!stmtElementApprovalMap) {
      stmtElementApprovalMap = stmtElementMap.getOrCreateContainer(
        'approvals',
        new LoroMap<Record<string, UserApprovalLoro>>(),
      );
    }

    // Target the specified appoval
    let approval = stmtElementApprovalMap.get(approvalKey);
    // If it doesn't exist, create it
    if (!approval) {
      approval = stmtElementApprovalMap.getOrCreateContainer(
        approvalKey,
        new LoroMap(),
      );
      approval.set('type', ColabApprovalType.User);
      approval.set('user', this.userId);
      approval.set('state', ColabApprovalState.Rejected);
      approval.set('date', new Date());
      return true;
    }
    // Else, update it
    else {
      if (approval.get('state') === ColabApprovalState.Rejected) {
        return false;
      }
      // Update the approval
      approval.set('type', ColabApprovalType.User);
      approval.set('user', this.userId);
      approval.set('state', ColabApprovalState.Rejected);
      approval.set('date', new Date());
      return true;
    }
  }

  /**
   * Revert the statement element approval to draft for the given language
   * @param langCode
   * @param approvalKey
   */
  revertStatementElementToDraft(langCode: string): boolean {
    // Check permissions
    if (!this.hasApprovePermission(langCode) && !this.hasManagePermission()) {
      console.warn(
        'User cannot revert approval for this statement element: ' + langCode,
      );
      return false;
    }

    // Target the right statement element
    const contentMap = this.getContentMap();
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const stmtElementApprovalMap = stmtElementMap.get('approvals');
    if (!stmtElementApprovalMap) {
      return false;
    }

    // Clear all approvals
    stmtElementApprovalMap.clear();
    return true;
  }

  /**
   * Returns true if the specified approval is rejected.
   *
   * @param langCode
   * @param approvalKey
   * @returns
   */
  hasRejectedApproval(langCode: string, approvalKey: string): boolean {
    // Target the right statement element
    const contentMap = this.getContentMap();
    const stmtElementMap = contentMap.get(langCode);
    if (!stmtElementMap) {
      throw new Error(
        `Could not find statement element for language ${langCode}`,
      );
    }
    const stmtElementApprovalMap = stmtElementMap.get('approvals');
    if (!stmtElementApprovalMap) {
      return false;
    }
    // Target the specified appoval
    const approval = stmtElementApprovalMap.get(approvalKey);
    if (!approval) {
      return false;
    }
    return approval.get('state') === ColabApprovalState.Rejected;
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
    throw new Error('Method not implemented.');
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
    throw new Error('Method not implemented.');
  }
}
export default StatementController;
