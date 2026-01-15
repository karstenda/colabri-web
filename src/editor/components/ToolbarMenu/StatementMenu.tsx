import { Stack, Tooltip } from '@mui/material';
import { ToolbarButton, ToolbarMenuDivider } from './ToolbarMenuStyles';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { useEffect, useRef, useState } from 'react';
import { AddLanguageModal, AddLanguageModalPayload } from '../AddLanguageModal';
import { useContentLanguages } from '../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { OrgContentLanguage } from '../../../api/ColabriAPI';
import { useDialogs } from '../../../ui/hooks/useDialogs/useDialogs';
import { useActiveBlock } from '../../context/ColabDocEditorContext/ColabDocEditorProvider';
import { StmtLoroDoc } from '../../data/ColabDoc';
import { Permission } from '../../../ui/data/Permission';
import { useTranslation } from 'react-i18next';
import ManagePermissionModal, {
  ManagePermissionModalPayload,
} from '../ManagePermissionModal/ManagePermissionModal';
import { LoroMap } from 'loro-crdt';
import { ConnectedStmtDoc } from '../../data/ConnectedColabDoc';

export type StatementMenuProps = {};

export default function StatementMenu({}: StatementMenuProps) {
  // Get the translation hook
  const { t } = useTranslation();

  // Get the document
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedStmtDoc)) {
    throw new Error(
      'StatementMenu can only be used with connected statement docs.',
    );
  }

  // Get the current organization
  const organization = useOrganization();

  // Get the dialogs hook
  const dialogs = useDialogs();

  // Get the languages in the organization
  const { languages } = useContentLanguages(organization?.id);

  // Get the focussed block
  const activeBlock = useActiveBlock();
  // Check if a statementElementBlock is focussed
  const isStatementElementBlockFocused =
    activeBlock?.blockType === 'StatementElementBlock';

  // The refs to control menu state
  const showMenuRef = useRef<boolean>(false);
  const disabled = useRef<boolean>(true);

  // State to track whether the user can add/remove languages or manage the statement
  const [canAddRemove, setCanAddRemove] = useState<boolean>(false);
  const [canManage, setCanManage] = useState<boolean>(false);

  // Get the loroDoc
  const loroDoc = colabDoc.getLoroDoc();
  const controller = colabDoc.getDocController();

  // When the colabDoc is loaded.
  useEffect(() => {
    if (!colabDoc && !loroDoc) {
      return;
    }

    // Check the document type
    const type = loroDoc?.getMap('properties')?.get('type');
    if (type === 'colab-statement') {
      // Enable the menu
      showMenuRef.current = true;
      disabled.current = false;
    }

    // Check permissions
    setCanAddRemove(controller.hasAddRemovePermission());
    setCanManage(controller.hasManagePermission());
    // Subscribe to ACL changes in the loroDoc
    controller.subscribeToDocAclChanges(() => {
      // On any ACL change, update the canEdit state
      setCanAddRemove(controller.hasAddRemovePermission());
      setCanManage(controller.hasManagePermission());
    });
  }, [colabDoc, controller, loroDoc]);

  /**
   * Get the focussed language
   * @returns
   */
  const getFocusedLangCode = (): string | undefined => {
    // Make sure we have a focussed block
    if (!activeBlock || !activeBlock.loroContainerId || !activeBlock.loroDoc) {
      return;
    }

    // Figure out which statement element is focussed
    // Get the content map
    const loroDoc = activeBlock.loroDoc as StmtLoroDoc;
    const contentLoroMap = loroDoc.getMap('content');

    // Iterate over the entries until the loroContainerId from the active block is found.
    let focussedLangCode: string | undefined = undefined;
    contentLoroMap.entries().forEach(([langCode, stmtElement]) => {
      if (stmtElement instanceof LoroMap) {
        if (stmtElement.id === activeBlock.loroContainerId) {
          // Found the focussed language
          focussedLangCode = langCode;
          return;
        }
      }
    });
    return focussedLangCode;
  };

  /**
   * Handle the opening of the Manage Statement modal
   */
  const handleManageStatementElementClicked = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // Prevent default behavior
    e.preventDefault();

    // Get the focussed language
    const langCode = getFocusedLangCode();
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
    });

    // If a new ACL map was returned, update the document
    if (newStmtElementAclMaps) {
      // Create the StatementDocController
      const stmtDocController = colabDoc.getDocController();

      // Patch the document ACL map with the new ACLs
      stmtDocController.patchStmtElementAclMap(langCode, newStmtElementAclMaps);

      // Commit the changes
      stmtDocController.commit();
    }
  };

  /**
   * Handle the Add Language button clicked
   */
  const handleAddLanguageClicked = async () => {
    // Figure out the existing languages
    const langCodes = loroDoc?.getMap('content')?.keys();

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

    // Create the StatementDocController
    const stmtDocController = colabDoc.getDocController();
    // Iterate over the languages and add them
    constentLanguages.forEach((lang) => {
      stmtDocController.addLanguage(lang.code);
    });
    stmtDocController.commit();
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
    // Get the focussed language
    const langCode = getFocusedLangCode();
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

    // Create the StatementDocController
    const stmtDocController = colabDoc.getDocController();
    // Remove the language
    stmtDocController.removeLanguage(langCode);
    stmtDocController.commit();
  };

  if (showMenuRef.current === false) {
    return <></>;
  } else {
    return (
      <Stack direction="row" spacing={'2px'}>
        {canAddRemove && (
          <>
            <ToolbarMenuDivider />
            <Tooltip title={t('editor.toolbar.addLanguageTooltip')}>
              <span>
                <ToolbarButton
                  disabled={disabled.current}
                  onClick={handleAddLanguageClicked}
                >
                  {t('editor.toolbar.addLanguage')}
                </ToolbarButton>
              </span>
            </Tooltip>
            <Tooltip title={t('editor.toolbar.removeLanguageTooltip')}>
              <span>
                <ToolbarButton
                  disabled={disabled.current || !isStatementElementBlockFocused}
                  onMouseDown={handleRemoveLanguageClicked}
                >
                  {t('editor.toolbar.removeLanguage')}
                </ToolbarButton>
              </span>
            </Tooltip>
          </>
        )}

        {canManage && (
          <>
            <ToolbarMenuDivider />
            <Tooltip title={t('editor.toolbar.manageLanguageTooltip')}>
              <span>
                <ToolbarButton
                  disabled={disabled.current || !isStatementElementBlockFocused}
                  onMouseDown={handleManageStatementElementClicked}
                >
                  {t('editor.toolbar.manageLanguage')}
                </ToolbarButton>
              </span>
            </Tooltip>
          </>
        )}
      </Stack>
    );
  }
}
