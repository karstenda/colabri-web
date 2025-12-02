import { Stack } from '@mui/material';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormattingMenuItem from './FormattingMenuItem';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import { FormattingSetup } from './FormattingMenuSetup';
import { useActiveEditorView } from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import { Command } from 'prosemirror-state';
import { ToolbarMenuDivider } from './ToolbarMenuStyles';

export type FormattingMenuProps = {
  setup: FormattingSetup;
};

export default function FormattingMenu({ setup }: FormattingMenuProps) {
  const activeEditorView = useActiveEditorView();

  // Apply a command to the active editor view
  const applyCommand = (command?: Command) => {
    if (activeEditorView && command) {
      command(
        activeEditorView.state,
        activeEditorView.dispatch,
        activeEditorView,
      );
      activeEditorView.focus();
    }
  };

  const applyStrong = () => {
    applyCommand(setup?.strong?.command);
  };

  const applyItalic = () => {
    applyCommand(setup?.italic?.command);
  };

  const applyUnderline = () => {
    applyCommand(setup?.underline?.command);
  };

  const applySubscript = () => {
    applyCommand(setup?.subscript?.command);
  };

  const applySuperscript = () => {
    applyCommand(setup?.superscript?.command);
  };

  return (
    <Stack direction="row" spacing={'2px'}>
      <FormattingMenuItem
        key={'strong'}
        icon={<FormatBoldIcon />}
        label="Bold"
        active={setup?.strong?.active}
        disabled={setup?.strong?.disabled}
        onClick={applyStrong}
      />
      <FormattingMenuItem
        key={'italic'}
        icon={<FormatItalicIcon />}
        label="Italic"
        active={setup?.italic?.active}
        disabled={setup?.italic?.disabled}
        onClick={applyItalic}
      />
      <FormattingMenuItem
        key={'underline'}
        icon={<FormatUnderlinedIcon />}
        label="Underline"
        active={setup?.underline?.active}
        disabled={setup?.underline?.disabled}
        onClick={applyUnderline}
      />
      <ToolbarMenuDivider />
      <FormattingMenuItem
        key={'subscript'}
        icon={<SubscriptIcon />}
        label="Subscript"
        active={setup?.subscript?.active}
        disabled={setup?.subscript?.disabled}
        onClick={applySubscript}
      />
      <FormattingMenuItem
        key={'superscript'}
        icon={<SuperscriptIcon />}
        label="Superscript"
        active={setup?.superscript?.active}
        disabled={setup?.superscript?.disabled}
        onClick={applySuperscript}
      />
      <ToolbarMenuDivider />
      <FormattingMenuItem
        key={'bullet_list'}
        icon={<FormatListBulletedIcon />}
        label="Bullet List"
        active={setup?.bullet_list?.active}
        disabled={setup?.bullet_list?.disabled}
        onClick={() => applyCommand(setup?.bullet_list?.command)}
      />
      <FormattingMenuItem
        key={'ordered_list'}
        icon={<FormatListNumberedIcon />}
        label="Ordered List"
        active={setup?.ordered_list?.active}
        disabled={setup?.ordered_list?.disabled}
        onClick={() => applyCommand(setup?.ordered_list?.command)}
      />
      <FormattingMenuItem
        key={'indent_decrease'}
        icon={<FormatIndentDecreaseIcon />}
        label="Decrease Indent"
        active={setup?.indent_decrease?.active}
        disabled={setup?.indent_decrease?.disabled}
        onClick={() => applyCommand(setup?.indent_decrease?.command)}
      />
    </Stack>
  );
}
