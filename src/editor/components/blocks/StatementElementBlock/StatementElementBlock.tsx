import { StatementElementBlockBP } from './StatementElementBlockBP';
import { Stack, Tooltip } from '@mui/material';
import ColabTextEditor from '../../ColabTextEditor/ColabTextEditor';
import {
  useContentLanguages,
  usePlatformContentLanguages,
} from '../../../../ui/hooks/useContentLanguages/useContentLanguage';
import {
  useOrganization,
  useOrgUserId,
} from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { LoroDocType } from 'loro-prosemirror';
import { useEffect, useState } from 'react';
import { ContainerID, LoroMap } from 'loro-crdt';
import DocEditorBlock from '../DocEditorBlock';
import {
  ColabTextEditorOutline,
  StmtElementHeaderLeft,
  StmtElementHeaderRight,
  StmtElementHeaderWrapper,
  TypographyReadOnly,
} from './StatementElementBlockStyle';
import { useDialogs } from '../../../../ui/hooks/useDialogs/useDialogs';
import ManagePermissionModal, {
  ManagePermissionModalPayload,
} from '../../ManagePermissionModal/ManagePermissionModal';
import { ConnectedStmtDoc } from '../../../data/ConnectedColabDoc';
import { Permission } from '../../../../ui/data/Permission';
import ApprovalDropdown from '../../ApprovalDropdown/ApprovalDropdown';
import ErrorIcon from '@mui/icons-material/Error';
import { useGoogleFonts } from '../../../../ui/hooks/useFonts/useFonts';
import { ContentLanguage } from '../../../data/ContentLanguage';
import { t } from 'i18next';
import { ColabApprovalState } from '../../../../api/ColabriAPI';
import ColabTextEditorOutlined from '../../ColabTextEditor/ColabTextEditorOutlined';

export type StatementElementBlockProps = {
  bp: StatementElementBlockBP;
};

