const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const fs = require("fs");
const getFieldsFromDocument = require("./getOVHkeys");
const url = process.env.MONGODB_URL;

async function create_JSON() {
  console.log(new Date());
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
  }).catch((err) => {
    console.log(err);
  });

  if (!client) {
    return;
  }

  const db = client.db(process.env.DATABASE);
  try {
    const collections = await db.listCollections().toArray();

    let fieldsObj = {};
    for (let i = 0; i < collections.length; i++) {
      console.log(`Writing JSON for collection "${collections[i].name}"`);
      const documents = db
        .collection(collections[i].name)
        .find()
        .batchSize(10000);
      const set = new Set();

      while (await documents.hasNext()) {
        const document = await documents.next();
        const flattenObj = getFieldsFromDocument(document);
        const keys = Object.keys(flattenObj);

        keys.forEach((elem) => {
          set.add(elem);
        });
      }

      const fieldNames = [...set];
      fieldsObj[collections[i].name] = fieldNames;
      const json = JSON.stringify(fieldsObj);
      fs.writeFile("./JSONFiles/Filter.json", json, () => {
        if (i === collections.length - 1) {
          console.log(new Date());
          console.log("JSON file written!!!");
        }
      });
    }
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}

// create_JSON();

module.exports = create_JSON;
