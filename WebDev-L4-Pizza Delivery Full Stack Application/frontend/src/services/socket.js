import { io } from 'socket.io-client';

const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // Fallback: use current hostname if accessed via IP or localhost
  const hostname = window.location.hostname;
  return `http://${hostname}:5000`;
};

export const socket = io(getSocketURL(), {
  autoConnect: false,
  withCredentials: true
});
