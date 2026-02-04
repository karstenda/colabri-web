import { SheetStatementGridBlockBP } from './SheetStatementGridBlockBP';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import StatementGridEditor from '../../StatementGridEditor/StatementGridEditor';
import { ConnectedSheetDoc } from '../../../data/ConnectedColabDoc';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { SheetStatementGridBlockLoro } from '../../../data/ColabDoc';
import DocEditorSheetBlock from '../DocEditorBlock/DocEditorSheetBlock';

export type SheetStatementGridBlockProps = {
  bp: SheetStatementGridBlockBP;
};

const SheetStatementGridBlock: React.FC<SheetStatementGridBlockProps> = ({
  bp,
}) => {
  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedSheetDoc)) {
    throw new Error(
      'SheetStatementGridBlock can only be used with connected sheet docs.',
    );
  }

  // Get standard hooks
  const { t } = useTranslation();

  // Get the LoroDoc
  const loroDoc = colabDoc?.getLoroDoc();

  // Get the controller
  const controller = colabDoc?.getDocController();

  // Get the appropriate container for the block
  const container = loroDoc.getContainerById(
    bp.containerId,
  ) as SheetStatementGridBlockLoro;
  if (!container) {
    throw new Error(
      `Container with id ${bp.containerId} not found in LoroDoc.`,
    );
  }

  // Create state for canEdit and canManage
  const [canAdd, setCanAdd] = useState<boolean>(false);
  const [canManage, setCanManage] = useState<boolean>(false);

  // State to track focus and hover
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showWide, setShowWide] = useState<boolean>(false);

  useEffect(() => {
    if (controller && bp.containerId && loroDoc) {
      // Update the state
      setCanManage(controller.hasManageBlockPermission(bp.containerId));
      setCanAdd(controller.hasAddRemoveToBlockPermission(bp.containerId));

      // Subscribe to ACL changes in the loroDoc
      const aclUnsubscribe = controller.subscribeToBlockAclChanges(
        bp.containerId,
        () => {
          // On any ACL change, update the canEdit state
          setCanManage(controller.hasManageBlockPermission(bp.containerId));
          setCanAdd(controller.hasAddRemoveToBlockPermission(bp.containerId));
        },
      );

      // Cleanup subscriptions on unmount
      return () => {
        aclUnsubscribe();
      };
    }
  }, [loroDoc, controller, bp.containerId]);

  // Handle focus change from DocEditorBlock
  const handleFocusChange = (hasFocus: boolean) => {
    setIsFocused(hasFocus);
    if (hasFocus) {
      setShowWide(true);
    } else {
      setShowWide(false);
    }
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  return (
    <DocEditorSheetBlock
      blockId={bp.id}
      blockType={'SheetStatementGridBlock'}
      loroContainerId={bp.containerId}
      colabDoc={colabDoc}
      onFocusChange={handleFocusChange}
      onHoverChange={handleHoverChange}
      editable={canManage || canAdd}
      readOnly={bp.readOnly}
      sx={{ padding: '0px' }}
      displayMode={showWide ? 'wide' : 'default'}
    >
      <StatementGridEditor
        containerId={bp.containerId}
        isHovered={isHovered}
        isFocused={isFocused}
        readOnly={bp.readOnly}
      />
    </DocEditorSheetBlock>
  );
};

export default SheetStatementGridBlock;
