const express = require('express');
const {
  getAllCommunity,
  createCommunity,
  getMembersCommunity,
  getMyOwnedCommunity,
  getMyJoinedCommunity,
} = require('../controllers/communityController');
const { auth } = require('../middlewares/authMiddleware');
const communityRouter = express.Router();

communityRouter.post('/', auth, createCommunity);
communityRouter.get('/', getAllCommunity);
communityRouter.get('/:id/members', getMembersCommunity);
communityRouter.get('/me/owner', auth, getMyOwnedCommunity);
communityRouter.get('/me/member', auth, getMyJoinedCommunity);

module.exports = communityRouter;