const StatementElementBlock = ({ bp }: StatementElementBlockProps) => {
  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedStmtDoc)) {
    throw new Error(
      'StatementElementBlock can only be used with connected statement docs.',
    );
  }

  // Get the current organization
  const organization = useOrganization();
  const userId = useOrgUserId();
  const approvalKey = organization?.id + '/u/' + userId;

  // Get the configured languages
  const { languages, isLoading: isLanguagesLoading } = useContentLanguages(
    organization?.id,
  );

  // Get the dialogs hook
  const dialogs = useDialogs();

  // Get the language
  let language: ContentLanguage | undefined = languages.find(
    (l) => l.code === bp.langCode,
  );
  // If not found, try to get it from platform languages
  let isNonOrgContentLanguages = false;
  const { languages: platformLanguages } = usePlatformContentLanguages(
    !language && !isLanguagesLoading,
  );
  if (!language && !isLanguagesLoading) {
    language = platformLanguages.find((l) => l.code === bp.langCode);
    isNonOrgContentLanguages = true;
  }

  // Get the list of custom fonts
  const customFonts = [] as string[];
  if (language?.defaultFont) {
    for (const font of language.defaultFont) {
      // Ignore Noto Sans as it's already loaded
      if (font === 'Noto Sans') {
        continue;
      }
      if (!customFonts.includes(font)) {
        customFonts.push(font);
      }
    }
  }

  // Get the fonts for the language
  useGoogleFonts(customFonts);

  // Get the ephemeral store manager
  const ephStoreMgr = colabDoc?.getEphStoreMgr();

  // Get the LoroDoc
  const loroDoc = colabDoc?.getLoroDoc();

  // Get the controller
  const controller = colabDoc?.getDocController();

  // The reference to the text element container id
  let textElementContainerId: ContainerID | null = null;
  if (loroDoc) {
    const container = loroDoc.getContainerById(bp.containerId) as LoroMap;
    if (container) {
      const textElementContainer = container.get('textElement') as LoroMap;
      if (textElementContainer) {
        textElementContainerId = textElementContainer.id;
      } else {
        console.log(
          "Could not find 'textElement' inside StatementElement with id: " +
            bp.containerId,
        );
      }
    } else {
      console.log('Could not find StatementElement with id: ' + bp.containerId);
    }
  }

  // State to track whether the user can edit this statement element
  const [canEdit, setCanEdit] = useState<boolean>(false);
  // State to track approval info
  const [approvalState, setApprovalState] = useState<ColabApprovalState>(
    controller
      ? controller.getStatementElementState(bp.langCode)
      : ColabApprovalState.Draft,
  );
  const [canApprove, setCanApprove] = useState<boolean>(
    controller ? controller.hasApprovePermission(bp.langCode) : false,
  );
  const [canManage, setCanManage] = useState<boolean>(
    controller ? controller.hasManagePermission() : false,
  );
  const [hasRejected, setHasRejected] = useState<boolean>(
    controller
      ? controller.hasRejectedApproval(bp.langCode, approvalKey)
      : false,
  );

  // State to track focus and hover
  const [focus, setFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showOutlines = (focus || isHovered) && canEdit;

  useEffect(() => {
    if (controller && bp.langCode && loroDoc) {
      // Update the canEdit state
      setCanEdit(controller.canEditStatementElement(bp.langCode));
      setApprovalState(controller.getStatementElementState(bp.langCode));
      setCanApprove(controller.hasApprovePermission(bp.langCode));
      setCanManage(controller.hasManagePermission());
      setHasRejected(controller.hasRejectedApproval(bp.langCode, approvalKey));

      // Subscribe to ACL changes in the loroDoc
      const aclUnsubscribe = controller.subscribeToStatementElementAclChanges(
        bp.langCode,
        () => {
          // On any ACL change, update the canEdit state
          setCanEdit(controller.canEditStatementElement(bp.langCode));
          setCanApprove(controller.hasApprovePermission(bp.langCode));
          setCanManage(controller.hasManagePermission());
        },
      );
      // Subscribe to approval changes in the loroDoc
      const approvalUnsubscribe =
        controller.subscribeToStatementElementApprovalChanges(
          bp.langCode,
          () => {
            // On any approval change, update the canEdit state
            setCanEdit(controller.canEditStatementElement(bp.langCode));
            setApprovalState(controller.getStatementElementState(bp.langCode));
            setHasRejected(
              controller.hasRejectedApproval(bp.langCode, approvalKey),
            );

            // On any approval change, update the canEdit state
            setCanEdit(controller.canEditStatementElement(bp.langCode));
          },
        );

      // Cleanup subscriptions on unmount
      return () => {
        aclUnsubscribe();
        approvalUnsubscribe();
      };
    }
  }, [loroDoc, controller, bp.langCode]);

  // Handle focus change from DocEditorBlock
  const handleFocusChange = (hasFocus: boolean) => {
    setFocus(hasFocus);
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  const handleManageElement = async () => {
    if (!loroDoc || !language || !controller) {
      return;
    }

    // Get the current ACLs
    const docAcls = controller.getDocAclMap();
    const stmtElementAcls = controller.getStmtElementAclMap(bp.langCode);

    // Open the modal to manage the statement element
    const newStmtElementAclMaps = await dialogs.open<
      ManagePermissionModalPayload,
      Record<Permission, string[]> | undefined
    >(ManagePermissionModal, {
      langCode: bp.langCode,
      orgId: organization?.id || '',
      acls: stmtElementAcls,
      docAcls: docAcls,
    });

    // If a new ACL map was returned, update the document
    if (newStmtElementAclMaps) {
      // Create the StatementDocController
      const stmtDocController = colabDoc.getDocController();

      // Patch the document ACL map with the new ACLs
      stmtDocController.patchStmtElementAclMap(
        language.code,
        newStmtElementAclMaps,
      );

      // Commit the changes
      stmtDocController.commit();
    }
  };

  const handleApprove = () => {
    if (!controller) {
      return;
    }
    const hasApproved = controller.approveStatementElement(
      bp.langCode,
      approvalKey,
    );
    if (hasApproved) {
      controller.commit();
      setApprovalState(controller.getStatementElementState(bp.langCode));
    }
  };

  const handleReject = () => {
    if (!controller) {
      return;
    }
    const hasRejected = controller.rejectStatementElement(
      bp.langCode,
      approvalKey,
    );
    if (hasRejected) {
      controller.commit();
      setApprovalState(controller.getStatementElementState(bp.langCode));
    }
  };

  const handleRevert = () => {
    if (!controller) {
      return;
    }
    const hasReverted = controller.revertStatementElementToDraft(bp.langCode);
    if (hasReverted) {
      controller.commit();
      setApprovalState(controller.getStatementElementState(bp.langCode));
    }
  };

  if (!loroDoc || !ephStoreMgr) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <DocEditorBlock
          blockId={bp.id}
          blockType={'StatementElementBlock'}
          loroContainerId={bp.containerId}
          loroDoc={loroDoc}
          controller={controller}
          onFocusChange={handleFocusChange}
          onHoverChange={handleHoverChange}
          showUpDownControls={false}
          onManageBlock={handleManageElement}
          readOnly={!canEdit}
        >
          <Stack direction="column" spacing={0.5}>
            <Stack direction="row" spacing={1} flex={1}>
              <StmtElementHeaderWrapper>
                <StmtElementHeaderLeft>
                  <TypographyReadOnly variant="h6">
                    {language?.name || bp.langCode}
                  </TypographyReadOnly>
                  {isNonOrgContentLanguages && (
                    <Tooltip
                      title={t('editor.statementElementBlock.nonOrgLanguage')}
                    >
                      <ErrorIcon
                        fontSize="small"
                        color="error"
                        sx={{ cursor: 'help' }}
                      />
                    </Tooltip>
                  )}
                </StmtElementHeaderLeft>
                <StmtElementHeaderRight>
                  <ApprovalDropdown
                    state={approvalState}
                    canApprove={canApprove}
                    canManage={canManage}
                    hasRejected={hasRejected}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRevert={handleRevert}
                  />
                </StmtElementHeaderRight>
              </StmtElementHeaderWrapper>
            </Stack>
            {textElementContainerId != null && (
              <ColabTextEditorOutlined
                showOutlines={showOutlines}
                loro={loroDoc as any as LoroDocType}
                ephStoreMgr={ephStoreMgr}
                containerId={textElementContainerId}
                spellCheck={{
                  enabled: true,
                  supported: language?.spellCheck || false,
                  orgId: organization?.id || '',
                  langCode: language?.spellCheckLangCode,
                }}
                canEdit={canEdit}
                txtDir={language?.textDirection}
                customFonts={customFonts}
              />
            )}
          </Stack>
        </DocEditorBlock>
      </>
    );
  }
};

export default StatementElementBlock;
