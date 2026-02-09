import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LinkIcon from '@mui/icons-material/Link';

export type LiveReferenceTagProps = {
  onClick: () => void;
};

const LiveReferenceTag = ({ onClick }: LiveReferenceTagProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tooltip title={t('editor.liveReferenceTag.tooltip')}>
      <span>
        <IconButton
          aria-label="close"
          onClick={onClick}
          disabled={true}
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
