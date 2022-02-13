const { ObjectTypes } = require("./enums")

/**
 * Parses a JSON string and returns the resulting object.
 * @param {string} input The stringified JSON object. 
 * @returns {any} The resulting object.
 */
module.exports = function (input) {
    return parseHelper(input, { start: 0 });
}

/**
 * The parse helper.
 * @param {string} input The input string.
 * @param {{ start: Number }} helpers The helper object. Currently for incrementing the string position by reference.
 * @returns {any} The resulting object.
 */
function parseHelper(input, helpers) {
    let types = [ObjectTypes.Unknown];
    let objects = [];
    for (; helpers.start <= input.length; ++helpers.start) {
        switch (types[types.length - 1]) {
            case ObjectTypes.Unknown:
                switch (input[helpers.start]) {
                    case '"':
                        objects.push("");
                        types[types.length - 1] = ObjectTypes.String;
                        continue;
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        objects.push(input[helpers.start]);
                        types[types.length - 1] = ObjectTypes.Number;
                        continue;
                    case '{':
                        objects.push({});
                        types[types.length - 1] = ObjectTypes.Object;
                        continue;
                    case '[':
                        objects.push([]);
                        types[types.length - 1] = ObjectTypes.Array;
                        continue;
                    case 'n':
                        objects.push(input[helpers.start]);
                        types[types.length - 1] = ObjectTypes.Null;
                        continue;
                    case 't':
                    case 'f':
                        objects.push(input[helpers.start]);
                        types[types.length - 1] = ObjectTypes.Boolean;
                        continue;
                    default:
                        continue;
                }
            case ObjectTypes.String:
                switch (input[helpers.start]) {
                    case '"':
                        types.pop();
                        continue;
                    default:
                        objects[objects.length - 1] += input[helpers.start].toString();
                        continue;
                }
            case ObjectTypes.Number:
                switch (input[helpers.start]) {
                    case '0':
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                    case '.':
                        objects[objects.length - 1] += input[helpers.start].toString();
                        continue;
                    default:
                        --helpers.start;
                        objects[objects.length - 1] = Number(objects[objects.length - 1]);
                        types.pop();
                        continue;
                }
            case ObjectTypes.Null:
                switch (input[helpers.start]) {
                    case 'u':
                    case 'l':
                        objects[objects.length - 1] += input[helpers.start];
                        continue;
                    default:
                        --helpers.start;
                        if (objects[objects.length - 1] === 'null') {
                            objects[objects.length - 1] = null;
                            types.pop();
                            continue;
                        }
                        else throw new Error(`Unrecognized keyword ${objects[objects.length - 1]}.`);
                }
            case ObjectTypes.Boolean:
                switch (input[helpers.start]) {
                    case 'a':
                    case 'l':
                    case 's':
                    case 'e':
                    case 'r':
                    case 'u':
                        objects[objects.length - 1] += input[helpers.start];
                        continue;
                    default:
                        --helpers.start;
                        switch (objects[objects.length - 1]) {
                            case 'true': 
                                objects[objects.length - 1] = true;
                                types.pop()
                                continue;
                            case 'false': 
                                objects[objects.length - 1] = false;
                                types.pop();
                                continue;
                            default: 
                                throw new Error(`Unrecognized keyword ${objects[objects.length - 1]}.`);
                        }
                }
            case ObjectTypes.Object:
                switch (input[helpers.start]) {
                    default:
                        continue;
                    case ',': {
                        const [value, key] = [objects.pop(), objects.pop()];
                        objects[objects.length - 1][key] = value;
                        continue; 
                    }
                    case '"':
                        types.push(ObjectTypes.ObjectKey);
                        objects.push("");
                        continue;
                    case ':':
                        types.push(ObjectTypes.Unknown);
                        continue;
                    case '}': {
                        const [value, key] = [objects.pop(), objects.pop()];
                        objects[objects.length - 1][key] = value;
                        types.pop();
                        continue;
                    }
                }
            case ObjectTypes.ObjectKey:
                switch (input[helpers.start]) {
                    case '"':
                        types.pop();
                        continue;
                    default:
                        objects[objects.length - 1] += input[helpers.start].toString();
                        continue;
                }
            case ObjectTypes.Array:
                switch (input[helpers.start]) {
                    case ',':
                        objects[objects.length - 2].push(objects.pop())
                        continue;
                    case ']':
                        objects[objects.length - 2].push(objects.pop())
                        types.pop();
                        continue;
                    default:
                        types.push(ObjectTypes.Unknown);
                        --helpers.start;
                        continue;
                }
        }
    }

    return objects[0];
}