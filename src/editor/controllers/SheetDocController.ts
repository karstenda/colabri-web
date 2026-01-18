import {
  ContainerID,
  Loro,
  LoroEventBatch,
  LoroList,
  LoroMap,
} from 'loro-crdt';
import {
  AclLoroMap,
  SheetBlockLoro,
  SheetLoroDoc,
  SheetStatementGridBlockLoro,
  SheetTextBlockLoro,
  StmtLoroDoc,
  UserApprovalLoro,
} from '../data/ColabDoc';
import { Permission } from '../../ui/data/Permission';
import ColabDocController from './ColabDocController';
import { pathStartsWith } from '../util/LoroPathUtil';
import {
  ColabSheetTextBlock,
  ColabSheetStatementGridBlock,
  ColabApprovalState,
  ColabSheetBlockType,
  ColabApprovalType,
} from '../../api/ColabriAPI';

export type ColabSheetBlock =
  | ColabSheetTextBlock
  | ColabSheetStatementGridBlock;

class SheetDocController extends ColabDocController<SheetLoroDoc> {
  // Constructor
  // Loro document, set of authorized principals of the current user
  constructor(
    loroDoc: SheetLoroDoc,
    orgId: string,
    owner: string,
    userId: string,
    authPrpls?: Set<string>,
  ) {
    super(loroDoc, orgId, owner, userId, authPrpls);
  }

  /**
   * Get the Sheet Blocks in the document
   * @param containerId
   */
  getBlockState(containerId: ContainerID): ColabApprovalState {
    // Get the block map
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }

    // Check the block type
    const blockType = blockMap.get('type');
    if (blockType !== ColabSheetBlockType.ColabSheetBlockTypeText) {
      return ColabApprovalState.Draft;
    }
    const textBlockMap = blockMap as SheetTextBlockLoro;

