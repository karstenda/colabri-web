import { useTranslation } from 'react-i18next';
import { Permission } from '../../data/Permission';
import { PermissionViewerTable } from './PermissionViewerStyles';
import TableBody from '@mui/material/TableBody';
import ResolvedPrplsProvider from '../../context/PrplsContext/ResolvedPrplsProvider';
import PermissionViewableTableRow from './PermissionViewableTableRow';

export type PermissionViewerProps = {
  aclMap: Record<Permission, string[]>;
};

const PermissionViewer = ({ aclMap }: PermissionViewerProps) => {
  const { t } = useTranslation();

  const prplsByPermission: Record<string, Set<Permission>> = {};

  // Invert the map
  Object.entries(aclMap).forEach(([permission, prplIds]) => {
    prplIds.forEach((prplId) => {
      if (!prplsByPermission[prplId]) {
        prplsByPermission[prplId] = new Set<Permission>();
      }
      prplsByPermission[prplId].add(permission as Permission);
    });
  });

  return (
    <ResolvedPrplsProvider prpls={Object.keys(prplsByPermission)}>
      <PermissionViewerTable>
        <TableBody>
          {Object.entries(prplsByPermission).map(([prpl, permissions]) => (
            <PermissionViewableTableRow prpl={prpl} permissions={permissions} />
          ))}
        </TableBody>
      </PermissionViewerTable>
    </ResolvedPrplsProvider>
  );
};

export default PermissionViewer;
