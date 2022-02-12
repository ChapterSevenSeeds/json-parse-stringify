/**
 * Stringifies the given input thing.
 * @param {any} input The input thing.
 * @returns {string} The result;
 */
module.exports = function (input) {
    switch (typeof input) {
        case "string":
            return `"${input}"`;
        case "number":
            return input.toString();
        case "boolean":
            return input ? 'true' : 'false';
        case "object":
            if (input === null) {
                return 'null';
            } else if (Array.isArray(input)) {
                let output = "[";
                for (const item of input) {
                    const stringifiedElement = module.exports(item);
                    if (stringifiedElement) {
                        output += `${stringifiedElement},`;
                    }

                }
                return `${output.substring(0, output.length - 1)}]`;
            } else {
                let output = "{";
                for (const key in input) {
                    const stringifiedValue = module.exports(input[key]);
                    if (stringifiedValue != null) {
                        output += `"${key}":${stringifiedValue},`;
                    }
                }

                return `${output.substring(0, output.length - 1)}}`;
            }
        default:
            return undefined;
    }
}