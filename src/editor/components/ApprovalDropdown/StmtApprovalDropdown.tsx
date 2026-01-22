import { useCallback, useEffect, useState } from 'react';
import {
  useOrganization,
  useOrgUserId,
} from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import StatementDocController from '../../controllers/StatementDocController';
import StatementLocalController from '../../controllers/StatementLocalController';
import ApprovalDropdown from './ApprovalDropdown';
import { ColabApprovalState } from '../../../api/ColabriAPI';

export type StmtApprovalDropdownProps = {
  langCode?: string;
  controller?: StatementDocController | StatementLocalController | null;
};

const StatementApprovalDropdown = ({
  langCode,
  controller,
}: StmtApprovalDropdownProps) => {
  // Get the current organization
  const organization = useOrganization();
  const userId = useOrgUserId();
  const approvalKey = organization?.id + '/u/' + userId;

  // Create state for permissions and approval state
  const [canApprove, setCanApprove] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [approvalState, setApprovalState] = useState(ColabApprovalState.Draft);
  const [hasRejected, setHasRejected] = useState<boolean>(false);

  useEffect(() => {
    if (!langCode || !controller) {
      return;
    }
    setCanApprove(controller.hasApprovePermission(langCode));
    setCanManage(controller.hasManagePermission());
    setApprovalState(controller.getStatementElementState(langCode));
    setHasRejected(controller.hasRejectedApproval(langCode, approvalKey));

    const unsubscribeApprovals =
      controller.subscribeToStatementElementApprovalChanges(langCode, () => {
        setApprovalState(controller.getStatementElementState(langCode));
        setHasRejected(controller.hasRejectedApproval(langCode, approvalKey));
      });

    const unsubscribeAcls = controller.subscribeToStatementElementAclChanges(
      langCode,
      () => {
        setCanApprove(controller.hasApprovePermission(langCode));
        setCanManage(controller.hasManagePermission());
      },
    );

    return () => {
      unsubscribeApprovals();
      unsubscribeAcls();
    };
  }, [controller, langCode]);

  /**
   * Handle the Approve button clicked
   */
  const handleApprove = useCallback(() => {
    if (!langCode || !controller) {
      return;
    }
    const ok = controller.approveStatementElement(langCode, approvalKey);
    if (ok) {
      controller.commit();
    }
  }, [langCode, controller]);

  /**
   * Handle the Reject button clicked
   */
  const handleReject = useCallback(() => {
    if (!langCode || !controller) {
      return;
    }
    const ok = controller.rejectStatementElement(langCode, approvalKey);
    if (ok) {
      controller.commit();
    }
  }, [langCode, controller]);

  /**
   * Handle the Revert button clicked
   */
  const handleRevert = useCallback(() => {
    if (!langCode || !controller) {
      return;
    }
    const ok = controller.revertStatementElementToDraft(langCode);
    if (ok) {
      controller.commit();
    }
  }, [langCode, controller]);

  return (
    <ApprovalDropdown
      state={approvalState}
      canApprove={canApprove}
      canManage={canManage}
      hasRejected={hasRejected}
      onApprove={handleApprove}
      onReject={handleReject}
      onRevert={handleRevert}
    />
  );
};

export default StatementApprovalDropdown;
