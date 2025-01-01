import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppProvider } from "@toolpad/core/AppProvider";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TaskIcon from "@mui/icons-material/Task";

import RootLayout from "./layout/RootLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "tasks",
          element: <Tasks />,
        },
      ],
    },
  ]);

  return (
    <AppProvider
      navigation={[
        {
          segment: "dashboard",
          title: "Dashboard",
          icon: <DashboardIcon />,
        },
        {
          segment: "tasks",
          title: "Tasks",
          icon: <TaskIcon />,
        },
      ]}
      theme={theme}
      router={router}
    >
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
