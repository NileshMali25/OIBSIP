import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 text-center text-sm text-gray-400 dark:text-zinc-500">
        © 2026 PizzaGo. All Rights Reserved. Built with ❤️ for Pizza Lovers.
      </footer>
    </div>
  );
};

export default UserLayout;
