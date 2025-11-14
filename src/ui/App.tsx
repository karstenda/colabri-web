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
import { LoroDoc } from 'loro-crdt/base64';
import OnboardPage from './pages/OnboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserOrganizationProvider } from './context/UserOrganizationContext/UserOrganizationProvider';
import OrgUserProtectedRoute from './routes/OrgUserProtectedRoute';
import UserListPage from './pages/users/UserListPage';
import UserCreatePage from './pages/users/UserCreatePage';
import UserShowPage from './pages/users/UserShowPage';
import UserEditPage from './pages/users/UserEditPage';
import GroupListPage from './pages/groups/GroupListPage';
import GroupShowPage from './pages/groups/GroupShowPage';
import ColabDocEditorPage from './pages/editor/ColabDocEditorPage';


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
        path: 'org/:orgId/docs/:docId',
        Component: ColabDocEditorPage,
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

    const loroDoc = new LoroDoc();

    // Generate a random peer ID
    const peerId = Math.floor(Math.random() * 10000);
    loroDoc.setPeerId(BigInt(peerId));

    const colabDoc = {
        loroDoc: loroDoc,
        permissionMap: {},
    }

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