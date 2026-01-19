import { SheetTextBlockBP } from './SheetTextBlockBP';
import React from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
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
  SheetTextBlockHeaderLeft,
  SheetTextBlockHeaderRight,
  SheetTextBlockHeaderWrapper,
  TypographyReadOnly,
} from './SheetTextBlockStyle';
import { useDialogs } from '../../../../ui/hooks/useDialogs/useDialogs';
import ManagePermissionModal, {
  ManagePermissionModalPayload,
} from '../../ManagePermissionModal/ManagePermissionModal';
import { ConnectedSheetDoc } from '../../../data/ConnectedColabDoc';
import { Permission } from '../../../../ui/data/Permission';
import ApprovalDropdown from '../../ApprovalDropdown/ApprovalDropdown';
import ErrorIcon from '@mui/icons-material/Error';
import { useGoogleFonts } from '../../../../ui/hooks/useFonts/useFonts';
import { ContentLanguage } from '../../../data/ContentLanguage';
import { t } from 'i18next';
import { ColabApprovalState } from '../../../../api/ColabriAPI';
import DocEditorSheetBlock from '../DocEditorBlock/DocEditorSheetBlock';
import ColabTextEditorOutlined from '../../ColabTextEditor/ColabTextEditorOutlined';

export type SheetTextBlockProps = {
  bp: SheetTextBlockBP;
};

const SheetTextBlock: React.FC<SheetTextBlockProps> = ({ bp }) => {
  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();
  if (!(colabDoc instanceof ConnectedSheetDoc)) {
    throw new Error(
      'SheetTextBlock can only be used with connected sheet docs.',
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

  // The reference to the textElement and title container id
  let textElementContainerId: ContainerID | null = null;
  let titleContainerId: ContainerID | null = null;
  if (loroDoc) {
    const container = loroDoc.getContainerById(bp.containerId) as LoroMap;
    if (container) {
      const textElementContainer = container.get('textElement') as LoroMap;
      if (textElementContainer) {
        textElementContainerId = textElementContainer.id;
      } else {
        console.log(
          "Could not find 'textElement' inside SheetTextBlock with id: " +
            bp.containerId,
        );
      }
      const titleContainer = container.get('title') as LoroMap;
      if (titleContainer) {
        titleContainerId = titleContainer.id;
      } else {
        console.log(
          "Could not find 'title' inside SheetTextBlock with id: " +
            bp.containerId,
        );
      }
    } else {
      console.log('Could not find SheetTextBlock with id: ' + bp.containerId);
    }
  }

  // State to track whether the user can edit this statement element
  const [canEdit, setCanEdit] = useState<boolean>(
    controller ? controller.canEditBlock(bp.containerId) : false,
  );
  // State to track approval info
  const [approvalState, setApprovalState] = useState<ColabApprovalState>(
    controller
      ? controller.getBlockState(bp.containerId)
      : ColabApprovalState.Draft,
  );
  const [canApprove, setCanApprove] = useState<boolean>(
    controller ? controller.hasApprovePermission(bp.containerId) : false,
  );
  const [canManage, setCanManage] = useState<boolean>(
    controller ? controller.hasManagePermission() : false,
  );
  const [hasRejected, setHasRejected] = useState<boolean>(
    controller
      ? controller.hasRejectedBlockApproval(bp.containerId, approvalKey)
      : false,
  );

  // State to track focus and hover
  const [focus, setFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showOutlines = (focus || isHovered) && canEdit;

  useEffect(() => {
    if (controller && bp.containerId && loroDoc) {
      // Update the canEdit state
      setCanEdit(controller.canEditBlock(bp.containerId));
      setApprovalState(controller.getBlockState(bp.containerId));
      setCanApprove(controller.hasApprovePermission(bp.containerId));
      setCanManage(controller.hasManagePermission());
      setHasRejected(
        controller.hasRejectedBlockApproval(bp.containerId, approvalKey),
      );

      // Subscribe to ACL changes in the loroDoc
      const aclUnsubscribe = controller.subscribeToBlockAclChanges(
        bp.containerId,
        () => {
          // On any ACL change, update the canEdit state
          setCanEdit(controller.canEditBlock(bp.containerId));
          setCanApprove(controller.hasApprovePermission(bp.containerId));
          setCanManage(controller.hasManagePermission());
        },
      );
      // Subscribe to approval changes in the loroDoc
      const approvalUnsubscribe = controller.subscribeToBlockApprovalChanges(
        bp.containerId,
        () => {
          // On any approval change, update the canEdit state
          setCanEdit(controller.canEditBlock(bp.containerId));
          setApprovalState(controller.getBlockState(bp.containerId));
          setHasRejected(
            controller.hasRejectedBlockApproval(bp.containerId, approvalKey),
          );
        },
      );

      // Cleanup subscriptions on unmount
      return () => {
        aclUnsubscribe();
        approvalUnsubscribe();
      };
    }
  }, [loroDoc, controller, bp.containerId]);

  // Handle focus change from DocEditorBlock
  const handleFocusChange = (hasFocus: boolean) => {
    setFocus(hasFocus);
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  const handleApprove = () => {
    if (!controller) {
      return;
    }
    const hasApproved = controller.approveBlock(bp.containerId, approvalKey);
    if (hasApproved) {
      controller.commit();
      setApprovalState(controller.getBlockState(bp.containerId));
    }
  };

  const handleReject = () => {
    if (!controller) {
      return;
    }
    const hasRejected = controller.rejectBlock(bp.containerId, approvalKey);
    if (hasRejected) {
      controller.commit();
      setApprovalState(controller.getBlockState(bp.containerId));
    }
  };

  const handleRevert = () => {
    if (!controller) {
      return;
    }
    const hasReverted = controller.revertBlockToDraft(bp.containerId);
    if (hasReverted) {
      controller.commit();
      setApprovalState(controller.getBlockState(bp.containerId));
    }
  };

  if (!loroDoc || !ephStoreMgr) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <DocEditorSheetBlock
          blockId={bp.id}
          blockType={'SheetTextBlock'}
          loroContainerId={bp.containerId}
          loroDoc={loroDoc}
          controller={controller}
          onFocusChange={handleFocusChange}
          onHoverChange={handleHoverChange}
          showManageControls={canManage}
          readOnly={!canEdit}
        >
          <Stack direction="column" spacing={0.5}>
            <Stack direction="row" spacing={1} flex={1}>
              <SheetTextBlockHeaderWrapper>
                <SheetTextBlockHeaderLeft>
                  {titleContainerId != null && (
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ width: '100%' }}
                    >
                      <ColabTextEditorOutlined
                        showOutlines={showOutlines}
                        loro={loroDoc as any as LoroDocType}
                        ephStoreMgr={ephStoreMgr}
                        containerId={titleContainerId}
                        spellCheck={{
                          enabled: true,
                          supported: language?.spellCheck || false,
                          orgId: organization?.id || '',
                          langCode: language?.spellCheckLangCode,
                        }}
                        schema="simple"
                        canEdit={canEdit}
                        txtDir={language?.textDirection}
                        customFonts={customFonts}
                      />
                    </Typography>
                  )}
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
                </SheetTextBlockHeaderLeft>
                <SheetTextBlockHeaderRight>
                  <ApprovalDropdown
                    state={approvalState}
                    canApprove={canApprove}
                    canManage={canManage}
                    hasRejected={hasRejected}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRevert={handleRevert}
                  />
                </SheetTextBlockHeaderRight>
              </SheetTextBlockHeaderWrapper>
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
        </DocEditorSheetBlock>
      </>
    );
  }
};

export default SheetTextBlock;
