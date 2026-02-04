import {
  Group,
  ResolvedPrpl,
  ResolvedPrplType,
  User,
} from '../../api/ColabriAPI';
import { ResolvedPrplOption } from '../context/PrplsContext/ResolvedPrplsProvider';

// An assignee can be either a user or a group
export type Assignee = (User & { type: 'user' }) | (Group & { type: 'group' });

// Convert an assignee to a resolved prpl
export const toResolvedPrpl = (
  assignee: Assignee,
  orgId: string,
): ResolvedPrpl => {
  if (assignee.type === 'user') {
    return {
      type: ResolvedPrplType.ResolvedPrplUserType,
      user: assignee,
      prpl: getPrpl(assignee, orgId),
    };
  } else if (assignee.type === 'group') {
    return {
      type: ResolvedPrplType.ResolvedPrplGroupType,
      group: assignee,
      prpl: getPrpl(assignee, orgId),
    };
  } else {
    throw new Error('Unknown assignee type');
  }
};

// Get the display name for a user
export const getUserDisplayName = (user: any): string => {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.email || 'Unknown User';
};

// Get the display name for a group
export const getGroupDisplayName = (group: any): string => {
  return group.name || 'Unknown Group';
};

// Get the display name for an assignee
export const getAssigneeDisplayName = (assignee: Assignee): string => {
  return assignee.type === 'user'
    ? getUserDisplayName(assignee)
    : getGroupDisplayName(assignee);
};

// Get the display name for an identity
export const getDisplayName = (resolvedPrpl: ResolvedPrplOption): string => {
  if (resolvedPrpl.type === 'user') {
    return getUserDisplayName(resolvedPrpl.user);
  } else if (resolvedPrpl.type === 'group') {
    return getGroupDisplayName(resolvedPrpl.group);
  } else if (resolvedPrpl.type === 'system') {
    return 'System';
  } else if (resolvedPrpl.type === 'loading') {
    return 'Loading...';
  }
  return 'Unknown';
};

export const getPrpl = (assignee: Assignee, organizationId: string): string => {
  if (assignee.type === 'user') {
    return `${organizationId}/u/${assignee.id}`;
  } else if (assignee.type === 'group') {
    return `${organizationId}/g/${assignee.id}`;
  } else {
    throw new Error('Unknown assignee type');
  }
};
