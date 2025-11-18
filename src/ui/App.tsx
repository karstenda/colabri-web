import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import MainLayout from './components/MainLayout/MainLayout';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import AppTheme from '../shared-theme/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from './theme/customizations';
import OnboardPage from './pages/OnboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserOrganizationProvider } from './context/UserOrganizationContext/UserOrganizationProvider';
import OrgUserProtectedRoute from './routes/OrgUserProtectedRoute';
import UserListPage from './pages/users/UserListPage';
import UserCreatePage from './pages/users/UserCreatePage';
import UserShowPage from './pages/users/UserShowPage';
import UserEditPage from './pages/users/UserEditPage';
import GroupListPage from './pages/groups/GroupListPage';
import GroupEditPage from './pages/groups/GroupEditPage';
import GroupCreatePage from './pages/groups/GroupCreatePage';
import GroupShowPage from './pages/groups/GroupShowPage';
import ColabDocEditorPage from './pages/editor/ColabDocEditorPage';
import LanguageListPage from './pages/languages/LanguageListPage';


const router = createHashRouter([
  {
    path: '/onboard',
    Component: OnboardPage,
  },
  {
    Component: () => (
      <UserOrganizationProvider>
        <OrgUserProtectedRoute>
          <MainLayout />
        </OrgUserProtectedRoute>
      </UserOrganizationProvider>
    ),
    children: [
      {
        path: 'org/:orgId/users',
        Component: UserListPage,
      },
      {
        path: 'org/:orgId/users/:userId',
        Component: UserShowPage,
      },
      {
        path: 'org/:orgId/users/new',
        Component: UserCreatePage,
      },
      {
        path: 'org/:orgId/users/:userId/edit',
        Component: UserEditPage,
      },
      {
        path: 'org/:orgId/groups',
        Component: GroupListPage,
      },
      {
        path: 'org/:orgId/groups/:groupId',
        Component: GroupShowPage,
      },
      {
        path: 'org/:orgId/groups/new',
        Component: GroupCreatePage,
      },
      {
        path: 'org/:orgId/groups/:groupId/edit',
        Component: GroupEditPage,
      },
      {
        path: 'org/:orgId/docs/:docId',
        Component: ColabDocEditorPage,
      },
      {
        path: 'org/:orgId/config/languages/',
        Component: LanguageListPage,
      },
      {
        path: 'org/:orgId/*',
        Component: UserListPage,
      },
    ],
  },
  // Fallback route for the example routes in dashboard sidebar items
  {
    path: '*',
    Component: OnboardPage,
  }
]);

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function App(props: { disableCustomTheme?: boolean }) {

    // Create a TanStack Query client
    const queryClient = new QueryClient()
  
    return (
      <QueryClientProvider client={queryClient}>
        <AppTheme {...props} themeComponents={themeComponents}>
            <CssBaseline enableColorScheme />
              <NotificationsProvider>
                  <DialogsProvider>
                      <RouterProvider router={router} />
                  </DialogsProvider>
              </NotificationsProvider>
        </AppTheme>
      </QueryClientProvider>
    );
}