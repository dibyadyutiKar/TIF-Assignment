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
    const roleRoutes = require('./routes/role');
    const authRoutes = require('./routes/auth');
    const communityRoutes = require('./routes/community');
    const memberRoutes = require('./routes/member');

    app.use('/v1/role', roleRoutes);
    app.use('/v1/auth', authRoutes);
    app.use('/v1/community', communityRoutes);
    app.use('/v1/member', memberRoutes);

    app.listen(3000, () => {
      console.log('Server started');
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database: ' + err);
  });
