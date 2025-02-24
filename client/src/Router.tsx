import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from './components/hoc/DashboardLayout/DashboardLayout.page';
import { ProtectedRoute } from './components/hoc/ProtectedRoute';
import { UnprotectedRoute } from './components/hoc/UnprotectedRoute';
import AuthPage from './pages/Auth/Auth.page';
import DashboardPage from './pages/Dashboard/Dashboard.page';
import HomePage from './pages/Home/Home.page';
import SecondPage from './pages/SecondPage/SecondPage.page';

const router = createBrowserRouter([
  {
    element: <UnprotectedRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/secondPage',
            element: <SecondPage />,
          }
        ],
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
