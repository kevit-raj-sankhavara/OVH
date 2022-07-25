const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
const fs = require('fs');
const flattenObject = require('./flatten');

client.connect(function (err, client) {
    const db = client.db('staging-saas-botplatform');
    let fieldObj = {};

    client.db('staging-saas-botplatform').listCollections().toArray().then(collections => {
        collections.forEach(collection => {
            db.collection(collection.name).find({}).toArray().then(obj => {
                const set = new Set();
                if (err) throw err;
                console.log(obj.length)
                for (let i = 0; i < obj.length; i++) {
                    const flattenObj = flattenObject(obj[i]);
                    const keys = Object.keys(flattenObj)

                    keys.forEach(elem => {
                        set.add(elem);
                    })
                }
                const fieldNames = [...set];
                fieldObj[collection.name] = fieldNames;
                const json = JSON.stringify(fieldObj);
                fs.writeFile('Filter.json', json, () => {
                    console.log("File written");
                });
            });
        });
    });
});


