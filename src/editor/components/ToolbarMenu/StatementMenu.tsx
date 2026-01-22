import { Stack, SvgIcon, Tooltip } from '@mui/material';
import { ToolbarButton, ToolbarMenuDivider } from './ToolbarMenuStyles';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AddLanguageModal, AddLanguageModalPayload } from '../AddLanguageModal';
import { useContentLanguages } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { OrgContentLanguage } from '../../../api/ColabriAPI';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import { Permission } from '../../../ui/data/Permission';
import { useTranslation } from 'react-i18next';
import ManagePermissionModal, {
  ManagePermissionModalPayload,
} from '../ManagePermissionModal/ManagePermissionModal';
import {
  ConnectedSheetDoc,
  ConnectedStmtDoc,
} from '../../data/ConnectedColabDoc';
import LanguageAddIcon from '../icons/LanguageAddIcon';
import LanguageRemoveIcon from '../icons/LanguageRemoveIcon';
import LanguageSettingsIcon from '../icons/LanguageSettingsIcon';
import StatementLocalController from '../../controllers/StatementLocalController';
import StatementDocController from '../../controllers/StatementDocController';
import { ActiveStatementElementRef } from '../../context/ColabDocEditorContext/ColabDocEditorContext';
import ApprovalDropdown from '../ApprovalDropdown/ApprovalDropdown';
import StatementApprovalDropdown from '../ApprovalDropdown/StmtApprovalDropdown';

export type StatementMenuProps = {
  activeStatementElementRef?: ActiveStatementElementRef | null;
};

