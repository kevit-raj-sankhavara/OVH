const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const fs = require("fs");
const getOVHFieldInDocument = require('./getOVHkeys');
const create_OVH_JSON = require('./createJSON');
const url = process.env.MONGODB_URL;

async function DoMigration(pattern) {
    // Creating JSON File
    await create_OVH_JSON();

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db(process.env.DATABASE);

        // Fetching Data from JSON File
        let checkingJSON = fs.readFileSync("./JSONFiles/Filter.json");
        checkingJSON = JSON.parse(checkingJSON);

        const checkingQuery = { $regex: pattern, $options: 'i' };

        console.log("**** MIGRATION STARTED ****", new Date());
        for (const collection of Object.keys(checkingJSON).filter(d => checkingJSON[d].length)) {
            const finalQuery = {
                $or: checkingJSON[collection].map(field => {
                    return { [field]: checkingQuery };
                }),
            };

            // Updating url from "ovh" to "saas"
            // START
            console.log(`Updating ${collection}...`);

            const fields = checkingJSON[collection];
            // Checking for all Fields which includes OVH
            for (let j = 0; j < fields.length; j++) {
                const allDocs = await db.collection(collection).find({ [fields[j]]: { $regex: pattern, $options: "i" } }).toArray();

                // Updating document one by one
                for (let i = 0; i < allDocs.length; i++) {

                    const OVHkeys = getOVHFieldInDocument(allDocs[i]);
                    for (const key in OVHkeys) {
                        const value = OVHkeys[key];
                        const valuesArr = value.split("/");
                        const fileName = valuesArr[valuesArr.length - 1];
                        const saasUrl = `${process.env.NEW_URL}/${fileName}`;
                        // const saasUrl = `https://storage.de.cloud.saas.net/v1/AUTH_af63bf6fa3884c108ced5661b04a5426/stagcontainer/${fileName}`;

                        await db.collection(collection).updateOne({ _id: allDocs[i]._id }, { $set: { [key]: saasUrl } });
                    }
                }
            }
            // END

            const countOfDocumentFound = await db.collection(collection).countDocuments(finalQuery);
            if (!countOfDocumentFound) {
                continue;
            }
            const totalCount = await db.collection(collection).estimatedDocumentCount();
            console.log(`Found ${countOfDocumentFound} out of ${totalCount} in collection: ${collection}`);
            console.log(`Query: db.getCollection('${collection}').find(${JSON.stringify(finalQuery)})`);
        }
        console.log("**** CONGRATULATIONS, MIGRATION DONE ****", new Date());
    } catch (error) {
        console.log("Error : ", error);
    } finally {
        client.close();
    }
}

const pattern = new RegExp(process.env.PATTERN_FOR_DB_QUERY);
DoMigration(pattern);