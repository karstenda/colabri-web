// Create a UserOrganizationProvider component that uses the UserOrganizationContext to provide user organizations data to its children
import { useContext } from 'react';
import UserOrganizationContext from './UserOrganizationContext';
import { useUserAuth } from '../../hooks/useUserAuth/useUserAuth';
import { useParams } from 'react-router';

const useUserOrganizationContext = () => {
  const context = useContext(UserOrganizationContext);
  if (!context) {
    throw new Error('useUserOrganizationContext must be used within a UserOrganizationProvider');
  }
  return context;
};

const UserOrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { isLoading, userAuth } = useUserAuth();
  const { orgId } = useParams();

  // Find the current organization and user based on the orgId from the URL params
  const userOrganization = userAuth?.orgs?.find(orgEntry => orgEntry.organization.id === orgId) || null;
  const organization = userOrganization ? userOrganization.organization : null;
  const user = userOrganization ? userOrganization.user : null;

  return (
    <UserOrganizationContext.Provider value={{ organization, user, isLoading }}>
      {children}
    </UserOrganizationContext.Provider>
  );
};

export { UserOrganizationProvider, useUserOrganizationContext };