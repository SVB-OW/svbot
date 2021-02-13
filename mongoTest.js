const { MongoClient } = require('mongodb');
const { mongoUri } = require('./config');

const dbClient = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
(async () => {
  await dbClient.connect();
  const mongoDb = dbClient.db('svbot');
  const signups = mongoDb.collection('signups');

  let o = await signups.findOne({}, { sort: { $natural: -1 } });
  console.log('o', o);
})();
