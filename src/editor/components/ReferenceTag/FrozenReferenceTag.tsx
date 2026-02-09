import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FreezeUpIcon from '../icons/FreezeUpIcon';
import { useColabDoc } from '../../context/ColabDocContext/ColabDocProvider';
import { FrozenStmtDoc } from '../../data/ColabDoc';
import { PeerID, VersionVector } from 'loro-crdt';

export type FronzeReferenceTagProps = {
  onClick: () => void;
};

const FrozenReferenceTag = ({ onClick }: FronzeReferenceTagProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { colabDoc } = useColabDoc();

  if (!(colabDoc instanceof FrozenStmtDoc)) {
    throw new Error(
      'FrozenReferenceTag can only be used within frozen documents.',
    );
  }

  const stmtDoc = colabDoc.getStatementDoc();
  const refVersion = colabDoc.getVersion();
  const refVersionV = colabDoc.getVersionV();

  // Get the latest version and version vector from the document
  const latestVersion = Math.max(
    ...Object.entries(stmtDoc.streams).map(([key, value]) => {
      if (key === 'main') {
        return value.version;
      } else {
        return 0;
      }
    }),
  );
  const latestVersionV = new VersionVector(
    new Map(Object.entries(stmtDoc.versionV) as [PeerID, number][]),
  );

  const isLatest =
    refVersion === latestVersion && refVersionV.compare(latestVersionV) === 0;

  return (
    <Tooltip
      title={
        isLatest
          ? t('editor.frozenReferenceTag.latest')
          : t('editor.frozenReferenceTag.notLatest')
      }
    >
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
          {isLatest && <AcUnitIcon />}
          {!isLatest && <FreezeUpIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default FrozenReferenceTag;
