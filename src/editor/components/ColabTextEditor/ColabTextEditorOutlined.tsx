import { useRef } from 'react';
import ColabTextEditor, {
  ColabTextEditorHandle,
  ColabTextEditorProps,
} from './ColabTextEditor';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

const ColabTextEditorOutlineBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'showOutlines',
})<{ showOutlines?: boolean; editable?: boolean }>(
  ({ theme, showOutlines, editable }) => ({
    padding: '4px',
    border: showOutlines
      ? `1px solid ${(theme.vars || theme).palette.grey[100]}`
      : `1px solid transparent`,
    backgroundColor:
      showOutlines && editable
        ? (theme.vars || theme).palette.background.default
        : 'transparent',
    borderRadius: '4px',
    transition: 'border 0.2s ease-in-out',
    ...theme.applyStyles('dark', {
      border: showOutlines
        ? `1px solid ${(theme.vars || theme).palette.grey[700]}`
        : `1px solid transparent`,
    }),
  }),
);

export type ColabTextEditorOutlinedProps = {
  showOutlines?: boolean;
} & ColabTextEditorProps;

const ColabTextEditorOutlined = (props: ColabTextEditorOutlinedProps) => {
  const { showOutlines = false, ...editorProps } = props;

  const editorRef = useRef<ColabTextEditorHandle>(null);

  const handleOutlineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Check if the focus is already inside the editor
    if (editorRef.current?.view?.hasFocus()) {
      return;
    } else {
      editorRef.current?.view?.focus();
    }
  };

  return (
    <ColabTextEditorOutlineBox
      onClick={handleOutlineClick}
      showOutlines={showOutlines}
      editable={editorProps.canEdit}
    >
      <ColabTextEditor ref={editorRef} {...editorProps} />
    </ColabTextEditorOutlineBox>
  );
};

export default ColabTextEditorOutlined;
