const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const { connectToDB } = require('./config'); // Import the connectToDB function

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connect
connectToDB()
  .then(() => {
    // Database connection established
    const routes = require('./routes');

    // Handle routes
    app.use('/v1', routes);

    // Server Start
    app.listen(3000, () => {
      console.log('Server started');
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database: ' + err);
  });
