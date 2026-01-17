import IdentityDisplay from '../IdentityDisplay/IdentityDisplay';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from '../../data/Permission';
import { ResolvedPrplOption } from '../../context/PrplsContext/ResolvedPrplsProvider';
import {
  PermissionEditorTableCellLeft,
  PermissionEditorTableCellRight,
  PermissionEditorTableRow,
} from './PermissionEditorStyles';
import MenuList from '@mui/material/MenuList';

export type PermissionsTableRowProps = {
  resolvedPrpl: ResolvedPrplOption;
  permissions: Set<Permission>; // Map of prpls with their permissions
  fixedPermissions: Set<Permission>; // Map of prpls with fixed permissions
  availablePermissions?: Record<string, Set<Permission>>; // Sections and their permissions
  onChange?: (prpl: string, newPermissions: Set<Permission>) => void;
};

const PermissionsTableRow = (props: PermissionsTableRowProps) => {
  const { t } = useTranslation();

  // State to track selected permissions
  const [permissions, setPermissions] = useState<Set<Permission>>(
    props.permissions,
  );

  // Calculate a flat list of all permissions
  let allPermissions = new Set<Permission>();
  Object.keys(props.availablePermissions || {}).forEach((permission) => {
    allPermissions.add(permission as Permission);
  });
  // Take the union of the available permissions and the current permisions.
  allPermissions = props.availablePermissions
    ? new Set<Permission>([
        ...Array.from(allPermissions),
        ...Array.from(props.permissions),
      ])
    : new Set<Permission>(Array.from(props.permissions));

  const allDisplayedPermissions = new Set<Permission>([
    ...Array.from(permissions),
    ...Array.from(props.fixedPermissions),
  ]);

  // On permission change
  const handlePermissionChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    let selectedPermissions =
      typeof value === 'string' ? value.split(',') : value;

    // Subtract fixed permissions to avoid unintentional changes
    selectedPermissions = selectedPermissions.filter(
      (p) => !props.fixedPermissions.has(p as Permission),
    );

    // Update the state
    setPermissions(new Set(selectedPermissions as Permission[]));
    if (props.onChange) {
      props.onChange(
        props.resolvedPrpl.prpl,
        new Set(selectedPermissions as Permission[]),
      );
    }
  };

  return (
    <PermissionEditorTableRow>
      <PermissionEditorTableCellLeft>
        <IdentityDisplay size="medium" resolvedPrpl={props.resolvedPrpl} />
      </PermissionEditorTableCellLeft>
      <PermissionEditorTableCellRight>
        <Select
          multiple
          value={Array.from(allDisplayedPermissions)}
          onChange={handlePermissionChange}
          renderValue={(selected) => {
            const translated = selected.map((permission) =>
              t(`permissions.${permission as Permission}`),
            );
            const translatedFixed = selected.map((permission) =>
              t(`permissions.${permission as Permission}`),
            );
            const allTranslated = Array.from(
              new Set([...translated, ...translatedFixed]),
            );
            return (
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {allTranslated.join(', ')}
              </div>
            );
          }}
          fullWidth
        >
          {props.availablePermissions != undefined ? (
            Object.keys(props.availablePermissions).map((section) => {
              const sectionAvailablePermissions = Array.from(
                props.availablePermissions
                  ? props.availablePermissions[section]
                  : [],
              );

              const entries = [];
              if (section !== 'default') {
                entries.push(
                  <ListSubheader key={section}>{section}</ListSubheader>,
                );
              }

              const items = sectionAvailablePermissions.map((permission) => {
                const isFixed = props.fixedPermissions.has(permission);
                return (
                  <MenuItem
                    key={permission}
                    value={permission}
                    disabled={isFixed}
                    sx={{ py: 0, px: 0, mb: 0.5 }}
                  >
                    <Checkbox
                      checked={permissions.has(permission)}
                      disabled={isFixed}
                    />
                    <ListItemText
                      primary={t(`permissions.${permission as Permission}`)}
                    />
                  </MenuItem>
                );
              });
              entries.push(...items);

              return entries;
            })
          ) : (
            <></>
          )}
        </Select>
      </PermissionEditorTableCellRight>
    </PermissionEditorTableRow>
  );
};
export default PermissionsTableRow;
