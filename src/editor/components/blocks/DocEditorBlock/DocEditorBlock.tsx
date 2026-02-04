import { useEffect, useRef, useState } from 'react';
import { BoxProps } from '@mui/material';
import { useSetActiveBlock } from '../../../context/ColabDocEditorContext/ColabDocEditorProvider';
import DocEditorBlockControls, {
  DocEditorBlockControl,
} from './DocEditorBlockControls';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import { ContainerID, LoroDoc } from 'loro-crdt';
import { StyledDocEditorBlock } from './DocEditorBlockStyles';
import {
  ConnectedSheetDoc,
  ConnectedStmtDoc,
} from '../../../data/ConnectedColabDoc';

export type DocEditorBlockProps = BoxProps & {
  blockId: string;
  blockType: string;
  loroContainerId: ContainerID;
  colabDoc: ConnectedSheetDoc | ConnectedStmtDoc;
  editable: boolean;
  readOnly?: boolean;
  showUpDownControls?: boolean;
  showManageControls?: boolean;
  displayMode?: 'default' | 'wide';
  onFocusChange?: (hasFocus: boolean) => void;
  onHoverChange?: (isHovered: boolean) => void;
  onManageBlock?: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
};

const DocEditorBlock = ({
  children,
  blockId,
  blockType,
  loroContainerId,
  colabDoc,
  editable,
  readOnly,
  showUpDownControls = true,
  showManageControls = true,
  displayMode = 'default',
  onFocusChange,
  onHoverChange,
  onManageBlock,
  onMoveDown,
  onMoveUp,
  ...boxProps
}: DocEditorBlockProps) => {
  // The reference to the EditorContentBlock element
  const editorContentBlockRef = useRef<HTMLDivElement | null>(null);

  // State to track focus
  const [focus, setFocus] = useState(false);

  // Ref to track current focus value for event handlers (avoids stale closure)
  const focusRef = useRef(focus);
  focusRef.current = focus;

  // Refs for callback props to avoid stale closures and effect re-runs
  const onFocusChangeRef = useRef(onFocusChange);
  onFocusChangeRef.current = onFocusChange;
  const onHoverChangeRef = useRef(onHoverChange);
  onHoverChangeRef.current = onHoverChange;

  // State to track hover
  const [isHovered, setIsHovered] = useState(false);

  // Set the active block ID when this block gains focus
  const setActiveBlockId = useSetActiveBlock();

  // State to track whether the user can manage or add/remove languages
  const [canManage, setCanManage] = useState<boolean>(false);
  const [canAddRemove, setCanAddRemove] = useState<boolean>(false);

  // Get the LoroDoc and controller
  const loroDoc = colabDoc.getLoroDoc();
  const controller = colabDoc.getDocController();

  const controls = [] as DocEditorBlockControl[];
  if (showUpDownControls && canAddRemove) {
    controls.push({
      id: `move-up-block-${blockId}`,
      label: 'Move Up',
      icon: <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />,
      onClick: onMoveUp || (() => {}),
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
      onClick: onMoveDown || (() => {}),
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
      // Return early if ref isn't set yet (component not fully mounted)
      if (!editorContentBlockRef.current) {
        return;
      }

      // Check if the EditorBackground was clicked
      const isClickOnBackground = (
        event.target as HTMLElement
      ).classList.contains('EditorBackground');
      if (isClickOnBackground) {
        // Clicked on background, so remove focus
        setFocus(false);
        setActiveBlockId(null);
        onFocusChangeRef.current?.(false);
        return;
      }

      // Check if a DocEditorBlock was clicked
      const isClickInsideDocEditorBlock =
        (event.target as HTMLElement).closest('.DocEditorBlock') !== null;

      // If so ... was it this block?
      if (isClickInsideDocEditorBlock) {
        const isClickInside = editorContentBlockRef.current.contains(
          event.target as Node,
        );

        // Update the state accordingly (use ref to get current focus value)
        if (isClickInside && !focusRef.current) {
          setFocus(true);
          setActiveBlockId({
            id: blockId,
            blockType,
            loroContainerId,
            colabDoc,
          });
          onFocusChangeRef.current?.(true);
        } else if (!isClickInside && focusRef.current) {
          setFocus(false);
          onFocusChangeRef.current?.(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClick, true);

    return () => {
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, [blockId, blockType, loroContainerId, colabDoc, setActiveBlockId]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChangeRef.current?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChangeRef.current?.(false);
  };

  return (
    <StyledDocEditorBlock
      className="DocEditorBlock"
      ref={editorContentBlockRef}
      hasFocus={focus}
      isHovered={isHovered}
      editable={editable && !readOnly}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...boxProps}
      sx={{
        maxWidth: displayMode === 'wide' ? '100%' : '800px',
        ...boxProps.sx,
      }}
    >
      <DocEditorBlockControls controls={controls} show={focus} />
      {children}
    </StyledDocEditorBlock>
  );
};

export default DocEditorBlock;
