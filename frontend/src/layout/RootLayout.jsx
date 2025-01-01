import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <DashboardLayout defaultSidebarCollapsed>
      <Outlet />
    </DashboardLayout>
  );
};

export default RootLayout;
