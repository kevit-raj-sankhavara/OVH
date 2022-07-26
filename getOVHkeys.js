require('dotenv').config();

function getOVHFieldInDocument(obj) {
    let toReturn = {};

    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;

        if ((typeof obj[i]) === 'object' && obj[i] !== null) {
            let flatObject = getOVHFieldInDocument(obj[i]);
            for (let x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                let property = i + '.' + x;

                if (!toReturn.hasOwnProperty(property) && (typeof flatObject[x]) === 'string' && (flatObject[x]).includes(process.env.PATTERN_FOR_JSON)) {
                    toReturn[property] = flatObject[x];
                }
            }
        } else {
            if ((typeof obj[i]) === "string" && obj[i].includes(process.env.PATTERN_FOR_JSON))
                toReturn[i] = obj[i];
        }
    }

    return toReturn;
};

module.exports = getOVHFieldInDocument;




