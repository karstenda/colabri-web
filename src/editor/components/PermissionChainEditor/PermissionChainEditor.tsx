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

export type PermissionChainEditorProps = {
  permissionChain: PermissionChain;
  setPermissionChain: (chain: PermissionChain) => void;
  availablePermissions: Record<string, Set<Permission>>;
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
                availablePermissions={availablePermissions}
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
