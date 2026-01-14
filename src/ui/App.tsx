import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';
import { createHashRouter, RouterProvider } from 'react-router';
import MainLayout from './components/MainLayout/MainLayout';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import AppTheme from '../shared-theme/AppTheme';
import {
  sidebarCustomizations,
  formInputCustomizations,
  datePickersCustomizations,
  dataGridCustomizations,
} from './theme/customizations';
import LandingPage from './pages/landing/LandingPage';
import TrialPage from './pages/trial/TrialPage';
import AutoSetupPage from './pages/autosetup/AutoSetupPage';
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
import AttributeListPage from './pages/attributes/AttributeListPage';
import AttributeCreatePage from './pages/attributes/AttributeCreatePage';
import AttributeShowPage from './pages/attributes/AttributeShowPage';
import AttributeEditPage from './pages/attributes/AttributeEditPage';
import ColabDocEditorPage from './pages/editor/ColabDocEditorPage';
import LanguageListPage from './pages/languages/LanguageListPage';
import CountryListPage from './pages/countries/CountryListPage';
import StatementListPage from './pages/statements/StatementListPage';
import StatementCreatePage from './pages/statements/StatementCreatePage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/legal/TermsAndConditionsPage';
import SheetListPage from './pages/sheets/SheetListPage';
import SheetCreatePage from './pages/sheets/SheetCreatePage';

const router = createHashRouter([
  {
    path: 'org/:orgId/docs/:docId',
    Component: () => (
      <UserOrganizationProvider>
        <OrgUserProtectedRoute>
          <NotificationsProvider>
            <DialogsProvider>
              <ColabDocEditorPage />
            </DialogsProvider>
          </NotificationsProvider>
        </OrgUserProtectedRoute>
      </UserOrganizationProvider>
    ),
  },
  {
    path: 'org/:orgId/sheets/:docId',
    Component: () => (
      <UserOrganizationProvider>
        <OrgUserProtectedRoute>
          <NotificationsProvider>
            <DialogsProvider>
              <ColabDocEditorPage />
            </DialogsProvider>
          </NotificationsProvider>
        </OrgUserProtectedRoute>
      </UserOrganizationProvider>
    ),
  },
  {
    path: 'org/:orgId/statements/:docId',
    Component: () => (
      <UserOrganizationProvider>
        <OrgUserProtectedRoute>
          <NotificationsProvider>
            <DialogsProvider>
              <ColabDocEditorPage />
            </DialogsProvider>
          </NotificationsProvider>
        </OrgUserProtectedRoute>
      </UserOrganizationProvider>
    ),
  },
  {
    Component: () => (
      <UserOrganizationProvider>
        <OrgUserProtectedRoute>
          <NotificationsProvider>
            <DialogsProvider>
              <MainLayout />
            </DialogsProvider>
          </NotificationsProvider>
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
        path: 'org/:orgId/attributes',
        Component: AttributeListPage,
      },
      {
        path: 'org/:orgId/attributes/:attributeId',
        Component: AttributeShowPage,
      },
      {
        path: 'org/:orgId/attributes/new',
        Component: AttributeCreatePage,
      },
      {
        path: 'org/:orgId/attributes/:attributeId/edit',
        Component: AttributeEditPage,
      },
      {
        path: 'org/:orgId/sheets',
        Component: SheetListPage,
      },
      {
        path: 'org/:orgId/sheets/my',
        Component: () => <SheetListPage scope="my" />,
      },
      {
        path: 'org/:orgId/sheets/shared',
        Component: () => <SheetListPage scope="shared" />,
      },
      {
        path: 'org/:orgId/sheets/lib',
        Component: () => <SheetListPage scope="lib" />,
      },
      {
        path: 'org/:orgId/sheets/new',
        Component: SheetCreatePage,
      },
      {
        path: 'org/:orgId/statements',
        Component: StatementListPage,
      },
      {
        path: 'org/:orgId/statements/my',
        Component: () => <StatementListPage scope="my" />,
      },
      {
        path: 'org/:orgId/statements/shared',
        Component: () => <StatementListPage scope="shared" />,
      },
      {
        path: 'org/:orgId/statements/lib',
        Component: () => <StatementListPage scope="lib" />,
      },
      {
        path: 'org/:orgId/statements/new',
        Component: StatementCreatePage,
      },
      {
        path: 'org/:orgId/config/languages/',
        Component: LanguageListPage,
      },
      {
        path: 'org/:orgId/config/countries/',
        Component: CountryListPage,
      },
      {
        path: 'org/:orgId/*',
        Component: UserListPage,
      },
    ],
  },
  {
    path: '/trial',
    Component: () => (
      <UserOrganizationProvider>
        <NotificationsProvider>
          <DialogsProvider>
            <TrialPage />
          </DialogsProvider>
        </NotificationsProvider>
      </UserOrganizationProvider>
    ),
  },
  {
    path: '/org/:orgId/autosetup',
    Component: () => (
      <UserOrganizationProvider>
        <NotificationsProvider>
          <DialogsProvider>
            <AutoSetupPage />
          </DialogsProvider>
        </NotificationsProvider>
      </UserOrganizationProvider>
    ),
  },
  {
    path: '/privacy-policy',
    Component: () => (
      <UserOrganizationProvider>
        <NotificationsProvider>
          <DialogsProvider>
            <PrivacyPolicyPage />
          </DialogsProvider>
        </NotificationsProvider>
      </UserOrganizationProvider>
    ),
  },
  {
    path: '/terms-and-conditions',
    Component: () => (
      <UserOrganizationProvider>
        <NotificationsProvider>
          <DialogsProvider>
            <TermsAndConditionsPage />
          </DialogsProvider>
        </NotificationsProvider>
      </UserOrganizationProvider>
    ),
  },
  // Fallback route for the example routes in dashboard sidebar items
  {
    path: '*',
    Component: () => (
      <UserOrganizationProvider>
        <NotificationsProvider>
          <DialogsProvider>
            <LandingPage />
          </DialogsProvider>
        </NotificationsProvider>
      </UserOrganizationProvider>
    ),
  },
]);

const themeComponents = {
  ...sidebarCustomizations,
  ...formInputCustomizations,
  ...datePickersCustomizations,
  ...dataGridCustomizations,
};

export default function App(props: { disableCustomTheme?: boolean }) {
  // Create a TanStack Query client
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppTheme {...props} themeComponents={themeComponents}>
        <CssBaseline enableColorScheme />

        <RouterProvider router={router} />
      </AppTheme>
    </QueryClientProvider>
  );
}
