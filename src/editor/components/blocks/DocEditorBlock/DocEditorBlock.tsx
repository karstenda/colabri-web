import { useEffect, useRef, useState } from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSetActiveBlock } from '../../../context/ColabDocEditorContext/ColabDocEditorProvider';
import DocEditorBlockControls, {
  DocEditorBlockControl,
} from './DocEditorBlockControls';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import { ContainerID, LoroDoc } from 'loro-crdt';
import ColabDocController from '../../../controllers/ColabDocController';
import { ColabLoroDoc } from '../../../data/ColabDoc';
import { StyledDocEditorBlock } from './DocEditorBlockStyles';

export type DocEditorBlockProps = BoxProps & {
  blockId: string;
  blockType: string;
  loroContainerId?: ContainerID;
  loroDoc?: LoroDoc;
  controller?: ColabDocController<ColabLoroDoc>;
  readOnly?: boolean;
  onFocusChange?: (hasFocus: boolean) => void;
  onHoverChange?: (isHovered: boolean) => void;
  showUpDownControls?: boolean;
  showManageControls?: boolean;
  onManageBlock?: () => void;
};

const DocEditorBlock = ({
  children,
  blockId,
  blockType,
  loroContainerId,
  loroDoc,
  controller,
  readOnly = false,
  onFocusChange,
  onHoverChange,
  showUpDownControls = true,
  showManageControls = true,
  onManageBlock,
  ...boxProps
}: DocEditorBlockProps) => {
  // The reference to the EditorContentBlock element
  const editorContentBlockRef = useRef<HTMLDivElement | null>(null);

  // State to track focus
  const [focus, setFocus] = useState(false);

  // State to track hover
  const [isHovered, setIsHovered] = useState(false);

  // Set the active block ID when this block gains focus
  const setActiveBlockId = useSetActiveBlock();

  // State to track whether the user can manage or add/remove languages
  const [canManage, setCanManage] = useState<boolean>(false);
  const [canAddRemove, setCanAddRemove] = useState<boolean>(false);

  const controls = [] as DocEditorBlockControl[];
  if (showUpDownControls && canAddRemove) {
    controls.push({
      id: `move-up-block-${blockId}`,
      label: 'Move Up',
      icon: <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />,
      onClick: () => {
        /* Implement move up logic here */
      },
    });
  }
  if (showManageControls && canManage) {
    controls.push({
      id: `manage-block-${blockId}`,
      label: 'Manage',
      icon: <SettingsIcon sx={{ fontSize: 16 }} />,
      onClick: onManageBlock || (() => {}),
    });
  }
  if (showUpDownControls && canAddRemove) {
    controls.push({
      id: `move-down-block-${blockId}`,
      label: 'Move Down',
      icon: <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />,
      onClick: () => {
        /* Implement move down logic here */
      },
    });
  }

  // The loaded
  useEffect(() => {
    if (!loroDoc || !controller) {
      return;
    }

    // Initial check if the user can manage and add/remove the document
    setCanManage(controller.hasManagePermission());
    setCanAddRemove(controller.hasAddRemovePermission());

    // Subscribe to ACL changes in the LoroDoc
    return controller.subscribeToDocAclChanges(() => {
      // On any ACL change, update the canEdit state
      setCanManage(controller.hasManagePermission());
      setCanAddRemove(controller.hasAddRemovePermission());
    });
  }, [loroDoc, controller]);

  // Track focus state with click events
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!editorContentBlockRef.current) return;

      const isClickInside = editorContentBlockRef.current.contains(
        event.target as Node,
      );

      if (isClickInside && !focus) {
        setFocus(true);
        setActiveBlockId({ id: blockId, blockType, loroContainerId, loroDoc });
        onFocusChange?.(true);
      } else if (!isClickInside && focus) {
        setFocus(false);
        setActiveBlockId(null);
        onFocusChange?.(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [focus, blockId, setActiveBlockId, onFocusChange]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  return (
    <StyledDocEditorBlock
      ref={editorContentBlockRef}
      hasFocus={focus}
      isHovered={isHovered}
      readOnly={readOnly}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...boxProps}
    >
      <DocEditorBlockControls controls={controls} show={focus} />
      {children}
    </StyledDocEditorBlock>
  );
};

export default DocEditorBlock;
