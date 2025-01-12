const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! ... Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

//set mongoose options globally
mongoose.set('strictQuery', true);
mongoose.set('autoIndex', true);

mongoose
  .connect(`${process.env.DATABASE}/natours`)
  .then(() => {
    console.log('Connected to database');
  })
  .catch(err => {
    console.error('Database connection error: ', err);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! ... Shutting down...');
  server.close(() => {
    console.log('Server closed...');
    process.exit(1);
  });
});
