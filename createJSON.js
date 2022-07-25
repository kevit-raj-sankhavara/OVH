const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const flattenObject = require('./flatten');

const url = 'mongodb://localhost:27017';

async function create_OVH_JSON() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("staging-saas-botplatform");
        const collections = await db.listCollections().toArray();

        let fieldsObj = {};
        collections.forEach(async (collection) => {
            // const documents = await db.collection(collection.name).find().toArray();
            const documents = db.collection(collection.name).find().batchSize(5000);
            const set = new Set();

            // documents.forEach(document => {
            //     const flattenObj = flattenObject(document);
            //     const keys = Object.keys(flattenObj)

            //     keys.forEach(elem => {
            //         set.add(elem);
            //     })
            // })

            while (await documents.hasNext()) {
                const document = await documents.next();
                const flattenObj = flattenObject(document);
                const keys = Object.keys(flattenObj)

                keys.forEach(elem => {
                    set.add(elem);
                })
            }

            const fieldNames = [...set];
            fieldsObj[collection.name] = fieldNames;
            const json = JSON.stringify(fieldsObj);
            fs.writeFile('Filter.json', json, () => {
                console.log("Writing File...");
            });
        });
    } catch (err) {
        console.log(err);
    }
    finally {
        console.log("Done");
    }
}

create_OVH_JSON();




