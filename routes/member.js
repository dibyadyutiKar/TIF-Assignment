const express = require('express');
const { addMember, removeMember } = require('../controllers/memberController');
const memberRouter = express.Router();
const { auth, isCommunityAdmin } = require('../middlewares/authMiddleware');

memberRouter.post('/', auth, isCommunityAdmin, addMember);
memberRouter.delete('/:id', auth, isCommunityAdmin, removeMember);

module.exports = memberRouter;