export default function StatementMenu({
  activeStatementElementRef,
}: StatementMenuProps) {
  // Get the translation hook
  const { t } = useTranslation();

  // Get the current organization
  const organization = useOrganization();

  // Get the dialogs hook
  const dialogs = useDialogs();

  // Get the languages in the organization
  const { languages } = useContentLanguages(organization?.id);

  // The refs to control menu state
  const showMenuRef = useRef<boolean>(false);
  const disabled = useRef<boolean>(true);

  // State to track whether the user can add/remove languages or manage the statement
  const [canAddRemove, setCanAddRemove] = useState<boolean>(false);
  const [canManage, setCanManage] = useState<boolean>(false);
  const [canApprove, setCanApprove] = useState<boolean>(false);

  // The main active document
  const { colabDoc } = useColabDoc();

  // Get the controller for the statement.
  let stmtController: StatementDocController | StatementLocalController | null =
    null;
  // Check if there's an active statement element ref
  if (activeStatementElementRef) {
    const refColabDoc = activeStatementElementRef.colabDoc;
    // If it's a statement doc, just get the main controller
    if (refColabDoc instanceof ConnectedStmtDoc) {
      stmtController = refColabDoc.getDocController() as StatementDocController;
    }
    // If it's a sheet doc, get the local statement controller
    else if (refColabDoc instanceof ConnectedSheetDoc) {
      const sheetController = refColabDoc.getDocController();
      const stmtContainerId = activeStatementElementRef.stmtContainerId;
      if (!stmtContainerId) {
        throw new Error(
          'ActiveStatementElementRef is missing stmtContainerId for local statement controller.',
        );
      }
      stmtController = sheetController.getLocalStatementController(
        stmtContainerId,
      ) as StatementLocalController;
    }
  }
  // No active statement element ref, then we can only assume the main doc is a statement doc
  else {
    if (colabDoc instanceof ConnectedStmtDoc) {
      stmtController = colabDoc.getDocController() as StatementDocController;
    } else {
      throw new Error(
        'StatementMenu can only be used with connected statement docs.',
      );
    }
  }
  const controller: StatementDocController | StatementLocalController | null =
    stmtController;

  // Check if the language is added
  let isLanguageAdded: boolean;
  if (!activeStatementElementRef || !controller) {
    isLanguageAdded = false;
  } else {
    isLanguageAdded = controller.hasLangCode(
      activeStatementElementRef.langCode,
    );
  }

  // When the colabDoc is loaded.
  useEffect(() => {
    if (
      !colabDoc ||
      !controller ||
      !activeStatementElementRef ||
      !isLanguageAdded
    ) {
      return;
    }
    const langCode = activeStatementElementRef.langCode;

    // Enable the menu
    showMenuRef.current = true;
    disabled.current = false;

    // Check permissions
    setCanAddRemove(controller.hasAddRemovePermission());
    setCanManage(controller.hasManagePermission());
    setCanApprove(controller.hasApprovePermission(langCode));
    // Subscribe to ACL changes in the loroDoc
    controller.subscribeToStatementElementAclChanges(langCode, () => {
      // On any ACL change, update the canEdit state
      setCanAddRemove(controller.hasAddRemovePermission());
      setCanManage(controller.hasManagePermission());
      setCanApprove(controller.hasApprovePermission(langCode));
    });
  }, [colabDoc, controller, activeStatementElementRef, isLanguageAdded]);

  /**
   * Handle the opening of the Manage Statement modal
   */
  const handleManageStatementElementClicked = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Prevent default behavior
    e.preventDefault();

    // Get the focussed language
    const langCode = activeStatementElementRef?.langCode;
    if (!langCode || !controller) {
      return;
    }

    // Get the current ACLs
    const docAcls = controller.getDocAclMap();
    const stmtElementAcls = controller.getStmtElementAclMap(langCode);

    // Open the modal to manage the statement element
    const newStmtElementAclMaps = await dialogs.open<
      ManagePermissionModalPayload,
      Record<Permission, string[]> | undefined
    >(ManagePermissionModal, {
      langCode,
      orgId: organization?.id || '',
      acls: stmtElementAcls,
      docAcls: docAcls,
      availablePermissions: new Set<Permission>([
        Permission.Edit,
        Permission.Approve,
      ]),
      defaultPermission: Permission.Edit,
    });

    // If a new ACL map was returned, update the document
    if (newStmtElementAclMaps) {
      // Patch the document ACL map with the new ACLs
      controller.patchStmtElementAclMap(langCode, newStmtElementAclMaps);

      // Commit the changes
      controller.commit();
    }
  };

  /**
   * Handle the Add Language button clicked
   */
  const handleAddLanguageClicked = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Prevent default behavior
    e.preventDefault();

    if (!controller) {
      return;
    }

    // Figure out the existing languages
    const langCodes = controller.getLangCodes();

    // Map them to language objects
    const existingLanguages = languages.filter((lang) =>
      langCodes?.includes(lang.code),
    );

    // Show the modal
    const constentLanguages = await dialogs.open<
      AddLanguageModalPayload,
      OrgContentLanguage[]
    >(AddLanguageModal, {
      existingLanguages: existingLanguages,
    });

    // Iterate over the languages and add them
    constentLanguages.forEach((lang) => {
      controller.addLanguage(lang.code);
    });
    controller.commit();
  };

  /**
   * Handle the Remove Language button clicked
   * @param e
   * @returns
   */
  const handleRemoveLanguageClicked = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Prevent default behavior
    e.preventDefault();

    if (!controller) {
      return;
    }

    // Get the focussed language
    const { langCode } = activeStatementElementRef || {};
    if (!langCode) {
      return;
    }

    // Create a confirmation message
    let confirmMessage = t('editor.toolbar.removeLanguageConfirmGeneric');
    const contentLanguage = languages.find((l) => l.code === langCode);
    if (contentLanguage) {
      confirmMessage = t('editor.toolbar.removeLanguageConfirm', {
        language: contentLanguage.name,
      });
    }

    // Ask for confirmation
    const confirm = await dialogs.confirm(confirmMessage);

    // If not confirmed, return
    if (!confirm) {
      return;
    }

    // Remove the language
    controller.removeLanguage(langCode);
    controller.commit();
  };

  // Start rendering
  if (showMenuRef.current === false) {
    return <></>;
  } else {
    return (
      <Stack direction="row" spacing={'2px'}>
        {canAddRemove && (
          <>
            <ToolbarMenuDivider />
            <Tooltip
              title={t('editor.toolbar.addLanguageTooltip')}
              placement="top"
            >
              <span>
                <ToolbarButton
                  disabled={disabled.current}
                  onMouseDown={handleAddLanguageClicked}
                >
                  <LanguageAddIcon width={'100%'} height={'100%'} />
                </ToolbarButton>
              </span>
            </Tooltip>
            <Tooltip
              title={t('editor.toolbar.removeLanguageTooltip')}
              placement="top"
            >
              <span>
                <ToolbarButton
                  disabled={disabled.current || !activeStatementElementRef}
                  onMouseDown={handleRemoveLanguageClicked}
                >
                  <SvgIcon component={LanguageRemoveIcon} />
                </ToolbarButton>
              </span>
            </Tooltip>
          </>
        )}

        {canManage && (
          <>
            <Tooltip
              title={t('editor.toolbar.manageLanguageTooltip')}
              placement="top"
            >
              <span>
                <ToolbarButton
                  disabled={disabled.current || !activeStatementElementRef}
                  onMouseDown={handleManageStatementElementClicked}
                >
                  <LanguageSettingsIcon />
                </ToolbarButton>
              </span>
            </Tooltip>
          </>
        )}
        {canApprove && isLanguageAdded && (
          <>
            <Tooltip
              title={t('editor.toolbar.manageLanguageTooltip')}
              placement="top"
            >
              <span>
                <StatementApprovalDropdown
                  langCode={activeStatementElementRef?.langCode}
                  controller={stmtController}
                />
              </span>
            </Tooltip>
          </>
        )}
      </Stack>
    );
  }
}
