const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const bookingModel = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create a Checkout Session
  const DOMAIN = `${req.protocol}://${req.get('host')}`;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${DOMAIN}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${DOMAIN}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd', // Set the currency
          product_data: {
            name: tour.name, // Set the product name
            description: tour.summary, // Set the product description
            images: [`http://localhost:3000/img/tours/${tour.imageCover}`] // Product image URL
          },
          unit_amount: tour.price * 100 // Amount in cents
        },
        quantity: 1 // Quantity
      }
    ],
    mode: 'payment' // Required for one-time payments
  });

  // 3) Send session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only Temporary as it is not secure
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await bookingModel.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(bookingModel);
exports.getBooking = factory.getOne(bookingModel);
exports.getAllBookings = factory.getAll(bookingModel);
exports.updateBooking = factory.updateOne(bookingModel);
exports.deleteBooking = factory.deleteOne(bookingModel);
