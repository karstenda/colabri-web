import { useCachedResolvedPrpls } from '../../context/PrplsContext/ResolvedPrplsProvider';
import PermissionsTableRow, {
  PermissionEditableTableRowProps,
} from './PermissionEditableTableRow';
import { ResolvedPrpl } from '../../../api/ColabriAPI';
import { Permission } from '../../data/Permission';
import { TableBody } from '@mui/material';
import { useEffect, useState } from 'react';
import { PermissionEditorTable } from './PermissionEditorStyles';
import PermissionEditableTableRow from './PermissionEditableTableRow';

type PermissionsEditableTableProps = {
  identities: Record<string, ResolvedPrpl>;
  permissionsMap: Record<string, Set<Permission>>; // Map of prpls with their permissions
  onPermissionsMapChange: (
    newPermissionMap: Record<string, Set<Permission>>,
  ) => void;
  fixedPermissionMap: Record<string, Set<Permission>>; // Map of prpls with fixed permissions
  availablePermissions?: Record<string, Set<Permission>>; // Map of sections and permissions
};

const PermissionsEditableTable = (props: PermissionsEditableTableProps) => {
  // Generate the set of all prpls to display (the union of permissionMap and fixedPermissionMap)
  const allPrpls = new Set<string>([
    ...Object.keys(props.permissionsMap),
    ...Object.keys(props.fixedPermissionMap),
  ]);

  // Resolve these prpls
  const resolvedPrpls = useCachedResolvedPrpls(Array.from(allPrpls));

  // Handle a row change
  const onRowChange = (prplId: string, newPermissions: Set<Permission>) => {
    // Update the state
    const newPermissionsMap = { ...props.permissionsMap };
    newPermissionsMap[prplId] = newPermissions;
    props.onPermissionsMapChange(newPermissionsMap);
  };

  // Run over the list of permissions and construct properties for the rows
  const rowProperties = [] as PermissionEditableTableRowProps[];
  allPrpls.forEach((prpl) => {
    rowProperties.push({
      resolvedPrpl: resolvedPrpls[prpl],
      permissions: props.permissionsMap[prpl] ?? new Set(),
      fixedPermissions: props.fixedPermissionMap[prpl] ?? new Set(),
      availablePermissions: props.availablePermissions,
      onChange: onRowChange,
    });
  });

  return (
    <PermissionEditorTable>
      <TableBody>
        {rowProperties.map((rowProp) => (
          <PermissionEditableTableRow
            key={rowProp.resolvedPrpl.prpl}
            {...rowProp}
          />
        ))}
      </TableBody>
    </PermissionEditorTable>
  );
};
export default PermissionsEditableTable;
