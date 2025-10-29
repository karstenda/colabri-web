import * as React from 'react';
import { Organization, User } from '../../../api/ColabriAPI';

const UserOrganizationContext = React.createContext<{
  organization: Organization | null;
  user: User | null;
  isLoading: boolean;
} | null>(null);

export default UserOrganizationContext;
