function deepAreEqual(obj1, obj2) {
    const typeofObj1 = typeof (obj1);
    const typeofObj2 = typeof (obj2);

    if (typeofObj1 !== typeofObj2) return false;

    switch (typeofObj1) {
        case "number":
        case "string":
        case "boolean":
            return obj1 === obj2;
        case "symbol":
            return obj1.toString() === obj2.toString();
        case "object":
            if (obj1 instanceof Set !== obj2 instanceof Set) return false;
            if ((obj1 == null) !== (obj2 == null)) return false;
            if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

            if (obj1 instanceof Set) {
                return deepAreEqual(Array.from(obj1), Array.from(obj2));
            }

            if (Array.isArray(obj1)) {
                if (obj1.length !== obj2.length) return false;
                for (let i = 0; i < obj1.length; ++i) {
                    if (!deepAreEqual(obj1[i], obj2[i])) return false;
                }
            }

            for (const key in obj1) {
                if (!(key in obj2)) return false;
                if (!deepAreEqual(obj1[key], obj2[key])) return false;
            }

            return true;
    }
}

function singletonChar(hexOrChar) {
    if (hexOrChar.length > 1) {
        return String.fromCodePoint(parseInt(hexOrChar, 16));
    }

    return hexOrChar;
}

module.exports.singletonChar = singletonChar;
module.exports.deepAreEqual = deepAreEqual;