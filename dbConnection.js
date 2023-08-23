const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const url = process.env.MONGODB_URL;

const client = await MongoClient.connect(url, {
  useNewUrlParser: true,
}).catch((err) => {
  console.log(err);
});

module.exports = client;
