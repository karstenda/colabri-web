import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { createHashRouter, RouterProvider } from 'react-router';
import DashboardLayout from './mui-crud/components/DashboardLayout';
import EmployeeList from './mui-crud/components/EmployeeList';
import EmployeeShow from './mui-crud/components/EmployeeShow';
import EmployeeCreate from './mui-crud/components/EmployeeCreate';
import EmployeeEdit from './mui-crud/components/EmployeeEdit';
import NotificationsProvider from './mui-crud/hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './mui-crud/hooks/useDialogs/DialogsProvider';
import AppTheme from './shared-theme/AppTheme';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from './mui-crud/theme/customizations';
import { LoroDoc } from 'loro-crdt/base64';
import ColabDocListPage from './ui/pages/ColabDocListPage';


const router = createHashRouter([
  {
    Component: DashboardLayout,
    children: [
{
        path: '/docs',
        Component: ColabDocListPage,
      },
      {
        path: '/employees',
        Component: EmployeeList,
      },
      {
        path: '/employees/:employeeId',
        Component: EmployeeShow,
      },
      {
        path: '/employees/new',
        Component: EmployeeCreate,
      },
      {
        path: '/employees/:employeeId/edit',
        Component: EmployeeEdit,
      },
      // Fallback route for the example routes in dashboard sidebar items
      {
        path: '*',
        Component: EmployeeList,
      },
    ],
  },
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
  
    return (
        <AppTheme {...props} themeComponents={themeComponents}>
            <CssBaseline enableColorScheme />
            <NotificationsProvider>
                <DialogsProvider>
                    <RouterProvider router={router} />
                </DialogsProvider>
            </NotificationsProvider>
        </AppTheme>
    );
}