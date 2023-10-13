const express = require('express');
const {
  createRole,
  getAllRole,
} = require('../controllers/communityController');
const roleRouter = express.Router();

roleRouter.post('/', createRole);
roleRouter.get('/', getAllRole);

module.exports = roleRouter;
