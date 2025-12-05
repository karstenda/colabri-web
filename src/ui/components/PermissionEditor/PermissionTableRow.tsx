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

export type PermissionsTableRowProps = {
  resolvedPrpl: ResolvedPrplOption;
  permissions: Set<Permission>;
  fixedPermissions: Set<Permission>;
  availablePermissions?: Set<Permission>;
  onChange?: (prpl: string, newPermissions: Set<Permission>) => void;
};

const PermissionsTableRow = (props: PermissionsTableRowProps) => {
  const { t } = useTranslation();

  // State to track selected permissions
  const [permissions, setPermissions] = useState<Set<Permission>>(
    props.permissions,
  );

  // Take the union of the available permissions and the current permisions.
  const allPermissions = props.availablePermissions
    ? new Set<Permission>([
        ...Array.from(props.availablePermissions),
        ...Array.from(props.permissions),
      ])
    : new Set<Permission>(Array.from(props.permissions));

  // Group permissions into sections
  const generalPermissions = [
    Permission.Manage,
    Permission.View,
    Permission.AddRemove,
    Permission.Delete,
  ];
  const contentPermissions = [Permission.Edit, Permission.Approve];

  const availableGeneralPermissions = generalPermissions.filter((p) =>
    allPermissions.has(p),
  );
  const availableContentPermissions = contentPermissions.filter((p) =>
    allPermissions.has(p),
  );

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
          {availableGeneralPermissions.length > 0 && (
            <ListSubheader>{t('permissions.sections.document')}</ListSubheader>
          )}
          {availableGeneralPermissions.map((permission) => {
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
          })}

          {availableContentPermissions.length > 0 && (
            <ListSubheader>{t('permissions.sections.language')}</ListSubheader>
          )}
          {availableContentPermissions.map((permission) => {
            const isFixed = props.fixedPermissions.has(permission);
            return (
              <MenuItem
                key={permission}
                value={permission}
                disabled={isFixed}
                sx={{ py: 0, px: 0, mb: 0.5 }}
              >
                <Checkbox
                  checked={
                    permissions.has(permission) ||
                    props.fixedPermissions.has(permission)
                  }
                  disabled={props.fixedPermissions.has(permission)}
                />
                <ListItemText
                  primary={t(`permissions.${permission as Permission}`)}
                />
              </MenuItem>
            );
          })}
        </Select>
      </PermissionEditorTableCellRight>
    </PermissionEditorTableRow>
  );
};
export default PermissionsTableRow;
