import { createBrowserRouter } from 'react-router';
import RootLayout from '../layouts/RootLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import PublicRoute from '../components/auth/PublicRoute.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
import RouteError from '../components/common/RouteError.jsx';
import { LoadingFallback } from '../components/common/MuiLoading.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    HydrateFallback: LoadingFallback,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        Component: PublicLayout,
        children: [
          {
            index: true,
            lazy: async () => {
              const m = await import('../pages/Home.jsx');
              return { Component: m.default };
            },
          },
          {
            path: 'login',
            element: (
              <PublicRoute>
                <div>Login Page Placeholder</div>
              </PublicRoute>
            ),
          },
          {
            path: 'register',
            element: (
              <PublicRoute>
                <div>Register Page Placeholder</div>
              </PublicRoute>
            ),
          },
        ],
      },
      {
        Component: DashboardLayout,
        children: [
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute>
                 {/* Lazy load dashboard to avoid circular dependencies if any */}
              </ProtectedRoute>
            ),
             lazy: async () => {
              const m = await import('../pages/Dashboard.jsx');
              return { Component: (props) => <ProtectedRoute><m.default {...props} /></ProtectedRoute> };
            },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: async () => {
        const m = await import('../pages/NotFound.jsx');
        return { Component: m.default };
    },
  },
]);

export default router;
