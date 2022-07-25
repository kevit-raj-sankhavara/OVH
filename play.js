const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

// Cursor Implementation
async function cursor() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("staging-saas-botplatform");
        const collection = db.collection("transcripts");
        const myCursor = collection.find().batchSize(10000);
        let i = 0;
        while (await myCursor.hasNext()) {
            console.log(await myCursor.next());
            console.log(++i);
        }
    }
    catch (e) {

        console.log(e);
    }
}

cursor()

// 391642000425