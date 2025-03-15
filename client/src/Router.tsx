import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from './components/hoc/DashboardLayout/DashboardLayout.page';
import { ProtectedRoute } from './components/hoc/ProtectedRoute';
import { UnprotectedRoute } from './components/hoc/UnprotectedRoute';
import AuthPage from './pages/Auth/Auth.page';
import DashboardPage from './pages/Dashboard/Dashboard.page';
import { PublicFileViewer } from './pages/PublicFilesViewer/PublicFilesViewer';
import { FileUploader } from './components/FileUploader/FileUploader';

const router = createBrowserRouter([
  {
    element: <UnprotectedRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      }      
    ],
  },
  {
    path: '/file/view/:fileId',
    element: <PublicFileViewer />,
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
            path: '/upload',
            element: <FileUploader />,
          }
        ],
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
