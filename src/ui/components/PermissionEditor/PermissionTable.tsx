import { useCachedResolvedPrpls } from '../../context/PrplsContext/ResolvedPrplsProvider';
import PermissionsTableRow, {
  PermissionsTableRowProps,
} from './PermissionTableRow';
import { ResolvedPrpl } from '../../../api/ColabriAPI';
import { Permission } from '../../data/Permission';
import { TableBody } from '@mui/material';
import { useState } from 'react';
import { PermissionEditorTable } from './PermissionEditorStyles';

type PermissionsTableProps = {
  identities: Record<string, ResolvedPrpl>;
  permissionMap: Record<string, Set<Permission>>; // Map of prpls with their permissions
  fixedPermissionMap: Record<string, Set<Permission>>; // Map of prpls with fixed permissions
  availablePermissions?: Record<string, Set<Permission>>; // Map of sections and permissions
  onChange?: (newPermissionMap: Record<string, Set<Permission>>) => void;
};

const PermissionsTable = (props: PermissionsTableProps) => {
  // Generate the set of all prpls to display (the union of permissionMap and fixedPermissionMap)
  const allPrpls = new Set<string>([
    ...Object.keys(props.permissionMap),
    ...Object.keys(props.fixedPermissionMap),
  ]);

  // Resolve these prpls
  const resolvedPrpls = useCachedResolvedPrpls(Array.from(allPrpls));

  const [permissionMap, setPermissionMap] = useState<
    Record<string, Set<Permission>>
  >(props.permissionMap);

  // Handle a row change
  const onRowChange = (prplId: string, newPermissions: Set<Permission>) => {
    // Update the state
    const newPermissionMap = { ...permissionMap };
    newPermissionMap[prplId] = newPermissions;
    setPermissionMap(newPermissionMap);

    // Notify the change
    if (props.onChange) {
      props.onChange(newPermissionMap);
    }
  };

  // Run over the list of permissions and construct properties for the rows
  const rowProperties = [] as PermissionsTableRowProps[];
  allPrpls.forEach((prpl) => {
    rowProperties.push({
      resolvedPrpl: resolvedPrpls[prpl],
      permissions: props.permissionMap[prpl] ?? new Set(),
      fixedPermissions: props.fixedPermissionMap[prpl] ?? new Set(),
      availablePermissions: props.availablePermissions,
      onChange: onRowChange,
    });
  });

  return (
    <PermissionEditorTable>
      <TableBody>
        {rowProperties.map((rowProp) => (
          <PermissionsTableRow key={rowProp.resolvedPrpl.prpl} {...rowProp} />
        ))}
      </TableBody>
    </PermissionEditorTable>
  );
};
export default PermissionsTable;
