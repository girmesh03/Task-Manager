import React from 'react';
import { Outlet } from 'react-router';
import ErrorBoundary from '../components/common/ErrorBoundary.jsx';

const RootLayout = () => {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
};

export default RootLayout;
