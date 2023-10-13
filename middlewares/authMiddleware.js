const jwt = require('jsonwebtoken');
const { getDb } = require('../config');

const db = getDb();
const memberCollection = db.collection('members');
const roleCollection = db.collection('roles');

const auth = (req, res, next) => {
  const token =
    req.cookies.token ||
    req.body.token ||
    req.headers.authorization.split(' ')[1];
  console.log('Authori', req.headers.authorization);

  console.log('token ', token);

  if (!token || token == undefined) {
    return res.status(401).json({
      status: false,
      errors: [
        {
          message: 'You need to sign in to proceed.',
          code: 'NOT_SIGNEDIN',
        },
      ],
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;
    console.log(req.user);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Error ',
    });
  }
};

const isCommunityAdmin = async (req, res, next) => {
  const id = req.user._id;

  const member = await memberCollection.findOne({ user: id });
  console.log(member);
  const role = await roleCollection.findOne({ _id: member.role });

  console.log('Role', role);

  if (role.name == 'Community Admin') {
    next();
  } else {
    return res.status(400).json({
      status: false,
      errors: [
        {
          message: 'You are not authorized to perform this action.',
          code: 'NOT_ALLOWED_ACCESS',
        },
      ],
    });
  }
};

module.exports = {
  auth,
  isCommunityAdmin,
};
