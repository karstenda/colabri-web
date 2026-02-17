import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LinkIcon from '@mui/icons-material/Link';
import { useOrganization } from '../../../ui/context/UserOrganizationContext/UserOrganizationProvider';

export type LiveReferenceTagProps = {
  stmtDocId: string;
  onClick: () => void;
};

const LiveReferenceTag = ({ onClick, stmtDocId }: LiveReferenceTagProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const organization = useOrganization();

  const handleClick = () => {
    onClick();
    window.open(`/#/org/${organization?.id}/statements/${stmtDocId}`, '_blank');
  };

  return (
    <Tooltip title={t('editor.liveReferenceTag.tooltip')}>
      <span>
        <IconButton
          aria-label="close"
          onClick={handleClick}
          sx={{
            width: 32,
            height: 32,
            border: `1px solid #dadee7`,
            padding: 0,
            ...theme.applyStyles('dark', {
              border: `1px solid #333b4d`,
            }),
          }}
        >
          <LinkIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default LiveReferenceTag;
