const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { getDb } = require('../config');
const { Snowflake } = require('@theinternetfolks/snowflake');

const db = getDb();
const userCollection = db.collection('users');

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists already
    const existingUser = await userCollection.findOne({ email });

    if (name.length < 2 || password.length <= 2 || existingUser) {
      const error = [];
      if (name.length < 2) {
        error.push({
          param: 'name',
          message: 'Name should be at least 2 characters.',
          code: 'INVALID_INPUT',
        });
      }
      if (password.length <= 2) {
        error.push({
          param: 'password',
          message: 'Password should be at least 2 characters.',
          code: 'INVALID_INPUT',
        });
      }
      if (existingUser) {
        error.push({
          param: 'email',
          message: 'User with this email address already exists.',
          code: 'RESOURCE_EXISTS',
        });
      }
      return res.status(400).json({
        status: false,
        errors: error,
      });
    }

    let hashedPassword;
    try {
      // hash the password
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      throw new Error('Error in hashing password');
    }
    const id = Snowflake.generate();
    const userInsert = await userCollection.insertOne({
      _id: id,
      name: name,
      email: email,
      password: hashedPassword,
      created_at: new Date(),
    });

    const user = await userCollection.findOne({ _id: userInsert.insertedId });
    user.password = undefined;

    const payload = {
      email: user.email,
      _id: user._id,
    };

    let token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    // set jwt token as cookie
    res
      .cookie('token', token, options)
      .status(200)
      .json({
        status: true,
        content: {
          data: user,
        },
        meta: {
          access_token: token,
        },
      });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'User cannot be registered please try again',
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Password ', password);

    // check if valid email
    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: 'email',
            message: 'Please provide a valid email address.',
            code: 'INVALID_INPUT',
          },
        ],
      });
    }
    function isValidEmail(email) {
      // Regular expression for basic email validation
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

      return emailRegex.test(email);
    }

    let user = await userCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist .Signup',
      });
    }
    const payload = {
      email: user.email,
      _id: user._id,
    };

    if (await bcrypt.compare(password, user.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '2h',
      });

      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      // set jwt token as cookie
      res
        .cookie('token', token, options)
        .status(200)
        .json({
          status: true,
          content: {
            data: user,
          },
          meta: {
            access_token: token,
          },
        });
    } else {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: 'password',
            message: 'The credentials you provided are invalid.',
            code: 'INVALID_CREDENTIALS',
          },
        ],
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Login failure',
    });
  }
};

const getUser = async (req, res) => {
  try {
    const userData = req.user;

    const user = await userCollection.findOne({ _id: userData._id });
    user.password = undefined;

    res.status(200).json({
      status: true,
      content: {
        data: user,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  signUp,
  signIn,
  getUser,
};
