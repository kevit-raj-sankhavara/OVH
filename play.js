const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const fs = require("fs");
const getOVHFieldInDocument = require('./changeURL');
const create_OVH_JSON = require('./createJSON');

async function DoMigration(pattern) {
    // Creating JSON File
    // await create_OVH_JSON();

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("production-saas-botplatform");

        // Fetching Data from JSON File
        let checkingJSON = fs.readFileSync("Filter.json");
        checkingJSON = JSON.parse(checkingJSON);
        // return;
        const checkingQuery = { $regex: pattern, $options: 'i' };

        console.log("**** Migration Started... ****", new Date());
        for (const collection of Object.keys(checkingJSON).filter(d => checkingJSON[d].length)) {
            const finalQuery = {
                $or: checkingJSON[collection].map(field => {
                    return { [field]: checkingQuery };
                }),
            };

            // Updating url from "ovh" to "saas"
            console.log(`Updating ${collection}...`);

            const fields = checkingJSON[collection];
            for (let j = 0; j < fields.length; j++) {
                const allDocs = await db.collection(collection).find({ [fields[j]]: { $regex: ".ovh.", $options: "i" } }).toArray();

                for (let i = 0; i < allDocs.length; i++) {

                    const OVHkeys = getOVHFieldInDocument(allDocs[i]);
                    for (const key in OVHkeys) {
                        const value = OVHkeys[key];
                        const valuesArr = value.split("/");
                        const fileName = valuesArr[valuesArr.length - 1];
                        const saasUrl = `https://storage.de.cloud.SAAS.net/v1/AUTH_af63bf6fa3884c108ced5661b04a5426/stagcontainer/${fileName}`;
                        await db.collection(collection).updateOne({ _id: allDocs[i]._id }, { $set: { [key]: saasUrl } });
                    }
                }
            }

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

DoMigration(".ovh.");
