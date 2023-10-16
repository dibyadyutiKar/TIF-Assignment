const { Snowflake } = require('@theinternetfolks/snowflake');
const { getDb } = require('../config');

const db = getDb();
const communityCollection = db.collection('communities');
const roleCollection = db.collection('roles');
const memberCollection = db.collection('members');
const userCollection = db.collection('users');

// Create a community
const createCommunity = async (req, res) => {
  try {
    const { name } = req.body;
    console.log(name);
    console.log(name.length);

    if (name.length < 3) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: 'name',
            message: 'Name should be at least 2 characters.',
            code: 'INVALID_INPUT',
          },
        ],
      });
    }
    const slug = name.toLowerCase();

    const communityExists = await communityCollection.findOne({ slug });
    console.log(communityExists);

    if (communityExists) {
      return res.status(400).json({
        status: false,
        message: 'Community with same name exists.Try another',
      });
    }

    // create role of owner
    const role = await roleCollection.findOne({ name: 'Community Admin' });
    if (!role) {
      return res.status(400).json({
        status: false,
        error: 'Cannot find the role',
      });
    }

    //   create a community with all details
    const id = Snowflake.generate();
    const response = await communityCollection.insertOne({
      _id: id,
      name,
      slug,
      owner: req.user._id,
      created_at: new Date(),
      updated_at: new Date(),
    });
    //   create a member
    const memId = Snowflake.generate();

    const member = await memberCollection.insertOne({
      _id: memId,
      community: id,
      role: role._id,
      user: req.user._id,
      created_at: new Date(),
    });

    const community = await communityCollection.findOne({
      _id: response.insertedId,
    });

    return res.status(201).json({
      status: true,
      content: {
        data: community,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
// Get all communities
const getAllCommunity = async (req, res) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const skip = (page - 1) * size;

    const communities = await communityCollection
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
          },
        },
        {
          $project: {
            name: 1,
            slug: 1,
            owner: { _id: 1, name: 1 },
            created_at: 1,
            updated_at: 1,
          },
        },
      ])
      .skip(skip)
      .limit(size)
      .toArray();

    // Calculate the total number of pages
    const totalPages = Math.ceil(communities.length / size);

    //   pending ____________________________________________________
    res.status(200).json({
      status: true,
      content: {
        meta: {
          total: communities.length,
          pages: totalPages,
          page: page,
        },
        data: communities,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
// Get All Members of a community
const getMembersCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;

    const { page = 1, size = 10 } = req.query;
    const skip = (page - 1) * size;

    const members = await memberCollection
      .aggregate([
        {
          $match: { community: communityId },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'role',
            foreignField: '_id',
            as: 'role',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $project: {
            _id: 1,
            community: 1,
            user: { _id: 1, name: 1 },
            role: { _id: 1, name: 1 },
            created_at: 1,
          },
        },
      ])
      .skip(skip)
      .limit(size)
      .toArray();

    // Calculate the total number of pages
    const totalPages = Math.ceil(members.length / size);

    res.status(200).json({
      status: true,
      content: {
        meta: {
          total: members.length,
          pages: totalPages,
          page: page,
        },
        data: members,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
    });
  }
};
// Get My Owned Community
const getMyOwnedCommunity = async (req, res) => {
  try {
    const id = req.user._id;

    const { page = 1, size = 10 } = req.query;
    const skip = (page - 1) * size;

    const community = await communityCollection
      .find({ owner: id })
      .skip(skip)
      .limit(size)
      .toArray();

    // Calculate the total number of pages
    const totalPages = Math.ceil(community.length / size);

    res.status(200).json({
      status: true,
      content: {
        meta: {
          total: community.length,
          pages: totalPages,
          page: page,
        },
        data: community,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
// Create Role
const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    if (name.length < 2) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: 'name',
            message: 'Name should be at least 2 characters.',
            code: 'INVALID_INPUT',
          },
        ],
      });
    }
    const id = Snowflake.generate();

    const response = await roleCollection.insertOne({
      _id: id,
      name,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const role = await roleCollection.findOne({ _id: response.insertedId });

    res.status(200).json({
      status: true,
      content: {
        data: role,
      },
    });
  } catch (err) {
    console.error(err);
  }
};
// Get All Role
const getAllRole = async (req, res) => {
  try {
    const { page = 1, size = 10 } = req.query;
    const skip = (page - 1) * size;

    const roles = await roleCollection.find().skip(skip).limit(size).toArray();

    const totalPages = Math.ceil(roles.length / size);

    res.status(200).json({
      status: true,
      content: {
        meta: {
          total: roles.length,
          pages: totalPages,
          page: page,
        },
        data: roles,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
// Get my Joined Community
const getMyJoinedCommunity = async (req, res) => {
  try {
    const id = req.user._id;

    const { page = 1, size = 10 } = req.query;
    const skip = (page - 1) * size;

    const members = await memberCollection
      .aggregate([
        { $match: { user: id } },
        {
          $lookup: {
            from: 'communities',
            localField: 'community',
            foreignField: '_id',
            as: 'community',
          },
        },
        {
          $unwind: '$community',
        },
        {
          $group: {
            _id: '$community._id',
            community: { $first: '$community' },
          },
        },
      ])
      .toArray();

    const totalPages = Math.ceil(members.length / size);
    const community = members.map((member) => member.community);

    res.status(200).json({
      status: true,
      content: {
        meta: {
          total: members.length,
          pages: totalPages,
          page: page,
        },
        data: community,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createCommunity,
  getAllCommunity,
  getMembersCommunity,
  getMyOwnedCommunity,
  getMyJoinedCommunity,
  createRole,
  getAllRole,
};
