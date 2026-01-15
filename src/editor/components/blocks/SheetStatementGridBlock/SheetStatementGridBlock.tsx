import { SheetStatementGridBlockBP } from './SheetStatementGridBlockBP';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import StatementGridEditor from './StatementGridEditor';
import { ConnectedSheetDoc } from '../../../data/ConnectedColabDoc';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { SheetStatementGridBlockLoro } from '../../../data/ColabDoc';
import DocEditorBlock from '../DocEditorBlock';

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

  // Get the rows LoroList
  const stmtGridRowLoroList = container.get('rows');

  // Create state for canEdit and canManage
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [canManage, setCanManage] = useState<boolean>(false);

  // Create state for hover and focus
  const [focus, setFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (controller && bp.containerId && loroDoc) {
      // Update the canEdit state
      setCanEdit(controller.canEditBlock(bp.containerId));

      // Subscribe to ACL changes in the loroDoc
      const aclUnsubscribe = controller.subscribeToBlockAclChanges(
        bp.containerId,
        () => {
          // On any ACL change, update the canEdit state
          setCanEdit(controller.canEditBlock(bp.containerId));
          setCanManage(controller.hasManagePermission());
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
    setFocus(hasFocus);
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  // Handle manage element
  const handleManageElement = () => {};

  return (
    <DocEditorBlock
      blockId={bp.id}
      blockType={'SheetStatementGridBlock'}
      loroContainerId={bp.containerId}
      loroDoc={loroDoc}
      controller={controller}
      onFocusChange={handleFocusChange}
      onHoverChange={handleHoverChange}
      showUpDownControls={true}
      onManageBlock={handleManageElement}
      readOnly={!canEdit}
      sx={{ padding: '0px' }}
    >
      <StatementGridEditor stmtGridRowLoroList={stmtGridRowLoroList} />
    </DocEditorBlock>
  );
};

export default SheetStatementGridBlock;
