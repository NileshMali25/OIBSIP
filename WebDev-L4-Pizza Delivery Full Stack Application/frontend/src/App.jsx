import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
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
