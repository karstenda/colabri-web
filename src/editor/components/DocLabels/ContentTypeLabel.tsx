import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { ContentType } from '../../../api/ColabriAPI';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';

export const ContentTypeLabelWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.grey[200],
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

export type ContentTypeLabelProps = {
  contentType: ContentType | null;
};

const ContentTypeLabel: React.FC<ContentTypeLabelProps> = ({ contentType }) => {
  const { t } = useTranslation();

  if (!contentType) {
    return <></>;
  } else {
    return (
      <Tooltip
        placement="top"
        title={t('common.contentType')}
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
        <ContentTypeLabelWrapper>{contentType.name}</ContentTypeLabelWrapper>
      </Tooltip>
    );
  }
};

export default ContentTypeLabel;
