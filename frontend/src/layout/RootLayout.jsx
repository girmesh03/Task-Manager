import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Outlet } from "react-router-dom";
import { useNavigation } from "react-router";

import { LoadingFallback } from "../components/LoadingFallback";

const RootLayout = () => {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <DashboardLayout defaultSidebarCollapsed>
      <PageContainer>
        {isNavigating ? <LoadingFallback /> : <Outlet />}
      </PageContainer>
    </DashboardLayout>
  );
};

export default RootLayout;
