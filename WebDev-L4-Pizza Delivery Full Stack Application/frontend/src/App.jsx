import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearError } from './redux/authSlice';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'dark:bg-zinc-900 dark:text-zinc-100',
          duration: 3000
        }}
      />
    </BrowserRouter>
  );
}

export default App;
