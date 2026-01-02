import { StatementElementBlockBP } from './StatementElementBlockBP';
import { Stack } from '@mui/material';
import ColabTextEditor from '../../ColabTextEditor/ColabTextEditor';
import { useContentLanguages } from '../../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
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
import ManageStmtLangModal, {
  ManageStmtLangModalPayload,
} from '../../ManageStmtLangModal/ManageStmtLangModel';
import { ConnectedStmtDoc } from '../../../data/ConnectedColabDoc';
import { Permission } from '../../../../ui/data/Permission';
import ApprovalDropdown from '../../ApprovalDropdown/ApprovalDropdown';
import { ColabApprovalState } from '../../../../api/ColabriAPI';
import { useGoogleFonts } from '../../../../ui/hooks/useFonts/useFonts';

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

  // Get the configured languages
  const { languages } = useContentLanguages(organization?.id);

  // Get the dialogs hook
  const dialogs = useDialogs();

  // Get the language
  const language = languages.find((l) => l.code === bp.langCode);

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
  const [canEdit, setCanEdit] = useState<boolean>(
    controller ? controller.canEditStatementElement(bp.langCode) : false,
  );

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
    setFocus(hasFocus);
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  const handleManageElement = async () => {
    if (!loroDoc || !language) {
      return;
    }

    // Open the modal to manage the statement element
    const newStmtElementAclMaps = await dialogs.open<
      ManageStmtLangModalPayload,
      Record<Permission, string[]> | undefined
    >(ManageStmtLangModal, {
      loroDoc: loroDoc!,
      contentLanguage: language!,
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
                    {language?.name}
                  </TypographyReadOnly>
                </StmtElementHeaderLeft>
                <StmtElementHeaderRight>
                  <ApprovalDropdown
                    controller={controller}
                    langCode={bp.langCode}
                  />
                </StmtElementHeaderRight>
              </StmtElementHeaderWrapper>
            </Stack>
            {textElementContainerId != null && (
              <ColabTextEditorOutline showOutlines={showOutlines}>
                <ColabTextEditor
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
              </ColabTextEditorOutline>
            )}
          </Stack>
        </DocEditorBlock>
      </>
    );
  }
};

export default StatementElementBlock;
