import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import MainLayout from './components/MainLayout/MainLayout';
import EmployeeList from '../mui-crud/components/EmployeeList';
import EmployeeShow from '../mui-crud/components/EmployeeShow';
import EmployeeCreate from '../mui-crud/components/EmployeeCreate';
import EmployeeEdit from '../mui-crud/components/EmployeeEdit';
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
import ColabDocListPage from './pages/ColabDocListPage';
import OnboardPage from './pages/OnboardPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserOrganizationProvider } from './context/UserOrganizationContext/UserOrganizationProvider';
import OrgUserProtectedRoute from './routes/OrgUserProtectedRoute';


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
        path: 'org/:orgId/docs',
        Component: ColabDocListPage,
      },
      {
        path: 'org/:orgId/employees',
        Component: EmployeeList,
      },
      {
        path: 'org/:orgId/employees/:employeeId',
        Component: EmployeeShow,
      },
      {
        path: 'org/:orgId/employees/new',
        Component: EmployeeCreate,
      },
      {
        path: 'org/:orgId/employees/:employeeId/edit',
        Component: EmployeeEdit,
      },
      {
        path: 'org/:orgId/*',
        Component: EmployeeList,
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