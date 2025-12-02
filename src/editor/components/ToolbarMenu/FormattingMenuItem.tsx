import React from 'react';
import { FormattingButton } from './ToolbarMenuStyles';

type FormattingMenuItemProps = {
  key: string;
  icon: React.ReactNode;
  label: string;
  active: boolean | undefined;
  disabled: boolean | undefined;
  onClick: () => void;
};

const FormattingMenuItem = React.memo(function FormattingMenuItem(
  props: FormattingMenuItemProps,
) {
  let disabled;
  if (props.disabled === undefined) {
    disabled = true;
  } else {
    disabled = props.disabled;
  }
  let active;
  if (props.active === undefined || props.active === null) {
    active = false;
  } else {
    active = props.active && !disabled;
  }
  return (
    <FormattingButton
      onMouseDown={(e) => {
        e.preventDefault();
        props.onClick();
      }}
      aria-pressed={active}
      aria-label={props.label}
      active={active}
      disabled={disabled}
    >
      {props.icon}
    </FormattingButton>
  );
});

export default FormattingMenuItem;
