import * as React from 'react';
import { Organization, Group } from '../../../api/ColabriAPI';

const UserOrganizationContext = React.createContext<{
  organization: Organization | null;
  prpls: string[];
  orgUserId: string | null;
  orgGroups: Group[] | null;
  userProfile: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  } | null;
  isLoading: boolean;
} | null>(null);

export default UserOrganizationContext;
