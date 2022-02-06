const parse = require("./parse");

const tests = {
    string: JSON.stringify("hello"),
    number: JSON.stringify(235.1),
    boolean: JSON.stringify(false),
    array: JSON.stringify([3, 2, 5, null, false, 1, 235235]),
    object: JSON.stringify({ "d": 3, "a": "asdf", "q": false }),
    nestedArray: JSON.stringify([3, [3, 2, 5, [1, [1, [5]]]], 5, ["asdf", false, null]]),
    nestedObject: JSON.stringify({ "d": { "a": "asdf", "b": { "3": false } } }),
};

const types = [
    {
        name: "JSON.parse",
        function: JSON.parse
    },
    {
        name: "Tyson's parse",
        function: parse
    }
];

let start, stop;
const COUNT = 1000000;
console.log(`Running ${COUNT} tests...\n`);
for (const key of Object.keys(tests)) {
    console.log(key);
    for (const type of types) {
        start = performance.now();
        for (let i = 0; i < COUNT; ++i) {
            type.function(tests[key]);
        }
        stop = performance.now();
        console.log(`${type.name}: ${stop - start} milliseconds`);
    }
    console.log();
}