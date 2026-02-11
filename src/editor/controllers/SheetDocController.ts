import {
  ContainerID,
  Loro,
  LoroEventBatch,
  LoroList,
  LoroMap,
  LoroMovableList,
} from 'loro-crdt';
import {
  AclLoroMap,
  SheetAttributesBlockLoro,
  SheetBlockLoro,
  SheetLoroDoc,
  SheetPropertiesBlockLoro,
  SheetStatementGridBlockLoro,
  SheetStatementGridRowLoro,
  SheetTextBlockLoro,
  StmtDocSchema,
  StmtElementLoro,
  StmtLoroDoc,
  StmtRefSchema,
  TextElementLoro,
  UserApprovalLoro,
} from '../data/ColabLoroDoc';
import { Permission } from '../../ui/data/Permission';
import ColabDocController from './ColabDocController';
import { pathEquals, pathStartsWith } from '../util/LoroPathUtil';
import {
  ColabSheetTextBlock,
  ColabSheetStatementGridBlock,
  ColabApprovalState,
  ColabSheetBlockType,
  ColabApprovalType,
  StatementGridRowType,
  StatementDocument,
} from '../../api/ColabriAPI';
import StatementLocalController from './StatementLocalController';

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
   * Based on a row container ID, get the local statement container ID
   * @param rowContainerId
   * @returns
   */
  getLocalStmtContainerId(rowContainerId: ContainerID): ContainerID {
    const rowMap = this.loroDoc.getContainerById(
      rowContainerId,
    ) as SheetStatementGridRowLoro;
    if (!rowMap) {
      throw new Error(
        `Could not find row map for container ID ${rowContainerId}`,
      );
    }

    // Verify it's a local statement row
    if (rowMap.get('type') !== StatementGridRowType.StatementGridRowTypeLocal) {
      throw new Error(
        `Row container ID ${rowContainerId} is not a local statement`,
      );
    }

    // Get the statement map
    const stmtMap = rowMap.get('statement');
    if (!stmtMap) {
      throw new Error(
        `Could not find statement map for row container ID ${rowContainerId}`,
      );
    }
    return stmtMap.id;
  }

  /**
   * Get an embedded statement controller for an embedded statement in a given row container ID
   * @param containerId
   * @returns
   */
  getLocalStatementController(
    containerId: ContainerID,
  ): StatementLocalController {
    const stmtRootMap = this.loroDoc.getContainerById(
      containerId,
    ) as LoroMap<StmtDocSchema>;
    if (!stmtRootMap) {
      throw new Error(
        `Could not find statement map for container ID ${containerId}`,
      );
    }

    // Try to figure out which block this statement belongs to
    const blockMap = stmtRootMap.parent()?.parent()?.parent() as SheetBlockLoro;
    if (blockMap === undefined || !(blockMap instanceof LoroMap)) {
      throw new Error("Could not find parent block for statement's row");
    }

    return new StatementLocalController(
      this.loroDoc,
      this,
      blockMap.id,
      stmtRootMap,
      this.orgId,
      this.owner,
      this.userId,
      this.authPrpls,
    );
  }

  /**
   * Get the blocks of a given type in the document
   *
   * @param type
   * @returns
   */
  public getBlocksOfType(type: ColabSheetBlockType): ContainerID[] {
    const contentList = this.loroDoc.getMovableList('content');
    const blockIds: ContainerID[] = [];
    for (let i = 0; i < contentList.length; i++) {
      const container = contentList.get(i);
      if (container instanceof LoroMap) {
        const blockType = container.get('type');
        if (blockType === type) {
          blockIds.push(container.id);
        }
      }
    }
    return blockIds;
  }

  /**
   * Get the referenced statement
   *
   * @param rowContainerId
   */
  public getStatementReference(rowContainerId: ContainerID): {
    docId: string;
    version: number | undefined;
    versionV: Record<string, number> | undefined;
  } {
    const rowMap = this.loroDoc.getContainerById(
      rowContainerId,
    ) as SheetStatementGridRowLoro;
    if (!rowMap) {
      throw new Error(
        `Could not find row map for container ID ${rowContainerId}`,
      );
    }

    const rowType = rowMap.get('type');
    if (rowType !== StatementGridRowType.StatementGridRowTypeReference) {
      throw new Error(
        `Row container ID ${rowContainerId} is not a statement reference`,
      );
    }

    const stmtRefMap = rowMap.get('statementRef');
    if (!stmtRefMap) {
      throw new Error(
        `Could not find statement reference map for row container ID ${rowContainerId}`,
      );
    }

    const docId = stmtRefMap.get('docId');
    const version = stmtRefMap.get('version');
    const versionVStr = stmtRefMap.get('versionV');

    // Parse the version vector string into a Record<string, number>
    let versionV: Record<string, number> | undefined = undefined;
    if (versionVStr) {
      versionV = JSON.parse(versionVStr) as Record<string, number>;
    }

    return {
      docId,
      version,
      versionV,
    };
  }

  /**
   * Whether all approvals have been done on the document
   */
  public isFullyApproved(): boolean {
    // Iterate over all blocks to see if any are not approved
    const contentList = this.loroDoc.getMovableList('content');
    for (let i = 0; i < contentList.length; i++) {
      const container = contentList.get(i);

      // Get the block type
      const type = container.get('type');

      // If it's a text block, check approval state
      if (type === ColabSheetBlockType.ColabSheetBlockTypeText) {
        const state = this.getBlockState(container.id);
        if (state !== ColabApprovalState.Approved) {
          return false;
        }
      }
      // If it's a statement grid block, check all statements inside
      else if (type === ColabSheetBlockType.ColabSheetBlockTypeStatementGrid) {
        const stmtGridBlock = container as SheetStatementGridBlockLoro;
        const rowsList = stmtGridBlock.get(
          'rows',
        ) as LoroMovableList<SheetStatementGridRowLoro>;

        // Iterate over all rows
        for (let j = 0; j < rowsList.length; j++) {
          const rowMap = rowsList.get(j) as SheetStatementGridRowLoro;
          const rowType = rowMap.get('type');

          // If it's a local statement, check its approval state
          if (rowType === StatementGridRowType.StatementGridRowTypeLocal) {
            const stmtMap = rowMap.get('statement');
            if (stmtMap) {
              // Create a local statement controller
              const stmtController = this.getLocalStatementController(
                stmtMap.id,
              );
              if (!stmtController.isFullyApproved()) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
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
   * Wether the user has edit permission for the block
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
   * Wether the user has manage permission for the block
   * @param containerId
   */
  hasManageBlockPermission(containerId: ContainerID): boolean {
    // Check if the user has global manage permission
    const canDocManage = this.hasManagePermission();
    if (canDocManage) {
      return true;
    }

    // Check if the user has manage permission on the element
    const elementAclMap = this.getBlockAclMap(containerId);
    for (const prpl of this.authPrpls) {
      const managePrpls = elementAclMap[Permission.Manage] || [];
      if (managePrpls.includes(prpl)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Wether the user has add/remove permission on the block
   * @param containerId
   */
  hasAddRemoveToBlockPermission(containerId: ContainerID): boolean {
    // Check if the user has global manage permission
    const canDocManage = this.hasManagePermission();
    if (canDocManage) {
      return true;
    }
    const canDocAddRemove = this.hasAddRemovePermission();
    if (canDocAddRemove) {
      return true;
    }

    // Check if the user has manage permission on the element
    const elementAclMap = this.getBlockAclMap(containerId);
    for (const prpl of this.authPrpls) {
      const managePrpls = elementAclMap[Permission.Manage] || [];
      if (managePrpls.includes(prpl)) {
        return true;
      }
    }
    // Check if the user has add/remove permission on the element
    for (const prpl of this.authPrpls) {
      const addRemovePrpls = elementAclMap[Permission.AddRemove] || [];
      if (addRemovePrpls.includes(prpl)) {
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
    // Check permissions
    if (!this.hasManageBlockPermission(containerId)) {
      console.warn(
        'User does not have permission to manage block ACLs: ' + containerId,
      );
      return;
    }

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
      approval.set('type', ColabApprovalType.ColabApprovalTypeUser);
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
      approval.set('type', ColabApprovalType.ColabApprovalTypeUser);
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
      approval.set('type', ColabApprovalType.ColabApprovalTypeUser);
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
      approval.set('type', ColabApprovalType.ColabApprovalTypeUser);
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

      // Set the title element
      const titleElementMap = blockMap.getOrCreateContainer(
        'title',
        new LoroMap(),
      );
      titleElementMap.set('nodeName', 'doc');

      // Set the text element
      const textElementMap = blockMap.getOrCreateContainer(
        'textElement',
        new LoroMap(),
      );
      textElementMap.set('nodeName', 'doc');

      return blockMap.id;
    }
    // Statement grid block
    else if (ColabSheetBlockType === 'statement-grid') {
      const blockMap = contentList.insertContainer(
        position,
        new LoroMap(),
      ) as SheetStatementGridBlockLoro;

      // Initialize the block
      blockMap.set('type', 'statement-grid' as ColabSheetBlockType);
      blockMap.setContainer('acls', new LoroMap());
      blockMap.setContainer('rows', new LoroMovableList());

      // Set the title element
      const titleElementMap = blockMap.getOrCreateContainer(
        'title',
        new LoroMap(),
      );
      titleElementMap.set('nodeName', 'doc');

      return blockMap.id;
    }
    // Properties block
    else if (ColabSheetBlockType === 'properties') {
      // First ensure that there isn't already a properties block in the document, since we only allow one
      const contentList = this.loroDoc.getMovableList('content');
      for (let i = 0; i < contentList.length; i++) {
        const container = contentList.get(i);
        if (container instanceof LoroMap) {
          const type = container.get('type');
          if (type === 'properties') {
            throw new Error(
              'There is already a properties block in the document. Only one is allowed.',
            );
          }
        }
      }

      // Insert the block
      const blockMap = contentList.insertContainer(
        position,
        new LoroMap(),
      ) as SheetPropertiesBlockLoro;

      // Initialize the block
      blockMap.set('type', 'properties' as ColabSheetBlockType);

      return blockMap.id;
    }
    // Attributes block
    else if (ColabSheetBlockType === 'attributes') {
      // Insert the block
      const blockMap = contentList.insertContainer(
        position,
        new LoroMap(),
      ) as SheetAttributesBlockLoro;

      // Initialize the block
      blockMap.set('type', 'attributes' as ColabSheetBlockType);
      blockMap.setContainer('acls', new LoroMap());
      blockMap.setContainer('attributes', new LoroMap());
      blockMap.set('config', {});

      // Set the title element
      const titleElementMap = blockMap.getOrCreateContainer(
        'title',
        new LoroMap(),
      );
      titleElementMap.set('nodeName', 'doc');

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
   * Add a new statement to the statement grid block
   *
   * @param containerId
   * @param newStatementData
   * @returns
   */
  addStatementToStatementGridBlock(
    containerId: ContainerID,
    type: 'live-reference' | 'frozen-reference' | 'new',
    newStatementData: {
      statements?: StatementDocument[];
      contentType?: string;
      langCodes?: string[];
    },
    position?: number,
  ): boolean {
    // Validate the new statement data
    if (
      type === 'new' &&
      (newStatementData.contentType === undefined ||
        newStatementData.langCodes === undefined)
    ) {
      console.warn(
        'Invalid new statement data provided, when creating new statements',
      );
      return false;
    }
    if (
      (type === 'frozen-reference' || type === 'live-reference') &&
      newStatementData.statements === undefined
    ) {
      console.warn(
        'Invalid new statement data provided, when referencing statements',
      );
      return false;
    }

    // Get the statement grid block
    const blockMap = this.loroDoc.getContainerById(
      containerId,
    ) as SheetStatementGridBlockLoro;
    if (!blockMap) {
      throw new Error(`Could not find block for container ID ${containerId}`);
    }

    // Get the rows list
    const rowList = blockMap.get('rows');
    if (!rowList) {
      throw new Error(
        `Could not find rows list for statement grid block ${containerId}`,
      );
    }

    // Ensure position is valid
    if (position === undefined || position < 0 || position > rowList.length) {
      position = rowList.length;
    } else {
      position = position + 1;
    }

    if (type === 'frozen-reference') {
      // Insert each referenced statement
      for (const stmtDoc of newStatementData.statements!) {
        // Figure out the statement version to reference
        let version = 0;
        for (const streamKey of Object.keys(stmtDoc.streams)) {
          if (streamKey !== 'main') {
            continue;
          }
          const mainStream = stmtDoc.streams[streamKey];
          version = Math.max(version, mainStream.version);
        }

        // Create the statement as a loro map
        const statementRefMap = new LoroMap<StmtRefSchema>();
        statementRefMap.set('docId', stmtDoc.id);
        statementRefMap.set('version', version);
        statementRefMap.set('versionV', JSON.stringify(stmtDoc.versionV));

        // Insert the statement map into a new row
        const rowMap: SheetStatementGridRowLoro = new LoroMap();
        rowMap.setContainer('statementRef', statementRefMap);
        rowMap.set('type', StatementGridRowType.StatementGridRowTypeReference);

        // Insert the row into the list
        rowList.insertContainer(position, rowMap);
      }
      return true;
    } else if (type === 'live-reference') {
      // Insert each referenced statement
      for (const stmtDoc of newStatementData.statements!) {
        // Create the statement as a loro map
        const statementRefMap = new LoroMap<StmtRefSchema>();
        statementRefMap.set('docId', stmtDoc.id);

        // Insert the statement map into a new row
        const rowMap: SheetStatementGridRowLoro = new LoroMap();
        rowMap.setContainer('statementRef', statementRefMap);
        rowMap.set('type', StatementGridRowType.StatementGridRowTypeReference);

        // Insert the row into the list
        rowList.insertContainer(position, rowMap);
      }
      return true;
    }
    // When we need to create a new statement
    else if (type === 'new') {
      // Get the statement map
      const statementMap = this.getStatementMap(
        newStatementData.contentType!,
        newStatementData.langCodes!,
      );

      // Insert the statement map into a new row
      const rowMap: SheetStatementGridRowLoro = new LoroMap();
      rowMap.setContainer('statement', statementMap);
      rowMap.set('type', StatementGridRowType.StatementGridRowTypeLocal);

      // Insert the row into the list
      rowList.insertContainer(position, rowMap);
      return true;
    }
    return false;
  }

  /**
   * Helper function to create a statement map from new statement data
   * @param newStatementData
   */
  private getStatementMap(
    contentType: string,
    langCodes: string[],
  ): LoroMap<StmtDocSchema> {
    // Create the statement as a loro map
    const statementMap = new LoroMap<StmtDocSchema>();

    // Set properties
    const stmtPropertiesMap = statementMap.getOrCreateContainer(
      'properties',
      new LoroMap(),
    );
    stmtPropertiesMap.set('type', 'colab-statement');
    stmtPropertiesMap.set('contentType', contentType);

    // Set type and content type
    const stmtDocAclsMap = statementMap.getOrCreateContainer(
      'acls',
      new LoroMap(),
    );

    // Set the content map
    const stmtDocContentMap = statementMap.getOrCreateContainer(
      'content',
      new LoroMap(),
    );

    // Iterate over the languages and create empty content for each
    for (const langCode of langCodes) {
      const langElementMap: StmtElementLoro =
        stmtDocContentMap.getOrCreateContainer(langCode, new LoroMap());

      langElementMap.getOrCreateContainer('acls', new LoroMap());

      langElementMap.getOrCreateContainer('approvals', new LoroMap());

      const textElementMap: TextElementLoro =
        langElementMap.getOrCreateContainer('textElement', new LoroMap());

      textElementMap.set('nodeName', 'doc');
    }

    return statementMap;
  }

  /**
   * Remove a statement from the statement grid block
   *
   * @param blockContainerId
   * @param stmtRowContainerId
   */
  removeStatementFromStatementGridBlock(
    blockContainerId: ContainerID,
    stmtRowContainerId: ContainerID,
  ): boolean {
    // Get the statement grid block
    const blockMap = this.loroDoc.getContainerById(
      blockContainerId,
    ) as SheetStatementGridBlockLoro;
    if (!blockMap) {
      throw new Error(
        `Could not find block for container ID ${blockContainerId}`,
      );
    }

    // Get the rows list
    const rowList = blockMap.get('rows');
    if (!rowList) {
      throw new Error(
        `Could not find rows list for statement grid block ${blockContainerId}`,
      );
    }

    // Find the position of the statement row
    let position = -1;
    for (let i = 0; i < rowList.length; i++) {
      const row = rowList.get(i);
      if (row instanceof LoroMap && row.id === stmtRowContainerId) {
        position = i;
        break;
      }
    }

    if (position === -1) {
      console.warn(
        `Could not find statement row with container ID: ${stmtRowContainerId}`,
      );
      return false;
    }

    // Delete the statement row
    rowList.delete(position, 1);
    return true;
  }

  /**
   * Subscribe to row list changes for the statement grid block.
   *
   * @param containerId
   * @param callback
   * @returns
   */
  subscribeToRowListChanges(
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
        if (pathEquals(ev.path, [...blockPath, 'rows'])) {
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
  subscribeToBlockAclChanges(
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
