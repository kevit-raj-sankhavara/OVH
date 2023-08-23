require("dotenv").config();

function getFieldsFromDocument(obj) {
  let toReturn = {};

  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;

    if (typeof obj[i] === "object" && obj[i] !== null) {
      let flatObject = getFieldsFromDocument(obj[i]);
      for (let x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        let property = i + "." + x;

        if (
          !toReturn.hasOwnProperty(property) &&
          typeof flatObject[x] === "string" &&
          flatObject[x].includes(process.env.PATTERN)
        ) {
          toReturn[property] = flatObject[x];
        }
      }
    } else {
      if (typeof obj[i] === "string" && obj[i].includes(process.env.PATTERN))
        toReturn[i] = obj[i];
    }
  }

  return toReturn;
}

module.exports = getFieldsFromDocument;
