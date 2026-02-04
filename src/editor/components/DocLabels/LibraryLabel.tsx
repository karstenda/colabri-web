import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { DocContainer } from '../../data/DocContainer';
import { useLibrary } from '../../../ui/hooks/useLibraries/useLibraries';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { getApprovalColor } from '../../data/Approval';
import { useColorScheme } from '../../../ui/hooks/useColorScheme/useColorScheme';
import { useMemo } from 'react';

export const LibraryLabelWrapper = styled(Box)(({ theme }) => ({
  color: (theme.vars || theme).palette.text.secondary,
  padding: theme.spacing(0.5, 1),
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  maxWidth: '100px',
  textWrap: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}));

export type LibraryLabelProps = {
  container: DocContainer;
};

const LibraryLabel: React.FC<LibraryLabelProps> = ({ container }) => {
  const { t } = useTranslation();
  const { mode } = useColorScheme();
  const theme = useTheme();
  const organization = useOrganization();
  const { library } = useLibrary(organization?.id || '', container.id);

  const backgroundColor = useMemo(
    () => getApprovalColor('approved', mode, false),
    [mode],
  );
  const textColor = useMemo(
    () => theme.palette.getContrastText(backgroundColor),
    [backgroundColor, theme],
  );

  if (!library) {
    return <></>;
  } else {
    return (
      <Tooltip
        title={t('common.library')}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -10],
                },
              },
            ],
          },
        }}
      >
        <LibraryLabelWrapper
          sx={{
            backgroundColor: backgroundColor,
            color: textColor,
          }}
        >
          {library?.name}
        </LibraryLabelWrapper>
      </Tooltip>
    );
  }
};

export default LibraryLabel;
