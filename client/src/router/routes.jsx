import { createBrowserRouter } from 'react-router';
import RootLayout from '../layouts/RootLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import PublicRoute from '../components/auth/PublicRoute.jsx';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';
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
            lazy: async () => {
              const m = await import("../components/forms/auth/LoginForm.jsx");
              return {
                Component: () => (
                  <PublicRoute>
                    <m.default />
                  </PublicRoute>
                ),
              };
            },
          },
          {
            path: 'register',
            lazy: async () => {
              const m = await import("../components/forms/auth/RegisterForm.jsx");
              return {
                Component: () => (
                  <PublicRoute>
                    <m.default />
                  </PublicRoute>
                ),
              };
            },
          },
          {
            path: 'forgot-password',
            lazy: async () => {
              const m = await import("../pages/ForgotPassword.jsx");
              return {
                Component: () => (
                  <PublicRoute>
                    <m.default />
                  </PublicRoute>
                ),
              };
            },
          },
          {
            path: 'reset-password',
            lazy: async () => {
              const m = await import("../pages/ForgotPassword.jsx");
              return {
                Component: () => (
                  <PublicRoute>
                    <m.default />
                  </PublicRoute>
                ),
              };
            },
          },
        ],
      },
      {
        Component: DashboardLayout,
        children: [
          {
            path: 'dashboard',
            lazy: async () => {
              const m = await import('../pages/Dashboard.jsx');
              return {
                Component: () => (
                  <ProtectedRoute>
                    <m.default />
                  </ProtectedRoute>
                ),
              };
            },
          },
          {
            path: 'users',
            lazy: async () => {
              const m = await import('../pages/UsersPage.jsx');
              return {
                Component: () => (
                  <ProtectedRoute>
                    <m.default />
                  </ProtectedRoute>
                ),
              };
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
