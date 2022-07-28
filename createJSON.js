const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const flattenObject = require('./newFlatten');

const url = 'mongodb://localhost:27017';
console.log(new Date());
async function create_OVH_JSON() {
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    const db = client.db("staging-saas-botplatform");
    try {
        const collections = await db.listCollections().toArray();

        let fieldsObj = {};
        for (let i = 0; i < collections.length; i++) {
            console.log(`Writing JSON for collection "${collections[i].name}"`);
            const documents = db.collection(collections[i].name).find().batchSize(5000);
            const set = new Set();

            while (await documents.hasNext()) {
                const document = await documents.next();
                const flattenObj = flattenObject(document);
                const keys = Object.keys(flattenObj)

                keys.forEach(elem => {
                    set.add(elem);
                })
            }

            const fieldNames = [...set];
            fieldsObj[collections[i].name] = fieldNames;
            const json = JSON.stringify(fieldsObj);
            fs.writeFile('Filter.json', json, () => {
                if (i === collections.length - 1) {
                    console.log(new Date());
                    console.log("JSON file written!!!");
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
    finally {
        // console.log(new Date());
        client.close();
    }
}

create_OVH_JSON();




