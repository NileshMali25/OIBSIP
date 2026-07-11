const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/error.middleware');

const app = express();

// 1) GLOBAL MIDDLEWARES
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development mode, allow all origins to facilitate testing from local network/devices
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:5173',
      'https://pizzadelivary.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    // Allow any Vercel deployment domain
    const isVercel = origin && /\.vercel\.app$/.test(origin);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || isVercel) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images from server
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Limit each IP to 100 requests per windowMs (10000 in dev)
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body (limit to 10kb)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serving static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Pizza Delivery API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// 2) ROUTES
const authRouter = require('./routes/auth.routes');
const pizzaRouter = require('./routes/pizza.routes');
const inventoryRouter = require('./routes/inventory.routes');
const orderRouter = require('./routes/order.routes');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/pizzas', pizzaRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/orders', orderRouter);

// 3) FALLBACK FOR UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
