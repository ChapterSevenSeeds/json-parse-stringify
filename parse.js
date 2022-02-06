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
    let type = ObjectTypes.Unknown;
    let object;
    let temp;
    for (; helpers.start < input.length; ++helpers.start) {
        switch (type) {
            case ObjectTypes.Unknown:
                switch (input[helpers.start]) {
                    case '"':
                        object = "";
                        type = ObjectTypes.String;
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
                        object = input[helpers.start];
                        type = ObjectTypes.Number;
                        continue;
                    case '{':
                        object = {};
                        type = ObjectTypes.Object;
                        continue;
                    case '[':
                        object = [];
                        type = ObjectTypes.Array;
                        continue;
                    case 'n':
                        object = input[helpers.start];
                        type = ObjectTypes.Null;
                        continue;
                    case 't':
                    case 'f':
                        object = input[helpers.start];
                        type = ObjectTypes.Boolean;
                        continue;
                    case ' ':
                    case '\t':
                    case '\n':
                    case '\r':
                        continue;
                    default:
                        throw new Error(`Unrecognized token ${input[helpers.start]}.`);
                }
            case ObjectTypes.String:
                switch (input[helpers.start]) {
                    case '"':
                        return object;
                    default:
                        object += input[helpers.start].toString();
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
                        object += input[helpers.start].toString();
                    default:
                        return Number(object);
                }
            case ObjectTypes.Null:
                switch (input[helpers.start]) {
                    case 'u':
                    case 'l':
                        object += input[helpers.start];
                        continue;
                    default:
                        if (object === 'null') return null;
                        else throw new Error(`Unrecognized keyword ${object}.`);
                }
            case ObjectTypes.Boolean:
                switch (input[helpers.start]) {
                    case 'a':
                    case 'l':
                    case 's':
                    case 'e':
                    case 'r':
                    case 'u':
                        object += input[helpers.start];
                        continue;
                    default:
                        switch (object) {
                            case 'true': return true;
                            case 'false': return false;
                            default: throw new Error(`Unrecognized keyword ${object}.`);
                        }
                }
            case ObjectTypes.Object:
                switch (input[helpers.start]) {
                    case ' ':
                    case '\t':
                    case '\n':
                    case '\r':
                        continue;
                    case '"':
                        type = ObjectTypes.ObjectKey;
                        temp = "";
                        continue;
                    case ':':
                        ++helpers.start;
                        object[temp] = parseHelper(input, helpers);
                        type = ObjectTypes.Object;
                        continue;
                    case '}':
                        return object;
                }
            case ObjectTypes.ObjectKey:
                switch (input[helpers.start]) {
                    case '"':
                        type = ObjectTypes.Object;
                        continue;
                    default:
                        temp += input[helpers.start].toString();
                        continue;
                }
            case ObjectTypes.Array:
                switch (input[helpers.start]) {
                    case ',':
                        ++helpers.start;
                        continue;
                    case ']':
                        return object;
                    default:
                        object.push(parseHelper(input, helpers));
                }
        }
    }
}