import { Box, useTheme } from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { LoroDocType } from 'loro-prosemirror';
import { ContainerID } from 'loro-crdt';
import ColabTextEditor, {
  ColabTextEditorHandle,
} from '../../../ColabTextEditor/ColabTextEditor';
import { getApprovalColor } from '../../../../data/Approval';
import { useColorScheme } from '../../../../../ui/hooks/useColorScheme/useColorScheme';
import { ColabApprovalState } from '../../../../../api/ColabriAPI';
import ColabEphemeralStoreManager from '../../../ColabDocEditor/EphemeralStoreManager';
import { useOrganization } from '../../../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import {
  useContentLanguages,
  usePlatformContentLanguages,
} from '../../../../../ui/hooks/useContentLanguages/useContentLanguage';
import { ContentLanguage } from '../../../../data/ContentLanguage';
import { useGoogleFonts } from '../../../../../ui/hooks/useFonts/useFonts';
import { useActiveCell } from '../../context/StatementGridEditorContextProvider';

export type StmtElementEditCellProps = {
  loroDoc: LoroDocType;
  ephStoreMgr: ColabEphemeralStoreManager;
  textElementContainerId: ContainerID;
  canEdit: boolean;
  approvalState: ColabApprovalState;
  langCode: string;
  hasFocus?: boolean;
};

const StmtElementEditCell = (props: StmtElementEditCellProps) => {
  const { mode } = useColorScheme();
  const theme = useTheme();
  const organization = useOrganization();
  const hasFocus = props.hasFocus || false;

  // Get the configured languages
  const { languages, isLoading: isLanguagesLoading } = useContentLanguages(
    organization?.id,
  );

  // Get the language
  let language: ContentLanguage | undefined = languages.find(
    (l) => l.code === props.langCode,
  );
  // If not found, try to get it from platform languages
  let isNonOrgContentLanguages = false;
  const { languages: platformLanguages } = usePlatformContentLanguages(
    !language && !isLanguagesLoading,
  );
  if (!language && !isLanguagesLoading) {
    language = platformLanguages.find((l) => l.code === props.langCode);
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

  // A reference to the editor
  const editorRef = useRef<ColabTextEditorHandle>(null);

  return (
    <Box
      sx={{
        padding: '0px',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: props.canEdit
          ? (theme.vars || theme).palette.background.default
          : (theme.vars || theme).palette.background.paper,
      }}
      onClick={(e) => {
        // Check if the focus is already inside the editor
        if (editorRef.current?.view?.hasFocus()) {
          return;
        } else {
          editorRef.current?.view?.focus();
        }
      }}
    >
      <Box
        sx={{
          height: '100%',
          flexGrow: 0,
          minWidth: '8px',
          backgroundColor: getApprovalColor(props.approvalState, mode, false),
          borderColor: hasFocus
            ? (theme.vars || theme).palette.primary.main
            : 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: '1px',
          borderTopWidth: '1px',
          borderBottomWidth: '1px',
          borderRightWidth: '0px',
        }}
      ></Box>
      <Box
        sx={{
          height: '100%',
          paddingLeft: '8px',
          paddingTop: '14px',
          paddingBottom: '14px',
          paddingRight: '8px',
          borderColor: hasFocus
            ? (theme.vars || theme).palette.primary.main
            : 'transparent',
          borderStyle: 'solid',
          borderRightWidth: '1px',
          borderTopWidth: '1px',
          borderBottomWidth: '1px',
          borderLeftWidth: '0px',
          flexGrow: 1,
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          // Intercept all keyboard events to to not trigger special shortcuts in the data grid component
          e.stopPropagation();
        }}
      >
        <ColabTextEditor
          ref={editorRef}
          loro={props.loroDoc}
          ephStoreMgr={props.ephStoreMgr}
          containerId={props.textElementContainerId}
          canEdit={props.canEdit}
          spellCheck={{
            enabled: true,
            supported: language?.spellCheck || false,
            orgId: organization?.id || '',
            langCode: language?.spellCheckLangCode,
          }}
          txtDir={language?.textDirection}
          customFonts={customFonts}
        />
      </Box>
    </Box>
  );
};

export default StmtElementEditCell;
