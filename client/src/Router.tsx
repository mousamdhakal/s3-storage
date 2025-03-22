import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import DashboardLayout from './components/hoc/DashboardLayout/DashboardLayout.page';
import { ProtectedRoute } from './components/hoc/ProtectedRoute';
import { UnprotectedRoute } from './components/hoc/UnprotectedRoute';
import AuthPage from './pages/Auth/Auth.page';
import DashboardPage from './pages/Dashboard/Dashboard.page';
import { PublicFileViewer } from './pages/PublicFilesViewer/PublicFilesViewer';
import { FileUploader } from './components/FileUploader/FileUploader';
import FilePage from './pages/Files/File';
import LogsPage from './pages/Logs/Logs';

const router = createBrowserRouter([
  // Public routes accessible regardless of auth state
  {
    path: '/file/view/:fileId',
    element: <PublicFileViewer />,
  },

  // Routes for unauthenticated users
  {
    element: <UnprotectedRoute />,
    children: [
      {
        path: '/',
        element: <AuthPage />,
      },
      // Catch-all route for unauthenticated users - redirect to auth page
      {
        path: '*',
        element: <Navigate to="/" replace />,
      }
    ],
  },
  
  // Routes for authenticated users
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
            path: '/upload',
            element: <FileUploader />,
          },
          {
            path: '/files',
            element: <FilePage />,
          },
          {
            path: '/logs',
            element: <LogsPage />,
          },
          // Catch-all route for authenticated users - redirect to dashboard
          {
            path: '*',
            element: <Navigate to="/dashboard" replace />,
          }
        ],
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}