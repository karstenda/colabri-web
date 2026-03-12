import { Permission } from '../../../ui/data/Permission';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import PermissionEditor from '../../../ui/components/PermissionEditor/PermissionEditor';
import PermissionViewer from '../../../ui/components/PermissionViewer/PermissionViewer';
import { PermissionChain } from './PermissionChain';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  PermissionChainAccordion,
  PermissionChainAccordionSummary,
} from './PermissionChainEditorStyles';
import { useTranslation } from 'react-i18next';

type LevelType = PermissionChain['chain'][number]['type'];

const sectionsByLevelType = {
  doc: [
    {
      labelKey: 'common.document' as const,
      permissions: [Permission.View, Permission.Manage, Permission.AddRemove],
    },
    {
      labelKey: 'common.blockContent' as const,
      permissions: [Permission.Edit, Permission.Approve],
    },
  ],
  block: [
    {
      labelKey: 'common.block' as const,
      permissions: [Permission.Manage, Permission.AddRemove],
    },
    {
      labelKey: 'common.blockContent' as const,
      permissions: [Permission.Edit, Permission.Approve],
    },
  ],
  statement: [
    {
      labelKey: 'common.statement' as const,
      permissions: [Permission.Manage, Permission.AddRemove],
    },
    {
      labelKey: 'common.localizations' as const,
      permissions: [Permission.Edit, Permission.Approve],
    },
  ],
  element: [
    {
      labelKey: 'common.localization' as const,
      permissions: [Permission.Edit, Permission.Approve],
    },
  ],
};

export type PermissionChainEditorProps = {
  permissionChain: PermissionChain;
  setPermissionChain: (chain: PermissionChain) => void;
  availablePermissions: Set<Permission>;
  defaultPermission: Permission;
  readOnly?: boolean;
};

// Utility to calculate inherited ACLs up to a given index in the chain
const calcInheritedAcls = (
  index: number,
  chain: PermissionChain,
): Record<Permission, string[]> => {
  const inheritedAcls = {} as Record<Permission, string[]>;

  for (let i = 0; i < index; i++) {
    const level = chain.chain[i];
    Object.entries(level.acls).forEach(([key, prpls]) => {
      const permission = key as Permission;
      if (!inheritedAcls.hasOwnProperty(permission)) {
        inheritedAcls[permission] = [] as string[];
      }
      inheritedAcls[permission] = inheritedAcls[permission].concat(prpls);
    });
  }

  return inheritedAcls;
};

const PermissionChainEditor = ({
  permissionChain,
  setPermissionChain,
  availablePermissions,
  defaultPermission,
  readOnly,
}: PermissionChainEditorProps) => {
  const { t } = useTranslation();

  const getSectionedPermissions = (
    levelType: LevelType,
  ): Record<string, Set<Permission>> => {
    const definitions = sectionsByLevelType[levelType];
    const result: Record<string, Set<Permission>> = {};
    for (const { labelKey, permissions } of definitions) {
      const filtered = permissions.filter((p) => availablePermissions.has(p));
      if (filtered.length > 0) {
        result[t(labelKey)] = new Set(filtered);
      }
    }
    return result;
  };

  return (
    <Box>
      {permissionChain.chain.map((level, index) => (
        <PermissionChainAccordion
          key={index}
          defaultExpanded={index === permissionChain.chain.length - 1}
        >
          <PermissionChainAccordionSummary
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography
              sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
              component="span"
            >
              {level.label}
            </Typography>
          </PermissionChainAccordionSummary>
          <AccordionDetails
            aria-labelledby={`panel${index}-header`}
            id={`panel${index}-content`}
          >
            {!readOnly && level.canManage && (
              <PermissionEditor
                aclMap={level.acls}
                aclFixedMap={calcInheritedAcls(index, permissionChain)}
                availablePermissions={getSectionedPermissions(level.type)}
                defaultPermission={defaultPermission}
                onAclChange={(newAclMap) => {
                  // Update the permission chain state
                  const newPermissionChain = { ...permissionChain };
                  newPermissionChain.chain[index].acls = newAclMap;
                  setPermissionChain(newPermissionChain);
                }}
              />
            )}
            {(readOnly || !level.canManage) && (
              <PermissionViewer aclMap={level.acls} />
            )}
          </AccordionDetails>
        </PermissionChainAccordion>
      ))}
    </Box>
  );
};

export default PermissionChainEditor;
