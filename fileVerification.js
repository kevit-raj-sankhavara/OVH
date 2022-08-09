const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const fs = require('fs');

const filesObj = {};

async function getAllFilesAndCheck() {
    console.log(new Date());
    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("staging-saas-botplatform");
        const collections = await db.listCollections().toArray();
        for (let i = 0; i < collections.length; i++) {
            console.log(`Getting Files from "${collections[i].name}"`);
            const documents = db.collection(collections[i].name).find().batchSize(10000);

            while (await documents.hasNext()) {
                const document = await documents.next();
                getFilesName(document);
            }
        }
    }
    catch (err) {
        console.log(err);
    } finally {
        client.close();
        console.log(new Date());
    }
}

const getFilesName = (obj) => {
    for (const key in obj) {
        if (typeof obj[key] === "object" && typeof obj[key] !== null) {
            getFilesName(obj[key]);
        } else {
            if (key !== "conversationData" && typeof obj[key] === "string" && obj[key].includes(".saas.")) {
                const value = obj[key];
                const valuesArr = value.split("/");
                const fileName = valuesArr[valuesArr.length - 1];
                if (!filesObj.hasOwnProperty(fileName))
                    filesObj[fileName] = 1;
                else
                    filesObj[fileName] += 1;
            }
        }
    }
}

const getFileSize = (fileName) => {
    const stats = fs.statSync(`./Images/${fileName}`);
    const fileSizeInBytes = stats.size;
    return `${fileSizeInBytes} bytes`;
}

const getFileStatus = async () => {
    await getAllFilesAndCheck();

    const DBfiles = Object.keys(filesObj);

    const localFiles = fs.readdirSync("./Images");

    const availableFiles = DBfiles.filter(file => localFiles.indexOf(file) >= 0);

    const notInLocal = {};
    DBfiles.forEach(file => {
        if (localFiles.indexOf(file) === -1)
            notInLocal[file] = filesObj[file];
    })

    const notInDB = {};
    localFiles.forEach(file => {
        if (DBfiles.indexOf(file) === -1)
            notInDB[file] = getFileSize(file);
    })

    const fileStatusObj = {
        availableFiles, notInLocal, notInDB
    };

    const json = JSON.stringify(fileStatusObj);
    fs.writeFile('./JSONFiles/FileStatus.json', json, () => {
        console.log("JSON Created");
    });
}

getFileStatus();












// Testing...
// const obj = {
//     f1: "hello.saas.hello/f1.png",
//     f2: {
//         f3: "hello.saas.hello/f3.png"
//     },
//     f10: {
//         f11: {
//             f12: "hello.saas.hello/f3.png"
//         }
//     },
//     f4: [
//         {
//             filename: {
//                 f1: "hello.saas.hello/filename_f90.png",
//             }
//         },
//         {
//             filename: {
//                 f1: "hello.saas.hello/filename_f1.png",
//             }
//         },
//         {
//             filename: {
//                 f1: "hello.ovh.hello/filename_f99.png",
//             }
//         }
//     ],
//     f99: "hello.saas.hello/f99.png",
// }