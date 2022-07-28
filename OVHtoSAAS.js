const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

const ovhtosaas = async () => {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    const fields = ["notifications.12.data.profilePic",
        "notifications.13.data.profilePic",
        "notifications.15.data.profilePic"];
    const db = client.db("staging-saas-botplatform");
    const collection = db.collection("users");
    for (let i = 0; i < fields.length; i++) {


    }
    await collection.updateMany({ [fields[0]]: { $regex: ".ovh.", $options: "i" } }, { $set: { [fields[0]]: "https://storage.de.cloud.SAAS.net/v1/AUTH_af63bf6fa3884c108ced5661b04a5426/stagcontainer/imageFile-1599542325971-logofb.jpg" } }, { upsert: false })
    console.log("DONE");
}

ovhtosaas();
