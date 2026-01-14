// Create a UserOrganizationProvider component that uses the UserOrganizationContext to provide user organizations data to its children
import { useContext } from 'react';
import UserOrganizationContext from './UserOrganizationContext';
import { useUserAuth } from '../../hooks/useUserAuth/useUserAuth';
import { useParams } from 'react-router';

export const useUserOrganizationContext = () => {
  const context = useContext(UserOrganizationContext);
  if (!context) {
    throw new Error(
      'useUserOrganizationContext must be used within a UserOrganizationProvider',
    );
  }
  return context;
};

export const useOrganization = () => {
  const { organization } = useUserOrganizationContext();
  return organization;
};

export const useOrgUserId = () => {
  const { orgUserId } = useUserOrganizationContext();
  return orgUserId;
};

export const useUserUid = () => {
  const { orgUserId } = useUserOrganizationContext();
  return orgUserId;
};

export const useOrgGroups = () => {
  const { orgGroups } = useUserOrganizationContext();
  return orgGroups;
};

export const useIsOrgAdmin = () => {
  const { orgGroups } = useUserOrganizationContext();
  if (!orgGroups) {
    return false;
  } else {
    return orgGroups.some((group) => group.name === 'Administrators');
  }
};

export const useIsCloudAdmin = () => {
  const { prpls } = useUserOrganizationContext();
  return prpls.includes('r/Colabri-CloudAdmin');
};

export const usePrpls = () => {
  const { prpls } = useUserOrganizationContext();
  return prpls;
};

export const useUserProfile = () => {
  const { userProfile } = useUserOrganizationContext();
  return userProfile;
};

const UserOrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoading, userAuth } = useUserAuth();
  const { orgId } = useParams();

  // Find the current organization and user based on the orgId from the URL params
  const userOrganization =
    userAuth?.orgs?.find((orgEntry) => orgEntry.organization.id === orgId) ||
    null;
  const organization = userOrganization ? userOrganization.organization : null;
  const orgUserId = userOrganization ? userOrganization.userId : null;
  const orgGroups = userOrganization ? userOrganization.userGroups : null;
  const userProfile = userAuth?.profile || null;
  const prpls = userAuth?.prpls || [];
  const userUid = userAuth?.uid || null;

  return (
    <UserOrganizationContext.Provider
      value={{
        userUid,
        organization,
        orgUserId,
        orgGroups,
        userProfile,
        prpls,
        isLoading,
      }}
    >
      {children}
    </UserOrganizationContext.Provider>
  );
};

export { UserOrganizationProvider };
