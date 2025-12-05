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

const StyledDocEditorBlock = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasFocus' && prop !== 'isHovered',
})<{ hasFocus?: boolean; isHovered?: boolean }>(({ theme, hasFocus }) => ({
  backgroundColor: (theme.vars || theme).palette.background.default,
  border: `1px solid ${
    hasFocus ? theme.palette.primary.main : theme.palette.divider
  }`,
  padding: theme.spacing(2),
  borderRadius: '6px',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
}));

export type DocEditorBlockProps = BoxProps & {
  blockId: string;
  blockType: string;
  loroContainerId?: ContainerID;
  loroDoc?: LoroDoc;
  onFocusChange?: (hasFocus: boolean) => void;
  onHoverChange?: (isHovered: boolean) => void;
  showUpDownControls?: boolean;
  onManageBlock?: () => void;
};

const DocEditorBlock = ({
  children,
  blockId,
  blockType,
  loroContainerId,
  loroDoc,
  onFocusChange,
  onHoverChange,
  showUpDownControls,
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

  const controls = [] as DocEditorBlockControl[];
  if (showUpDownControls) {
    controls.push({
      id: `move-up-block-${blockId}`,
      label: 'Move Up',
      icon: <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />,
      onClick: () => {
        /* Implement move up logic here */
      },
    });
  }
  controls.push({
    id: `manage-block-${blockId}`,
    label: 'Manage',
    icon: <SettingsIcon sx={{ fontSize: 16 }} />,
    onClick: onManageBlock || (() => {}),
  });
  if (showUpDownControls) {
    controls.push({
      id: `move-down-block-${blockId}`,
      label: 'Move Down',
      icon: <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />,
      onClick: () => {
        /* Implement move down logic here */
      },
    });
  }

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
