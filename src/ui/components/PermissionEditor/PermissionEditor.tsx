import { useState } from 'react';
import ResolvedPrplsProvider from '../../context/PrplsContext/ResolvedPrplsProvider';
import PermissionTable from './PermissionTable';
import { AssigneeSelector } from '../AssigneeSelector';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { Permission } from '../../data/Permission';
import { toResolvedPrpl } from '../../data/Common';
import { ResolvedPrpl } from '../../../api/ColabriAPI';
import { PermissionEditorDivider } from './PermissionEditorStyles';
import { Assignee } from '../../data/Common';

type PermissionEditorProps = {
  helperText?: string;
  permissions: Record<string, Set<Permission>>;
  defaultPermission: Permission;
  aclMap: Record<Permission, string[]>;
  aclFixedMap?: Record<Permission, string[]>;
  onAclChange?: (newAclMap: Record<Permission, string[]>) => void;
};

const PermissionEditor = (props: PermissionEditorProps) => {
  const organization = useOrganization();
  // State to track the ACL map
  const [aclMap, setAclMap] = useState<Record<Permission, string[]>>(
    props.aclMap,
  );

  // Calculate a flat list of all permissions
  const allPermissions = new Set<Permission>();
  Object.keys(props.permissions).forEach((permission) => {
    allPermissions.add(permission as Permission);
  });

  // When a new assignee is selected, remember their identity and pass it to children so they don't need to resolve it again based on the prpl.
  const [knownIdentities, setKnownIdentities] = useState<
    Record<string, ResolvedPrpl>
  >({});

  // The user interface is going to list all the prpls with their permissions.
  // So we need to transform the aclMap to a map of prpls with their permissions.
  const prplPermissionsMap = {} as Record<string, Set<Permission>>;
  Object.entries(aclMap).forEach(([permission, prpls]) => {
    prpls.forEach((prpl) => {
      if (!prplPermissionsMap.hasOwnProperty(prpl)) {
        prplPermissionsMap[prpl] = new Set<Permission>();
      }
      prplPermissionsMap[prpl].add(permission as Permission);
    });
  });

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

  // Handle an assignee selection
  const onAssigneeSelected = (assignee: Assignee | Assignee[] | null) => {
    if (!assignee) {
      return;
    }

    // Handle both single and multiple assignees
    const assignees = [] as Assignee[];
    if (Array.isArray(assignee)) {
      assignees.push(...assignee);
    } else {
      assignees.push(assignee);
    }

    // Iterate over assignees and add them to known identities and acl map
    assignees.forEach((assignee) => {
      const resolvedPrpl = toResolvedPrpl(assignee, organization?.id || '');
      setKnownIdentities((prev) => {
        return {
          ...prev,
          ...{ [resolvedPrpl.prpl]: resolvedPrpl },
        };
      });

      // Generate the new acl map.
      let newPermPrpls = aclMap[props.defaultPermission] || [];
      if (!newPermPrpls.includes(resolvedPrpl.prpl)) {
        newPermPrpls = [...newPermPrpls, resolvedPrpl.prpl];
      }
      const newAclMap = {
        ...aclMap,
        ...{
          [props.defaultPermission]: newPermPrpls,
        },
      };
      setAclMap(newAclMap);

      // Notify the change
      if (props.onAclChange) {
        props.onAclChange(newAclMap);
      }
    });
  };

  const onPermissionMapChange = (
    newPermissionMap: Record<string, Set<Permission>>,
  ) => {
    // Convert the newPermissionMap back to aclMap format
    const newAclMap = {} as Record<Permission, string[]>;
    Object.entries(newPermissionMap).forEach(([prpl, permissions]) => {
      permissions.forEach((permission) => {
        if (!newAclMap[permission]) {
          newAclMap[permission] = [];
        }
        newAclMap[permission].push(prpl);
      });
    });

    setAclMap(newAclMap);
    if (props.onAclChange) {
      props.onAclChange(newAclMap);
    }
  };

  // Generate the set of all prpls to display (the union of permissionMap and fixedPermissionMap)
  const allPrpls = new Set<string>([
    ...Object.keys(prplPermissionsMap),
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
        {Object.entries(prplPermissionsMap).length > 0 && (
          <PermissionEditorDivider
            dir="horizontal"
            sx={{ marginTop: 2, marginBottom: 1 }}
          />
        )}
        <PermissionTable
          permissionMap={prplPermissionsMap}
          fixedPermissionMap={fixedPrplPermissionsMap}
          availablePermissions={props.permissions}
          identities={knownIdentities}
          onChange={onPermissionMapChange}
        />
      </ResolvedPrplsProvider>
    </>
  );
};

export default PermissionEditor;
