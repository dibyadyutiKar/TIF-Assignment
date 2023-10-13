const express = require('express');

const authRouter = express.Router();

const { signUp, signIn, getUser } = require('../controllers/authController');
const { auth } = require('../middlewares/authMiddleware');

authRouter.post('/signup', signUp);
authRouter.post('/signin', signIn);
authRouter.get('/me', auth, getUser);

module.exports = authRouter;
