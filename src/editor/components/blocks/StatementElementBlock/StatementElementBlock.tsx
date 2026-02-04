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
import { use, useEffect, useState } from 'react';
import { ContainerID, LoroMap } from 'loro-crdt';
import DocEditorBlock from '../DocEditorBlock';
import {
  StmtElementHeaderLeft,
  StmtElementHeaderRight,
  StmtElementHeaderWrapper,
  TypographyReadOnly,
} from './StatementElementBlockStyle';
import { useDialogs } from '../../../../ui/hooks/useDialogs/useDialogs';
import { ConnectedStmtDoc } from '../../../data/ConnectedColabDoc';
import ErrorIcon from '@mui/icons-material/Error';
import { useGoogleFonts } from '../../../../ui/hooks/useFonts/useFonts';
import { ContentLanguage } from '../../../data/ContentLanguage';
import { t } from 'i18next';
import ColabTextEditorOutlined from '../../ColabTextEditor/ColabTextEditorOutlined';
import {
  useActiveStatementElement,
  useSetActiveStatementElement,
} from '../../../context/ColabDocEditorContext/ColabDocEditorProvider';
import StatementApprovalDropdown from '../../ApprovalDropdown/StmtApprovalDropdown';
import ManageModal from '../../ManageModal/ManageModal';
import { ManageStatementElementModalPayload } from '../../ManageModal/ManageModalPayloads';

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

  // Hook to set the active statement element
  const setActiveStatementElement = useSetActiveStatementElement();

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

  // State to track focus and hover
  const [focus, setFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showOutlines = (focus || isHovered) && canEdit;

  useEffect(() => {
    if (controller && bp.langCode && loroDoc) {
      // Update the canEdit state
      setCanEdit(controller.canEditStatementElement(bp.langCode));

      // Subscribe to ACL changes in the loroDoc
      const aclUnsubscribe = controller.subscribeToStatementElementAclChanges(
        bp.langCode,
        () => {
          // On any ACL change, update the canEdit state
          setCanEdit(controller.canEditStatementElement(bp.langCode));
        },
      );
      // Subscribe to approval changes in the loroDoc
      const approvalUnsubscribe =
        controller.subscribeToStatementElementApprovalChanges(
          bp.langCode,
          () => {
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
    // Set the focus state
    setFocus(hasFocus);

    if (hasFocus) {
      // Set the active statement element in the editor context
      setActiveStatementElement({
        langCode: bp.langCode,
        colabDoc: colabDoc,
      });
    } else {
      setActiveStatementElement((current) => {
        if (current?.langCode === bp.langCode) {
          return null;
        }
        return current;
      });
    }
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  const handleManageElement = async () => {
    if (!loroDoc || !language || !controller) {
      return;
    }
    // Open the modal to manage the statement element
    await dialogs.open<ManageStatementElementModalPayload, void>(ManageModal, {
      type: 'statement-element',
      title: t('editor.manageModal.localizationTitle', {
        localization: language?.name || bp.langCode,
      }),
      stmtDocController: controller,
      langCode: bp.langCode,
      readOnly: bp.readOnly,
    });
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
          colabDoc={colabDoc}
          onFocusChange={handleFocusChange}
          onHoverChange={handleHoverChange}
          showUpDownControls={false}
          onManageBlock={handleManageElement}
          editable={canEdit}
          readOnly={bp.readOnly}
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
                  <StatementApprovalDropdown
                    langCode={bp?.langCode}
                    controller={controller}
                    readOnly={bp.readOnly}
                  />
                </StmtElementHeaderRight>
              </StmtElementHeaderWrapper>
            </Stack>
            {textElementContainerId != null && (
              <ColabTextEditorOutlined
                showOutlines={showOutlines && !bp.readOnly}
                loro={loroDoc as any as LoroDocType}
                ephStoreMgr={ephStoreMgr}
                containerId={textElementContainerId}
                spellCheck={{
                  enabled: true,
                  supported: language?.spellCheck || false,
                  orgId: organization?.id || '',
                  langCode: language?.spellCheckLangCode,
                }}
                canEdit={canEdit && !bp.readOnly}
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
