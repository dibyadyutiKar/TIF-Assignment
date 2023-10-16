const { Snowflake } = require('@theinternetfolks/snowflake');
const { getDb } = require('../config');

const db = getDb();
const memberCollection = db.collection('members');
const communityCollection = db.collection('communities');
const roleCollection = db.collection('roles');
const userCollection = db.collection('users');

const addMember = async (req, res) => {
  try {
    const { community, user, role } = req.body;

    // if user not found
    const existingUser = await userCollection.findOne({ _id: user });
    if (!existingUser) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: 'user',
            message: 'User not found.',
            code: 'RESOURCE_NOT_FOUND',
          },
        ],
      });
    }

    // if community does not exist
    const existingCommunity = await communityCollection.findOne({
      _id: community,
    });
    if (!existingCommunity) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: 'community',
            message: 'Community not found.',
            code: 'RESOURCE_NOT_FOUND',
          },
        ],
      });
    }

    // if role not found
    const roles = await roleCollection.findOne({ _id: role });
    if (!roles) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: 'role',
            message: 'Role not found.',
            code: 'RESOURCE_NOT_FOUND',
          },
        ],
      });
    }
    // if member already exist
    const existingMember = await memberCollection.findOne({ user: user });
    if (existingMember) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: 'User is already added in the community.',
            code: 'RESOURCE_EXISTS',
          },
        ],
      });
    }

    const id = Snowflake.generate();

    const member = await memberCollection.insertOne({
      _id: id,
      community: community,
      user: user,
      role: role,
      created_at: new Date(),
    });

    const memberData = await memberCollection.findOne({
      _id: member.insertedId,
    });

    res.status(200).json({
      status: true,
      content: {
        data: memberData,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const removeMember = async (req, res) => {
  const memberId = req.params.id;

  const existingMember = await memberCollection.findOne({ _id: memberId });
  // console.log('existing member', existingMember);

  if (!existingMember) {
    return res.status(200).json({
      status: false,
      errors: [
        {
          message: 'Member not found.',
          code: 'RESOURCE_NOT_FOUND',
        },
      ],
    });
  }

  const member = await memberCollection.deleteOne({ _id: memberId });

  //   delete member id from community
  return res.status(200).json({
    status: true,
  });
};

module.exports = {
  addMember,
  removeMember,
};
