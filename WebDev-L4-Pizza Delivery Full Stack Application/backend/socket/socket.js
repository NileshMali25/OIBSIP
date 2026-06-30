const socketIO = require('socket.io');

const initSocket = (server, app) => {
  const io = socketIO(server, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = [
          'http://localhost:5173',
          'https://pizzadelivary.vercel.app',
          process.env.CLIENT_URL
        ].filter(Boolean);
        
        // Allow local network IP addresses in development or if they match standard private IPs
        const isLocalIp = origin && /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        
        // Allow any Vercel deployment domain
        const isVercel = origin && /\.vercel\.app$/.test(origin);
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || isLocalIp || isVercel || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
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
