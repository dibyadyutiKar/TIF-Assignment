const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUrl = process.env.MongoUrl;
const dbName = 'TIFDB';

let _db;

async function connectToDB() {
  try {
    const client = new MongoClient(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('Connected to MongoDB');
    _db = client.db(dbName);
  } catch (err) {
    console.error('Error connecting to MongoDB: ' + err);
  }
}

const getDb = () => {
  if (_db) {
    return _db;
  } else {
    throw 'No database found';
  }
};

module.exports = {
  connectToDB,
  getDb,
};
