const socketIO = require('socket.io');

const initSocket = (server, app) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Attach io instance to express app so we can use it in controllers
  app.set('socketio', io);

  io.on('connection', (socket) => {
    console.log(`[SOCKET] - Client connected: ${socket.id}`);

    // Join order room
    socket.on('join', (orderId) => {
      console.log(`[SOCKET] - Client joined room: ${orderId}`);
      socket.join(orderId);
    });

    // Join admin room for receiving new order alerts
    socket.on('joinAdmin', () => {
      console.log('[SOCKET] - Admin client joined admin room');
      socket.join('adminRoom');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[SOCKET] - Client disconnected: ${socket.id}`);
    });
  });

  console.log('[SOCKET] - Socket.io server successfully initialized.');
  return io;
};

module.exports = { initSocket };