    const blockApprovalMap = textBlockMap.get('approvals');
    return this.getApprovalStateFromMap(blockApprovalMap);
  }

  /**
   * Get the Sheet Blocks in the document
   * @param containerId
   */
  canEditBlock(containerId: ContainerID): boolean {
    // Check if the element is approved
    const elementState = this.getBlockState(containerId);
    if (
      elementState === ColabApprovalState.Approved ||
      elementState === ColabApprovalState.Pending
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
    const elementAclMap = this.getBlockAclMap(containerId);
    for (const prpl of this.authPrpls) {
      const editPrpls = elementAclMap[Permission.Edit] || [];
      if (editPrpls.includes(prpl)) {
        return true;
      }
    }
    return false;
  }

  /**
   *Get the block ACL map for a given id as a non Loro object
   * @param containerId
   * @returns
   */
  getBlockAclMap(containerId: ContainerID) {
    // Get the block map
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }

    // Get the ACL
    const aclMap = blockMap.getOrCreateContainer(
      'acls',
      new LoroMap(),
    ) as AclLoroMap;
    if (!aclMap) {
      throw new Error(`Could not find ACL map for container ID ${containerId}`);
    }
    return aclMap.toJSON();
  }

  /**
   * Update the block ACL map for a given id
   * @param containerId
   * @param newAcls
   */
  patchBlockAclMap(
    containerId: ContainerID,
    newAcls: Record<Permission, string[]>,
  ) {
    // Get the block map
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }

    // Get the ACL
    const aclMap = blockMap.getOrCreateContainer(
      'acls',
      new LoroMap(),
    ) as AclLoroMap;
    if (!aclMap) {
      throw new Error(`Could not find ACL map for container ID ${containerId}`);
    }
    this.patchAclMap(aclMap, newAcls);
  }

  /**
   * Check if the user has approve permission for the block
   * @param containerId
   * @returns
   */
  hasApprovePermission(containerId: ContainerID): boolean {
    // Check if the user has global edit permission
    const aclMap = this.getDocAclMap();
    for (const prpl of this.authPrpls) {
      const editPrpls = aclMap[Permission.Approve] || [];
      if (editPrpls.includes(prpl)) {
        return true;
      }
    }

    // Check if the user has edit permission on the element
    const elementAclMap = this.getBlockAclMap(containerId);
    for (const prpl of this.authPrpls) {
      const editPrpls = elementAclMap[Permission.Approve] || [];
      if (editPrpls.includes(prpl)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Approve the block
   * @param containerId
   */
  approveBlock(containerId: ContainerID, approvalKey: string): boolean {
    // Double check whether the user can approve
    if (!this.hasApprovePermission(containerId)) {
      console.warn('User cannot approve this block: ' + containerId);
      return false;
    }

    // Get the block map
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetTextBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }

    let blockApprovalMap = blockMap.get('approvals');
    if (!blockApprovalMap) {
      blockApprovalMap = blockMap.getOrCreateContainer(
        'approvals',
        new LoroMap<Record<string, UserApprovalLoro>>(),
      );
    }

    // Target the specified appoval
    let approval = blockApprovalMap.get(approvalKey);
    // If it doesn't exist, create it
    if (!approval) {
      approval = blockApprovalMap.getOrCreateContainer(
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
   * Reject the block
   * @param containerId
   * @param approvalKey
   */
  rejectBlock(containerId: ContainerID, approvalKey: string): boolean {
    // Check permissions
    if (!this.hasApprovePermission(containerId)) {
      console.warn('User cannot reject this block: ' + containerId);
      return false;
    }

    // Get the block map
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetTextBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }

    let blockApprovalMap = blockMap.get('approvals');
    if (!blockApprovalMap) {
      blockApprovalMap = blockMap.getOrCreateContainer(
        'approvals',
        new LoroMap<Record<string, UserApprovalLoro>>(),
      );
    }

    // Target the specified appoval
    let approval = blockApprovalMap.get(approvalKey);
    // If it doesn't exist, create it
    if (!approval) {
      approval = blockApprovalMap.getOrCreateContainer(
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
   * Revert the block approval to draft
   * @param containerId
   */
  revertBlockToDraft(containerId: ContainerID): boolean {
    // Check permissions
    if (
      !this.hasApprovePermission(containerId) &&
      !this.hasManagePermission()
    ) {
      console.warn(
        'User cannot revert approval for this block: ' + containerId,
      );
      return false;
    }

    // Get the block map
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetTextBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }

    const blockApprovalMap = blockMap.get('approvals');
    if (!blockApprovalMap) {
      return false;
    }

    // Clear all approvals
    blockApprovalMap.clear();
    return true;
  }

  /**
   * Returns true if the specified approval is rejected.
   *
   * @param containerId
   * @param approvalKey
   * @returns
   */
  hasRejectedBlockApproval(
    containerId: ContainerID,
    approvalKey: string,
  ): boolean {
    // Get the block map
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetTextBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }
    const blockApprovalMap = blockMap.get('approvals');
    if (!blockApprovalMap) {
      return false;
    }
    // Target the specified appoval
    const approval = blockApprovalMap.get(approvalKey);
    if (!approval) {
      return false;
    }
    return approval.get('state') === ColabApprovalState.Rejected;
  }

  /**
   * Get the position of the content container in the content list
   *
   * @param containerId
   * @returns
   */
  getContentListPosition(containerId: ContainerID): number {
    const contentList = this.loroDoc.getMovableList('content');
    for (let i = 0; i < contentList.length; i++) {
      const container = contentList.get(i);
      if (container instanceof LoroMap && container.id === containerId) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Add a new block to the document
   *
   * @param ColabSheetBlockType
   * @param position
   */
  addBlock(
    ColabSheetBlockType: ColabSheetBlockType,
    position?: number,
  ): ContainerID {
    const contentList = this.loroDoc.getMovableList('content');

    // Ensure position is valid
    if (
      position === undefined ||
      position < 0 ||
      position > contentList.length
    ) {
      position = contentList.length;
    } else {
      position = position + 1;
    }

    // Create the block based on type
    if (ColabSheetBlockType === 'text') {
      const blockMap = contentList.insertContainer(
        position,
        new LoroMap(),
      ) as SheetTextBlockLoro;

      // Initialize the block
      blockMap.set('type', 'text' as ColabSheetBlockType);
      blockMap.setContainer('acls', new LoroMap());
      blockMap.setContainer('approvals', new LoroMap());

      // Set the text element
      // Create the textElement
      const textElementMap = blockMap.getOrCreateContainer(
        'textElement',
        new LoroMap(),
      );
      textElementMap.set('nodeName', 'doc');

      return blockMap.id;
    }
    if (ColabSheetBlockType === 'statement-grid') {
      const blockMap = contentList.insertContainer(
        position,
        new LoroMap(),
      ) as SheetStatementGridBlockLoro;

      // Initialize the block
      blockMap.set('type', 'statement-grid' as ColabSheetBlockType);
      blockMap.setContainer('acls', new LoroMap());
      blockMap.setContainer('rows', new LoroMap());

      return blockMap.id;
    }
    // Unsupported block type
    else {
      throw new Error(`Unsupported block type: ${ColabSheetBlockType}`);
    }
  }

  /**
   * Remove a block from the document
   *
   * @param containerId
   * @returns
   */
  removeBlock(containerId: ContainerID): boolean {
    // Get the position of the container
    const position = this.getContentListPosition(containerId);
    if (position === -1) {
      console.warn(`Could not find block with container ID: ${containerId}`);
      return false;
    }

    // Delete the container
    const contentList = this.loroDoc.getMovableList('content');
    contentList.delete(position, 1);
    return true;
  }

  /**
   * Shift a block up or down in the document
   *
   * @param containerId
   * @param direction
   * @returns
   */
  shiftBlock(containerId: ContainerID, direction: 'up' | 'down'): boolean {

    // Get the position of the container
    const position = this.getContentListPosition(containerId);

    const contentList = this.loroDoc.getMovableList('content');

    let newPosition = -1;
    if (direction === 'up') {
      newPosition = position - 1;
      if (newPosition < 0) {
        return false;
      }
    } else {
      newPosition = position + 1;
      if (newPosition >= contentList.length) {
        return false;
      }
    }

    // Move the container
    contentList.move(position, newPosition);
    return true;
  }

  /**
   * Subscribe to ACL changes for the statement element.
   *
   * @param langCode
   * @param callback
   * @returns
   */
  subscribeToBlockAclChanges(
    containerId: ContainerID,
    callback: (event: LoroEventBatch) => void,
  ) {
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      const blockPath = this.loroDoc.getPathToContainer(containerId);
      if (!blockPath) {
        throw new Error(`Could not find block for container ID ${containerId}`);
      }

      for (const ev of event.events) {
        if (
          pathStartsWith(ev.path, ['acls']) ||
          pathStartsWith(ev.path, [...blockPath, 'acls'])
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
  subscribeToBlockApprovalChanges(
    containerId: ContainerID,
    callback: (event: LoroEventBatch) => void,
  ) {
    return this.loroDoc.subscribe((event: LoroEventBatch) => {
      const blockPath = this.loroDoc.getPathToContainer(containerId);
      if (!blockPath) {
        // Probably because the block container was deleted
        return;
      }

      for (const ev of event.events) {
        if (pathStartsWith(ev.path, [...blockPath, 'approvals'])) {
          callback(event);
          break;
        }
      }
    });
  }
}

export default SheetDocController;
