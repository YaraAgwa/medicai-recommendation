const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'medicai';

const client = new MongoClient(uri);
const state = { db: null };

async function connect() {
  if (state.db) return state.db;
  await client.connect();
  state.db = client.db(dbName);

  await state.db.collection('users').createIndex({ email: 1 }, { unique: true });
  await state.db.collection('questions').createIndex({ patient_id: 1 });
  await state.db.collection('answers').createIndex({ question_id: 1 });
  await state.db.collection('answers').createIndex({ user_id: 1 });

  return state.db;
}

function getDb() {
  if (!state.db) throw new Error('Database not connected. Call connect() first.');
  return state.db;
}

// Collection accessors (evaluated lazily, after connect())
const collections = {
  users: () => getDb().collection('users'),
  questions: () => getDb().collection('questions'),
  answers: () => getDb().collection('answers'),
};

// Parse a string into an ObjectId, returning null when invalid (instead of throwing).
function toObjectId(id) {
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
  return null;
}

// Normalize a Mongo document for API responses: `_id` -> `id` (string) and
// stringify the ObjectId reference fields the frontend compares against.
function serialize(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  const out = { id: _id ? _id.toString() : undefined, ...rest };
  for (const key of ['patient_id', 'question_id', 'user_id']) {
    if (out[key] instanceof ObjectId) out[key] = out[key].toString();
  }
  return out;
}

module.exports = { connect, getDb, collections, toObjectId, serialize, client, ObjectId };
