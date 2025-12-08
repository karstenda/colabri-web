import { Avatar, useTheme, Box } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ShieldIcon from '@mui/icons-material/Shield';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import UserAvatar from '../UserAvatar/UserAvatar';
import { Assignee } from '../../data/Common';
import { User } from '../../../api/ColabriAPI';
import { ResolvedPrplOption } from '../../context/PrplsContext/ResolvedPrplsProvider';
import { useOrganization } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import { getDisplayName, toResolvedPrpl } from '../../data/Common';

export interface IdentityDisplayProps {
  // Either display through an assignee or a resolved prpl.
  assignee?: Assignee;
  resolvedPrpl?: ResolvedPrplOption;
  size?: 'small' | 'medium';
  inTable?: boolean;
}

export default function IdentityDisplay({
  assignee: assigneeProp,
  resolvedPrpl: resolvedPrplProp,
  size = 'small',
  inTable = false,
}: IdentityDisplayProps) {
  const theme = useTheme();

  const organization = useOrganization();

  // If an assignee was provided, convert it to a resolved prpl.
  let resolvedPrpl: ResolvedPrplOption | undefined;
  if (assigneeProp && !resolvedPrplProp) {
    resolvedPrpl = toResolvedPrpl(assigneeProp, organization?.id || '');
  } else {
    resolvedPrpl = resolvedPrplProp;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: theme.spacing(1),
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
        {resolvedPrpl && resolvedPrpl.type === 'user' && (
          <UserAvatar
            width={size === 'small' ? 24 : 32}
            height={size === 'small' ? 24 : 32}
            user={resolvedPrpl.user as User}
          />
        )}
        {resolvedPrpl && resolvedPrpl.type === 'group' && (
          <Avatar
            sx={{
              width: size === 'small' ? 24 : 32,
              height: size === 'small' ? 24 : 32,
              bgcolor: theme.palette.grey[400],
            }}
          >
            <GroupIcon sx={{ fontSize: size === 'small' ? 14 : 20 }} />
          </Avatar>
        )}
        {resolvedPrpl && resolvedPrpl.type === 'system' && (
          <Avatar
            sx={{
              width: size === 'small' ? 24 : 32,
              height: size === 'small' ? 24 : 32,
              bgcolor: theme.palette.primary.main,
            }}
          >
            <ShieldIcon />
          </Avatar>
        )}
        {resolvedPrpl && resolvedPrpl.type === 'unknown' && (
          <Avatar
            sx={{
              width: size === 'small' ? 24 : 32,
              height: size === 'small' ? 24 : 32,
              bgcolor: theme.palette.primary.main,
            }}
          >
            <QuestionMarkIcon />
          </Avatar>
        )}
      </Box>
      <Box
        sx={{
          display: inTable ? 'block' : 'flex',
          alignItems: 'center',
          flexGrow: 1,
          minWidth: 0, // Critical for flex items to allow text truncation
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {resolvedPrpl ? getDisplayName(resolvedPrpl) : 'Unknown'}
      </Box>
    </Box>
  );
}
