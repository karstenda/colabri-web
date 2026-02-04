import * as React from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useTranslation } from 'react-i18next';
import { ColabApprovalState } from '../../../api/ColabriAPI';
import {
  StyledButtonGroup,
  StatusButton,
  DropdownButton,
} from './ApprovalDropdownStyles';

export type ApprovalDropdownProps = {
  state: ColabApprovalState;
  canApprove: boolean;
  canManage: boolean;
  hasRejected: boolean;
  readOnly?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onRevert: () => void;
};

const ApprovalDropdown: React.FC<ApprovalDropdownProps> = ({
  state,
  canApprove,
  canManage,
  hasRejected,
  readOnly,
  onApprove,
  onReject,
  onRevert,
}) => {
  const { t } = useTranslation();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  let options = [] as { label: string; action: string }[];
  if (state === ColabApprovalState.Draft) {
    if (canApprove) {
      options = [
        { label: t('approval.action.doApprove'), action: 'approve' },
        { label: t('approval.action.doReject'), action: 'reject' },
      ];
    }
  } else if (state === ColabApprovalState.Pending) {
    if (canApprove) {
      options = [
        { label: t('approval.action.doApprove'), action: 'approve' },
        { label: t('approval.action.doReject'), action: 'reject' },
      ];
    }
  } else if (state === ColabApprovalState.Approved) {
    if (canManage || canApprove) {
      options = [
        { label: t('approval.action.revertToDraft'), action: 'revert' },
      ];
    }
  } else if (state === ColabApprovalState.Rejected) {
    // If this user can approve and rejected before.
    if (canApprove && hasRejected) {
      options.push({
        label: t('approval.action.doApprove'),
        action: 'approve',
      });
    }
    // Also allow revert to draft if canManage or canApprove
    if (canManage || canApprove) {
      options.push({
        label: t('approval.action.revertToDraft'),
        action: 'revert',
      });
    }
  }

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    action: string,
  ) => {
    // Handle the approval action
    if (action === 'approve') {
      onApprove();
    }
    // Handle the reject action
    else if (action === 'reject') {
      onReject();
    }
    // Handle the revert action
    else if (action === 'revert') {
      onRevert();
    }

    setOpen(false);
  };

  const getStateLabel = (state: ColabApprovalState) => {
    switch (state) {
      case ColabApprovalState.Draft:
        return t('approval.state.draft');
      case ColabApprovalState.Pending:
        return t('approval.state.pending');
      case ColabApprovalState.Approved:
        return t('approval.state.approved');
      case ColabApprovalState.Rejected:
        return t('approval.state.rejected');
      default:
        return '';
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <StyledButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <StatusButton
          state={state}
          hasDropdown={options.length > 0}
          onPointerDown={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {getStateLabel(state)}
        </StatusButton>
        {options.length > 0 && !readOnly && (
          <DropdownButton
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
            state={state}
          >
            <ArrowDropDownIcon />
          </DropdownButton>
        )}
      </StyledButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option.action}
                      onClick={(event) =>
                        handleMenuItemClick(event, option.action)
                      }
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default ApprovalDropdown;
