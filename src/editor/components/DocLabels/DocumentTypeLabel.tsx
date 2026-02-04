import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { DocumentType } from '../../../api/ColabriAPI';
import { useLibrary } from '../../../ui/hooks/useLibraries/useLibraries';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';

export const DocumentTypeLabelWrapper = styled(Box)(({ theme }) => ({
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

export type DocumentTypeLabelProps = {
  docType: DocumentType;
};

const DocumentTypeLabel: React.FC<DocumentTypeLabelProps> = ({ docType }) => {
  const { t } = useTranslation();

  let label = '';
  switch (docType) {
    case DocumentType.DocumentTypeColabStatement:
      label = t('statements.type');
      break;
    case DocumentType.DocumentTypeColabSheet:
      label = t('sheets.type');
      break;
    default:
      label = t('common.unknown');
  }

  return (
    <Tooltip
      title={t('common.documentType')}
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
      <DocumentTypeLabelWrapper>{label}</DocumentTypeLabelWrapper>
    </Tooltip>
  );
};

export default DocumentTypeLabel;
