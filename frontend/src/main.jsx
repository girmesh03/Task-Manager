import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { store, persistor } from "./redux/app/store";
import { PersistGate } from "redux-persist/integration/react";

import App from "./App";
import RootLayout from "./layout/RootLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import AppError from "./pages/AppError";
import NotFound from "./pages/NotFound";

import { RootFallback } from "./components/LoadingFallback";

// Import loaders
import { dataLoader, dashboardLoader } from "./loaders/dataLoaders";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: RootLayout,
        errorElement: <AppError />,
        HydrateFallback: RootFallback,
        children: [
          {
            path: "/",
            Component: Dashboard,
            loader: dashboardLoader,
          },
          {
            path: "tasks",
            Component: Tasks,
            loader: dataLoader,
          },
          {
            path: "tasks/:id",
            Component: TaskDetail,
            loader: dataLoader,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </ReduxProvider>
  </StrictMode>
);
