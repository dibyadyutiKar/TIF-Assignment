const { Snowflake } = require('@theinternetfolks/snowflake');
const { getDb } = require('../config');

const db = getDb();
const memberCollection = db.collection('members');
const roleCollection = db.collection('roles');

const addMember = async (req, res) => {
  try {
    const { community, user, role } = req.body;

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
