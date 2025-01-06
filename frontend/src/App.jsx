import { Outlet } from "react-router-dom";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { NotificationsProvider } from "@toolpad/core/useNotifications";

import DashboardIcon from "@mui/icons-material/Dashboard";
import TaskIcon from "@mui/icons-material/Task";

const BRANDING = {
  title: "Task Manager",
};

const NAVIGATION = [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "tasks",
    title: "Tasks",
    icon: <TaskIcon />,
  },
];

function App() {
  return (
    <AppProvider navigation={NAVIGATION} branding={BRANDING}>
      <NotificationsProvider>
        <Outlet />
      </NotificationsProvider>
    </AppProvider>
  );
}

export default App;
