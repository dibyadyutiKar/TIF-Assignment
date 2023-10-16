const express = require('express');
const router = express.Router();

const roleRoutes = require('./role');
const authRoutes = require('./auth');
const communityRoutes = require('./community');
const memberRoutes = require('./member');

router.use('/role', roleRoutes);
router.use('/auth', authRoutes);
router.use('/community', communityRoutes);
router.use('/member', memberRoutes);

module.exports = router;
