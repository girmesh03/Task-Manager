import React from 'react';
import { RouterProvider } from 'react-router';
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { store, persistor } from './redux/app/store.js';
import router from './router/routes.jsx';
import AppTheme from './theme/AppTheme.jsx';
import { LoadingFallback } from './components/common/MuiLoading.jsx';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingFallback />} persistor={persistor}>
        <AppTheme>
          <CssBaseline />
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} />
        </AppTheme>
      </PersistGate>
    </Provider>
  );
}

export default App;
