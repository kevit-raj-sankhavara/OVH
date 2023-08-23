const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const fs = require("fs");
const getFieldsFromDocument = require("./getOVHkeys");
const create_JSON = require("./createJSON");
const url = process.env.MONGODB_URL;

async function DoMigration(pattern) {
  // Creating JSON File
  //   await create_JSON();

  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
  }).catch((err) => {
    console.log(err);
  });

  if (!client) {
    return;
  }

  try {
    const db = client.db(process.env.DATABASE);

    // Fetching Data from JSON File
    let checkingJSON = fs.readFileSync("./JSONFiles/Filter.json");
    checkingJSON = JSON.parse(checkingJSON);

    const checkingQuery = { $regex: pattern, $options: "i" };

    console.log("**** MIGRATION STARTED ****", new Date());
    for (const collection of Object.keys(checkingJSON).filter(
      (d) => checkingJSON[d].length
    )) {
      const finalQuery = {
        $or: checkingJSON[collection].map((field) => {
          return { [field]: checkingQuery };
        }),
      };

      // Updating url from "ovh" to "saas"
      // START
      console.log(`Updating ${collection}...`);

      const fields = checkingJSON[collection];
      //   for (let i = 0; i < fields.length; i++) {
      //     console.log("&&&&&&&&&&&&&", fields[i]);
      //     await db
      //       .collection(collection)
      //       .updateMany({ [fields[i]]: { $ne: null } }, [
      //         {
      //           $set: {
      //             [fields[i]]: {
      //               $concat: [
      //                 // {
      //                 //   $arrayElemAt: [
      //                 //     {
      //                 //       $split: [`$${fields[i]}`, process.env.OLD_URL],
      //                 //     },
      //                 //     0,
      //                 //   ],
      //                 // },
      //                 process.env.NEW_URL,
      //                 {
      //                   $arrayElemAt: [
      //                     {
      //                       $split: [`$${fields[i]}`, process.env.OLD_URL],
      //                     },
      //                     1,
      //                   ],
      //                 },
      //               ],
      //             },
      //           },
      //         },
      //       ]);
      //   }

      //   Checking for all Fields which includes OVH
      for (let j = 0; j < fields.length; j++) {
        const allDocs = await db
          .collection(collection)
          .find({ [fields[j]]: { $regex: pattern, $options: "i" } })
          .toArray();

        const promiseArr = [];
        // Updating document one by one
        for (let i = 0; i < allDocs.length; i++) {
          //   const key = fields[j];
          //   const obj = allDocs[i];
          //   console.log("*****", obj["customFields"], fields[0]);
          const OVHkeys = getFieldsFromDocument(allDocs[i]);
          for (const key in OVHkeys) {
            let value = OVHkeys[key];
            // if (
            //   typeof value === "string" &&
            //   (value.startsWith("{") || value.startsWith("[")) &&
            //   (value.endsWith("}") || value.endsWith("]"))
            // ) {
            //   value = JSON.parse(value);
            // }
            value = value.replace(
              /https:\/\/.*s3.ap-south-1.amazonaws\.com/g,
              process.env.NEW_URL
            );
            // const valuesArr = value.split("/");
            // const fileName = valuesArr[valuesArr.length - 1];
            // const remainingPath = valuesArr.slice(3).join("/");
            // const saasUrl = `${process.env.NEW_URL}/${remainingPath}`;
            // const saasUrl = `https://storage.de.cloud.saas.net/v1/AUTH_af63bf6fa3884c108ced5661b04a5426/stagcontainer/${fileName}`;

            await db
              .collection(collection)
              .updateOne({ _id: allDocs[i]._id }, { $set: { [key]: value } });
          }
        }
      }
      // END

      const countOfDocumentFound = await db
        .collection(collection)
        .countDocuments(finalQuery);
      if (!countOfDocumentFound) {
        continue;
      }
      const totalCount = await db
        .collection(collection)
        .estimatedDocumentCount();
      console.log(
        `Found ${countOfDocumentFound} out of ${totalCount} in collection: ${collection}`
      );
      console.log(
        `Query: db.getCollection('${collection}').find(${JSON.stringify(
          finalQuery
        )})`
      );
    }
    console.log("**** CONGRATULATIONS, MIGRATION DONE ****", new Date());
  } catch (error) {
    console.log("Error : ", error);
  } finally {
    client.close();
  }
}

// const pattern = new RegExp(process.env.PATTERN);
DoMigration(process.env.PATTERN);
