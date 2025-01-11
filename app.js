const path = require('path');
const express = require('express');

const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewsRoutes');

const app = express();
app.set('view engine', 'pug');
// serving satic files
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", 'https://unpkg.com', 'https://js.stripe.com'],
//         styleSrc: ["'self'", 'https://fonts.googleapis.com'],
//         fontSrc: ["'self'", 'https://fonts.gstatic.com'],
//         imgSrc: ["'self'", 'data:'],
//         connectSrc: ["'self'", 'http://127.0.0.1:3000', 'ws://localhost:*'], // Allow API requests
//         frameSrc: [
//           "'self'",
//           'https://js.stripe.com' // Allow Stripe Checkout to load in iframe
//         ]
//       }
//     }
//   })
// );

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requres from this IP, please try again in a few seconds'
});

app.use('/api', limiter);

// Parse JSON request bodies (for POST, PUT, PATCH requests)
app.use(express.json({ limit: '10kb' })); // req.body larger than 10kb will be rejected

// Data sanitization again NoSQL query injection
app.use(mongoSanitize());

// Data sanitiztion against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log('hello:', req.cookies);
  console.log('test middleware');
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// 4) ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
