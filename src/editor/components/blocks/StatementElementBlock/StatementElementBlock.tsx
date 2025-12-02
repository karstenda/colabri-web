import { StatementElementBlockBP } from './StatementElementBlockBP';
import { Stack } from '@mui/material';
import ColabTextEditor from '../../ColabTextEditor/ColabTextEditor';
import { useContentLanguages } from '../../../../ui/hooks/useContentLanguages/useContentLanguage';
import { useOrganization } from '../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { useColabDoc } from '../../../context/ColabDocContext/ColabDocProvider';
import { LoroDocType } from 'loro-prosemirror';
import { useEffect, useRef, useState } from 'react';
import { ContainerID, LoroMap } from 'loro-crdt';
import DocEditorBlock from '../DocEditorBlock';
import {
  ColabTextEditorOutline,
  StmtElementHeaderLeft,
  StmtElementHeaderRight,
  StmtElementHeaderWrapper,
  TypographyReadOnly,
} from './StatementElementBlockStyle';

export type StatementElementBlockProps = {
  bp: StatementElementBlockBP;
};

const StatementElementBlock = ({ bp }: StatementElementBlockProps) => {
  // Get the current ColabDoc
  const { colabDoc } = useColabDoc();

  // Get the current organization
  const organization = useOrganization();

  // Get the configured languages
  const { languages } = useContentLanguages(organization?.id);

  // Get the language
  const language = languages.find((l) => l.code === bp.langCode);

  // Get the ephemeral store manager
  const ephStoreMgr = colabDoc?.ephStoreMgr;

  // Get the LoroDoc
  const loroDoc = colabDoc?.loroDoc;

  // The reference to the text element container id
  const textElementContainerIdRef = useRef<ContainerID | null>(null);

  // State to track focus and hover
  const [focus, setFocus] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const showOutlines = focus || isHovered;

  // Handle focus change from DocEditorBlock
  const handleFocusChange = (hasFocus: boolean) => {
    setFocus(hasFocus);
  };
  const handleHoverChange = (isHovered: boolean) => {
    setIsHovered(isHovered);
  };

  // Load the textElment
  useEffect(() => {
    // Ensure we have the LoroDoc
    if (!loroDoc) {
      return;
    }

    // Get the textElementContainer
    const container = loroDoc.getContainerById(bp.containerId) as LoroMap;
    if (!container) {
      console.log('Could not find StatementElement with id: ' + bp.containerId);
    }
    const textElementContainer = container?.get('textElement') as LoroMap;
    if (!textElementContainer) {
      console.log(
        "Could not find 'textElement' inside StatementElement with id: " +
          bp.containerId,
      );
    }
    textElementContainerIdRef.current = textElementContainer.id;
  }, [loroDoc]);

  if (!loroDoc || !ephStoreMgr) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <DocEditorBlock
          blockId={bp.id}
          onFocusChange={handleFocusChange}
          onHoverChange={handleHoverChange}
          showUpDownControls={true}
        >
          <Stack direction="column" spacing={0.5}>
            <Stack direction="row" spacing={1} flex={1}>
              <StmtElementHeaderWrapper>
                <StmtElementHeaderLeft>
                  <TypographyReadOnly variant="h6">
                    {language?.name}
                  </TypographyReadOnly>
                </StmtElementHeaderLeft>
                <StmtElementHeaderRight></StmtElementHeaderRight>
              </StmtElementHeaderWrapper>
            </Stack>
            {textElementContainerIdRef.current != null && (
              <ColabTextEditorOutline showOutlines={showOutlines}>
                <ColabTextEditor
                  loro={loroDoc as LoroDocType}
                  ephStoreMgr={ephStoreMgr}
                  containerId={textElementContainerIdRef.current}
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
