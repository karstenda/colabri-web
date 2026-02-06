import { Box, useTheme } from '@mui/material';
import { ColabStatementModel } from '../../../api/ColabriAPI';
import { useColorScheme } from '../../hooks/useColorScheme/useColorScheme';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import {
  useContentLanguages,
  usePlatformContentLanguages,
} from '../../hooks/useContentLanguages/useContentLanguage';
import { ContentLanguage } from '../../../editor/data/ContentLanguage';
import { useGoogleFonts } from '../../hooks/useFonts/useFonts';
import {
  getApprovalColor,
  getApprovalStateFromApprovals,
} from '../../../editor/data/Approval';
import { textElementToHTML } from '../../../editor/util/ProseMirrorContentUtil';
import { useTranslation } from 'react-i18next';

export type StatementsOverviewElementCellProps = {
  statement: ColabStatementModel;
  langCode: string;
};

const StatementsOverviewElementCell = (
  props: StatementsOverviewElementCellProps,
) => {
  const { mode } = useColorScheme();
  const theme = useTheme();
  const organization = useOrganization();
  const { t } = useTranslation();

  // Get the configured languages
  const { languages, isLoading: isLanguagesLoading } = useContentLanguages(
    organization?.id,
  );

  // Get the language
  let language: ContentLanguage | undefined = languages.find(
    (l) => l.code === props.langCode,
  );
  // If not found, try to get it from platform languages
  const { languages: platformLanguages } = usePlatformContentLanguages(
    !language && !isLanguagesLoading,
  );
  if (!language && !isLanguagesLoading) {
    language = platformLanguages.find((l) => l.code === props.langCode);
  }

  // Get the approval state of the statement element
  const approvals = props.statement.content[props.langCode]?.approvals;
  const approvalState = getApprovalStateFromApprovals(approvals);

  // Get the text of the element
  const textElement = props.statement.content[props.langCode]?.textElement;
  const elementHTML = textElement ? textElementToHTML(textElement) : undefined;

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

  // If the element is empty, return an empty cell with the appropriate height
  if (!elementHTML) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.text.secondary,
        }}
      >
        {t('common.na')}
      </Box>
    );
  }
  // Otherwise, render the element with the appropriate styling based on the approval state
  else {
    return (
      <Box
        sx={{
          padding: '0px',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            height: '100%',
            flexGrow: 0,
            minWidth: '10px',
            backgroundColor: getApprovalColor(approvalState, mode, false),
          }}
        ></Box>
        <Box
          sx={{
            height: '100%',
            paddingLeft: '8px',
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingRight: '8px',
            flexGrow: 1,
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <div
            dir={language?.textDirection || ''}
            style={{ fontFamily: customFonts.join(', ') }}
            dangerouslySetInnerHTML={{ __html: elementHTML }}
          ></div>
        </Box>
      </Box>
    );
  }
};

export default StatementsOverviewElementCell;
