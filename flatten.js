function flattenObject(obj) {
    let toReturn = {};

    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;

        if ((typeof obj[i]) === 'object' && obj[i] !== null) {
            let flatObject = flattenObject(obj[i]);
            for (let x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                let property = i + '.' + x;
                property = property.replace(/\.\d+\./g, '.');

                if (!toReturn.hasOwnProperty(property) && (typeof flatObject[x]) === 'string' && (flatObject[x]).includes(".ovh.")) {
                    if (property.includes("..")) {
                        console.log(obj._id);
                    }
                    toReturn[property] = flatObject[x];
                }
            }
        } else {
            if ((typeof obj[i]) === "string" && obj[i].includes(".ovh."))
                toReturn[i] = obj[i];
        }
    }

    return toReturn;
};

module.exports = flattenObject;




