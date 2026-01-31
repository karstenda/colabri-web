import {
  Stack,
  SvgIcon,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import { ToolbarButton, ToolbarMenuDivider } from './ToolbarMenuStyles';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useEffect, useRef, useState } from 'react';
import { AddLanguageModal, AddLanguageModalPayload } from '../AddLanguageModal';
import {
  useContentLanguage,
  useContentLanguages,
} from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { DocumentType, OrgContentLanguage } from '../../../api/ColabriAPI';
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
import StatementApprovalDropdown from '../ApprovalDropdown/StmtApprovalDropdown';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ManageModal from '../ManageModal/ManageModal';
import {
  ManageSheetStatementElementModalPayload,
  ManageStatementElementModalPayload,
} from '../ManageModal/ManageModalPayloads';

export type StatementMenuProps = {
  activeStatementElementRef?: ActiveStatementElementRef | null;
  readOnly?: boolean;
};

export default function StatementMenu({
  activeStatementElementRef,
  readOnly,
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

  // State for the dropdown menu anchor
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

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

  // Get the active language
  const { language: activeLanguage } = useContentLanguage(
    organization?.id || '',
    activeStatementElementRef?.langCode || '',
    !!organization && !!activeStatementElementRef,
  );

  // When the colabDoc is loaded.
  useEffect(() => {
    // Check if we have the controller and colabDoc loaded
    const isLoaded = colabDoc && controller;
    if (!isLoaded) {
      return;
    }

    // Determine whether to enable the menu
    let doEnableMenu = false;
    // This depends on the type of document
    if (colabDoc.getDocType() === DocumentType.DocumentTypeColabStatement) {
      // Enable the menu always for statement docs
      doEnableMenu = true;
    } else if (colabDoc.getDocType() === DocumentType.DocumentTypeColabSheet) {
      // Only enable the menu if there's an active statement element
      doEnableMenu = !!activeStatementElementRef;
    }

    if (!doEnableMenu) {
      return;
    }

    // Enable the menu
    showMenuRef.current = true;
    disabled.current = false;

    // Get the language code of the active statement element (if any)
    const langCode = activeStatementElementRef?.langCode;

    // Check permissions
    setCanAddRemove(controller.hasAddRemovePermission());
    setCanManage(controller.hasManagePermission());
    setCanApprove(langCode ? controller.hasApprovePermission(langCode) : false);

    // Subscribe to ACL changes in the loroDoc
    let unsubscribers = [] as Array<() => void>;
    const docAclUnsubscribe = controller.subscribeToDocAclChanges(() => {
      // On any ACL change, update the canEdit state
      setCanAddRemove(controller.hasAddRemovePermission());
      setCanManage(controller.hasManagePermission());
    });
    unsubscribers.push(docAclUnsubscribe);

    // If a language code is focussed, subscribe to its ACL changes too
    if (langCode) {
      // Listen to acl changes for the language
      const elementAclUnsubscribe =
        controller.subscribeToStatementElementAclChanges(langCode, () => {
          // On any ACL change, update the canApprove state
          setCanApprove(controller.hasApprovePermission(langCode));
        });
      unsubscribers.push(elementAclUnsubscribe);

      // Listen to approval changes for the language
      const elementApprovalUnsubscribe =
        controller.subscribeToStatementElementApprovalChanges(langCode, () => {
          // On any approval change, update the canApprove state
          setCanApprove(controller.hasApprovePermission(langCode));
        });
      unsubscribers.push(elementApprovalUnsubscribe);
    }

    // Cleanup subscription on unmount or dependencies change
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [colabDoc, controller, activeStatementElementRef]);

  /**
   * Handle opening the Statement dropdown menu
   */
  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMenuAnchorEl(e.currentTarget);
  };

  /**
   * Handle closing the Statement dropdown menu
   */
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  /**
   * Handle the opening of the Manage Statement modal
   */
  const handleManageStatementElementClicked = async () => {
    // Close the menu
    handleCloseMenu();

    // Get the focussed language
    const langCode = activeStatementElementRef?.langCode;
    if (!langCode || !controller) {
      return;
    }

    // Open the modal to manage the statement element
    // Differentiate based on controller type
    // If it's local statement controller
    if (controller instanceof StatementLocalController) {
      await dialogs.open<ManageSheetStatementElementModalPayload, void>(
        ManageModal,
        {
          type: 'sheet-statement-element',
          title: t('editor.manageModal.localizationTitle', {
            language: activeLanguage?.name || langCode,
          }),
          langCode: langCode,
          stmtDocController: controller,
          blockContainerId: controller.getBlockId(),
          readOnly: readOnly,
        },
      );
      controller.getStatementElementState;
    }
    // If it's statement doc controller
    else if (controller instanceof StatementDocController) {
      await dialogs.open<ManageStatementElementModalPayload, void>(
        ManageModal,
        {
          type: 'statement-element',
          title: t('editor.manageModal.localizationTitle', {
            language: activeLanguage?.name || langCode,
          }),
          langCode,
          stmtDocController: controller,
          readOnly: readOnly,
        },
      );
    } else {
      console.error(
        'Unknown controller type in StatementMenu for managing statement element permissions.',
      );
    }
  };

  /**
   * Handle the Add Language button clicked
   */
  const handleAddLanguageClicked = async () => {
    // Close the menu
    handleCloseMenu();

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
  const handleRemoveLanguageClicked = async () => {
    // Close the menu
    handleCloseMenu();

    if (!controller) {
      return;
    }

    // Get the focussed language
    const { langCode } = activeStatementElementRef || {};
    if (!langCode) {
      return;
    }

    // Create a confirmation message
    let confirmMessage = t('editor.toolbar.removeLocalizationConfirmGeneric');
    const contentLanguage = languages.find((l) => l.code === langCode);
    if (contentLanguage) {
      confirmMessage = t('editor.toolbar.removeLocalizationConfirm', {
        localization: contentLanguage.name,
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
    const showStatementDropdown = canAddRemove || canManage;

    return (
      <Stack direction="row" spacing={'2px'} sx={{ alignItems: 'center' }}>
        {showStatementDropdown && (
          <>
            <ToolbarMenuDivider />
            <Tooltip
              title={t('editor.toolbar.statementMenuTooltip')}
              placement="top"
            >
              <span>
                <ToolbarButton
                  disabled={disabled.current}
                  onMouseDown={handleOpenMenu}
                  aria-controls={isMenuOpen ? 'statement-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen ? 'true' : undefined}
                  endIcon={<KeyboardArrowDownIcon />}
                >
                  {t('statements.type')}
                </ToolbarButton>
              </span>
            </Tooltip>
            <Menu
              id="statement-menu"
              anchorEl={menuAnchorEl}
              open={isMenuOpen}
              onClose={handleCloseMenu}
              slotProps={{
                list: { 'aria-labelledby': 'statement-menu-button' },
              }}
            >
              {canAddRemove && !readOnly && (
                <MenuItem onClick={handleAddLanguageClicked}>
                  <ListItemIcon>
                    <LanguageAddIcon width={20} height={20} />
                  </ListItemIcon>
                  <ListItemText>
                    {t('editor.toolbar.addLocalizationTooltip')}
                  </ListItemText>
                </MenuItem>
              )}
              {canAddRemove && !readOnly && activeStatementElementRef && (
                <MenuItem onClick={handleRemoveLanguageClicked}>
                  <ListItemIcon>
                    <SvgIcon
                      component={LanguageRemoveIcon}
                      sx={{ fontSize: 20 }}
                    />
                  </ListItemIcon>
                  <ListItemText>
                    {t('editor.toolbar.removeLocalizationTooltip')}
                  </ListItemText>
                </MenuItem>
              )}
              {canManage && !readOnly && activeStatementElementRef && (
                <MenuItem onClick={handleManageStatementElementClicked}>
                  <ListItemIcon>
                    <LanguageSettingsIcon />
                  </ListItemIcon>
                  <ListItemText>
                    {t('editor.toolbar.manageLocalizationTooltip')}
                  </ListItemText>
                </MenuItem>
              )}
              {readOnly && activeStatementElementRef && (
                <MenuItem onClick={handleManageStatementElementClicked}>
                  <ListItemIcon>
                    <LanguageSettingsIcon />
                  </ListItemIcon>
                  <ListItemText>
                    {t('editor.toolbar.inspectLocalizationTooltip')}
                  </ListItemText>
                </MenuItem>
              )}
            </Menu>
          </>
        )}
        {canApprove && isLanguageAdded && (
          <>
            <ToolbarMenuDivider />
            <Tooltip
              title={t('editor.toolbar.statementApprovalTooltip')}
              placement="top"
            >
              <Box sx={{ paddingLeft: '8px', paddingRight: '8px' }}>
                <StatementApprovalDropdown
                  langCode={activeStatementElementRef?.langCode}
                  controller={stmtController}
                />
              </Box>
            </Tooltip>
          </>
        )}
      </Stack>
    );
  }
}
