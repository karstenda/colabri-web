import { useEffect, useState } from 'react';
import ResolvedPrplsProvider from '../../context/PrplsContext/ResolvedPrplsProvider';
import { AssigneeSelector } from '../AssigneeSelector';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { Permission } from '../../data/Permission';
import { toResolvedPrpl } from '../../data/Common';
import { ResolvedPrpl } from '../../../api/ColabriAPI';
import { PermissionEditorDivider } from './PermissionEditorStyles';
import { Assignee } from '../../data/Common';
import PermissionEditableTable from './PermissionEditableTable';

type PermissionEditorProps = {
  helperText?: string;
  availablePermissions: Record<string, Set<Permission>>;
  defaultPermission: Permission;
  aclMap: Record<Permission, string[]>;
  aclFixedMap?: Record<Permission, string[]>;
  onAclChange?: (newAclMap: Record<Permission, string[]>) => void;
};

// Utility to convert an ACL map to a prpl-permissions map
const aclMapToPrplPermissionsMap = (aclMap: Record<Permission, string[]>) => {
  const result = {} as Record<string, Set<Permission>>;
  Object.entries(aclMap).forEach(([permission, prpls]) => {
    prpls.forEach((prpl) => {
      if (!result.hasOwnProperty(prpl)) {
        result[prpl] = new Set<Permission>();
      }
      result[prpl].add(permission as Permission);
    });
  });
  return result;
};

const prplPermissionsMaptoAclMap = (
  prplPermissionsMap: Record<string, Set<Permission>>,
) => {
  const result = {} as Record<Permission, string[]>;
  Object.entries(prplPermissionsMap).forEach(([prpl, permissions]) => {
    permissions.forEach((permission) => {
      if (!result.hasOwnProperty(permission)) {
        result[permission] = [];
      }
      result[permission].push(prpl);
    });
  });
  return result;
};

const PermissionEditor = (props: PermissionEditorProps) => {
  const organization = useOrganization();

  // The user interface is going to list all the prpls with their permissions.
  // So we need to transform the aclMap to a map of prpls with their permissions.
  const [permissionsMap, setPermissionsMap] = useState<
    Record<string, Set<Permission>>
  >(aclMapToPrplPermissionsMap(props.aclMap));

  // Calculate a flat list of all permissions
  const allPermissions = new Set<Permission>();
  Object.keys(props.availablePermissions).forEach((section) => {
    Array.from(props.availablePermissions[section]).forEach((permission) => {
      allPermissions.add(permission);
    });
  });

  // When a new assignee is selected, remember their identity and pass it to children so they don't need to resolve it again based on the prpl.
  const [knownIdentities, setKnownIdentities] = useState<
    Record<string, ResolvedPrpl>
  >({});

  // Let's also create one for the fixed permissions
  const fixedPrplPermissionsMap = {} as Record<string, Set<Permission>>;
  if (props.aclFixedMap) {
    Object.entries(props.aclFixedMap).forEach(([permission, prpls]) => {
      // Ignore permissions that do not apply to this editor
      if (!allPermissions.has(permission as Permission)) {
        return;
      }
      // Register the fixed permissions
      prpls.forEach((prpl) => {
        if (!fixedPrplPermissionsMap.hasOwnProperty(prpl)) {
          fixedPrplPermissionsMap[prpl] = new Set<Permission>();
        }
        fixedPrplPermissionsMap[prpl].add(permission as Permission);
      });
    });
  }

  // Listen to changes in the aclMap prop
  useEffect(() => {
    setPermissionsMap(aclMapToPrplPermissionsMap(props.aclMap));
  }, [props.aclMap]);

  // Handle an assignee selection
  const onAssigneeSelected = (assignee: Assignee | Assignee[] | null) => {
    if (!assignee) {
      return;
    }

    // Handle both single and multiple assignees
    const assignees = Array.isArray(assignee) ? assignee : [assignee];

    const newIdentities: Record<string, ResolvedPrpl> = {};
    const newPermissionsMap = { ...permissionsMap };
    let hasChanges = false;

    // Iterate over assignees to prepare changes
    assignees.forEach((assignee) => {
      const resolvedPrpl = toResolvedPrpl(assignee, organization?.id || '');

      // Batch identity updates
      newIdentities[resolvedPrpl.prpl] = resolvedPrpl;

      // Batch permission map updates
      if (!newPermissionsMap.hasOwnProperty(resolvedPrpl.prpl)) {
        newPermissionsMap[resolvedPrpl.prpl] = new Set<Permission>([
          props.defaultPermission,
        ]);
        hasChanges = true;
      }
    });

    // Update identities once
    setKnownIdentities((prev) => ({
      ...prev,
      ...newIdentities,
    }));

    // Update permissions and notify parent once, if changed
    if (hasChanges) {
      setPermissionsMap(newPermissionsMap);
      const newAclMap = prplPermissionsMaptoAclMap(newPermissionsMap);
      if (props.onAclChange) {
        props.onAclChange(newAclMap);
      }
    }
  };

  const onPermissionsMapChange = (
    newPermissionsMap: Record<string, Set<Permission>>,
  ) => {
    // See if there are any prpls with no permissions and remove them
    Object.entries(newPermissionsMap).forEach(([prpl, permissions]) => {
      if (permissions.size === 0) {
        delete newPermissionsMap[prpl];
      }
    });

    // Update the state
    setPermissionsMap(newPermissionsMap);
    // Notify the change
    const newAclMap = prplPermissionsMaptoAclMap(newPermissionsMap);
    if (props.onAclChange) {
      props.onAclChange(newAclMap);
    }
  };

  // Generate the set of all prpls to display (the union of permissionMap and fixedPermissionMap)
  const allPrpls = new Set<string>([
    ...Object.keys(permissionsMap),
    ...Object.keys(fixedPrplPermissionsMap),
  ]);

  return (
    <>
      <ResolvedPrplsProvider prpls={Array.from(allPrpls)}>
        <AssigneeSelector
          orgId={organization?.id || ''}
          helperText={props.helperText}
          multiple={false}
          onChange={onAssigneeSelected}
          placeholder={'Add users or groups'}
          label={undefined}
        />
        {Object.entries(permissionsMap).length > 0 && (
          <PermissionEditorDivider
            dir="horizontal"
            sx={{ marginTop: 2, marginBottom: 1 }}
          />
        )}
        <PermissionEditableTable
          permissionsMap={permissionsMap}
          onPermissionsMapChange={onPermissionsMapChange}
          fixedPermissionMap={fixedPrplPermissionsMap}
          availablePermissions={props.availablePermissions}
          identities={knownIdentities}
        />
      </ResolvedPrplsProvider>
    </>
  );
};

export default PermissionEditor;
