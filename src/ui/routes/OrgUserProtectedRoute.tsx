
import {useUserOrganizationContext} from '../context/UserOrganizationContext/UserOrganizationProvider';
import { Navigate } from 'react-router';
import { useUserAuth } from '../hooks/useUserAuth/useUserAuth';

const OrgUserProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { organization, isLoading: isOrgLoading } = useUserOrganizationContext();
    const { userAuth, isLoading: isAuthLoading } = useUserAuth();

    // Determine if still loading
    const isLoading = isOrgLoading || isAuthLoading;

    // While still loading, show a loading indicator
    if (isLoading) {
        return <div>Loading...</div>;
    }
    // If there is no user, redirect to login page.
    else if (!userAuth?.uid) {
        // Get the current relative path of the browser
        const redirectPath = window.location.hash || '/';
        // Construct the login path with redirect_uri parameter
        const loginPath = `/auth/login?redirect_uri=${encodeURIComponent(redirectPath)}`;
        // Do an actual forced redirect to login
        window.location.href = loginPath;
        return null; // Return null while redirecting
    }
    // Check if there's no organization selected
    else if (!organization) {

        // See if we can get a default organization.
        const orgs = userAuth?.orgs || [];
        if (orgs.length == 1) {
            // Auto-redirect to the home page of the single organization.
            const defaultOrgId = orgs[0].organization.id;
            return <Navigate to={`/#/org/${defaultOrgId}/`} replace />;
        }
        // No single organization
        else {
            // Redirect to organizations selection page
            return <Navigate to="/organizations" replace />;
        }
    }
    // All good, render the protected content
    else {
        return children;
    }
};

export default OrgUserProtectedRoute;