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
import StatementDocController from '../../controllers/StatementDocController';
import {
  useOrganization,
  useOrgUserId,
} from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import {
  StyledButtonGroup,
  StatusButton,
  DropdownButton,
} from './ApprovalDropdownStyles';

export type ApprovalDropdownProps = {
  controller: StatementDocController;
  langCode: string;
};

const ApprovalDropdown: React.FC<ApprovalDropdownProps> = ({
  langCode,
  controller,
}) => {
  const { t } = useTranslation();
  const organization = useOrganization();
  const userId = useOrgUserId();

  // The approval key for the current user
  const approvalKey = organization?.id + '/u/' + userId;

  const [state, setState] = React.useState<ColabApprovalState>(
    controller.getStatementElementState(langCode),
  );
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const [canApprove, setCanApprove] = React.useState<boolean>(
    controller.hasApprovePermission(langCode),
  );
  const [canManage, setCanManage] = React.useState<boolean>(
    controller.hasManagePermission(),
  );

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
    if (canApprove && controller.hasRejectedApproval(langCode, approvalKey)) {
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

  React.useEffect(() => {
    // Initialize canApprove and canManage states
    setCanApprove(controller.hasApprovePermission(langCode));
    setCanManage(controller.hasManagePermission());
    // Subscribe to ACL changes
    const aclUnsubscribe = controller.subscribeToStatementElementAclChanges(
      langCode,
      () => {
        setCanApprove(controller.hasApprovePermission(langCode));
        setCanManage(controller.hasManagePermission());
      },
    );
    // Subscribe to approval state changes
    const approvalUnsubscribe =
      controller.subscribeToStatementElementApprovalChanges(langCode, () => {
        setState(controller.getStatementElementState(langCode));
      });
    return () => {
      // Cleanup subscriptions on unmount
      aclUnsubscribe();
      approvalUnsubscribe();
    };
  }, [controller, langCode]);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    action: string,
  ) => {
    // Handle the approval action
    if (action === 'approve') {
      const hasApproved = controller.approveStatementElement(
        langCode,
        approvalKey,
      );
      if (hasApproved) {
        controller.commit();
        setState(controller.getStatementElementState(langCode));
      }
    }
    // Handle the reject action
    else if (action === 'reject') {
      const hasRejected = controller.rejectStatementElement(
        langCode,
        approvalKey,
      );
      if (hasRejected) {
        controller.commit();
        setState(controller.getStatementElementState(langCode));
      }
    }
    // Handle the revert action
    else if (action === 'revert') {
      const hasReverted = controller.revertStatementElementToDraft(langCode);
      if (hasReverted) {
        controller.commit();
        setState(controller.getStatementElementState(langCode));
      }
    }

    setOpen(false);
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
        <StatusButton state={state} hasDropdown={options.length > 0}>
          {getStateLabel(state)}
        </StatusButton>
        {options.length > 0 && (
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
