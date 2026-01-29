import { useTranslation } from 'react-i18next';
import { Permission } from '../../data/Permission';
import IdentityDisplay from '../IdentityDisplay/IdentityDisplay';
import {
  PermissionViewerTableCellLeft,
  PermissionViewerTableCellRight,
  PermissionViewerTableRow,
} from './PermissionViewerStyles';
import { useCachedResolvedPrpl } from '../../context/PrplsContext/ResolvedPrplsProvider';

export type PermissionViewableTableRowProps = {
  prpl: string;
  permissions: Set<Permission>;
};

const PermissionViewableTableRow = ({
  prpl,
  permissions,
}: PermissionViewableTableRowProps) => {
  const { t } = useTranslation();
  const resolvedPrpl = useCachedResolvedPrpl(prpl);

  return (
    <PermissionViewerTableRow key={prpl}>
      <PermissionViewerTableCellLeft>
        <IdentityDisplay size="medium" resolvedPrpl={resolvedPrpl} />
      </PermissionViewerTableCellLeft>
      <PermissionViewerTableCellRight>
        {Array.from(permissions)
          .map((permission) => t(`permissions.${permission as Permission}`))
          .join(', ')}
      </PermissionViewerTableCellRight>
    </PermissionViewerTableRow>
  );
};

export default PermissionViewableTableRow;
