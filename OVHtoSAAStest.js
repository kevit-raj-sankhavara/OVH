const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const getOVHFieldInDocument = require('./changeURL');

const ovhtosaas = async () => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    const fields = [
        "value",
    ];


    const db = client.db("production-saas-botplatform");
    // const collection = db.collection("users");
    console.log(new Date());

    for (let j = 0; j < fields.length; j++) {
        const allDocs = await db.collection("userfis").find({ [fields[j]]: { $regex: /\.ovh\./, $options: "i" } }).toArray();

        for (let i = 0; i < allDocs.length; i++) {
            console.log("Updating USERS...");

            const OVHkeys = getOVHFieldInDocument(allDocs[i]);
            for (const key in OVHkeys) {
                const value = OVHkeys[key];
                const valuesArr = value.split("/");
                const fileName = valuesArr[valuesArr.length - 1];
                const saasUrl = `https://storage.de.cloud.SAAS.net/v1/AUTH_af63bf6fa3884c108ced5661b04a5426/stagcontainer/${fileName}`;
                await db.collection("userfis").updateOne({ _id: allDocs[i]._id }, { $set: { [key]: saasUrl } });
            }
        }

        const countOfDocumentFound = await db.collection("userfis").countDocuments({ "value": { $regex: /\.ovh\./, $options: 'i' } });
        if (!countOfDocumentFound) {
            continue;
        }
        const totalCount = await db.collection("userfis").estimatedDocumentCount();
        console.log(`Found ${countOfDocumentFound} out of ${totalCount} in collection: userfis`);
        // console.log(`Query: db.getCollection('${collection}').find(${JSON.stringify(finalQuery)})`);
    }
    console.log("Done ", new Date());
}

ovhtosaas();
