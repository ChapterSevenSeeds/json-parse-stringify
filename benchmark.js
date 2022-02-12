const parse = require("./parse");
const stringify = require("./stringify");
const { table } = require('table');
require('colors');
const cliProgress = require('cli-progress');

function generateGainCell(builtIn, mine) {
    const gain = builtIn / mine;
    let color;
    if (gain >= 0.8 && gain <= 1.2) color = 'bgBlue';
    if (gain < 0.8) color = 'bgYellow';
    if (gain < 0.5) color = 'bgRed';
    if (gain > 1.2) color = 'bgGreen';
    return `${gain <= 1 ? `${Math.round(1 / gain * 100) / 100} times slower`[color].black : `${Math.round(gain * 100) / 100} times faster`[color].black}`;
}

const data = {
    string: "hello",
    number: 235.1,
    boolean: false,
    array: [3, 2, 5, null, false, 1, 235235],
    object: { "d": 3, "a": "asdf", "q": false },
    nestedArray: [3, [3, 2, 5, [1, [1, [5]]]], 5, ["asdf", false, null]],
    nestedObject: { "d": { "a": "asdf", "b": { "3": false } } },
};

const parsers = [
    {
        name: "JSON.parse",
        function: JSON.parse
    },
    {
        name: "Tyson's parse",
        function: parse
    }
];

const stringifiers = [
    {
        name: "JSON.stringify",
        function: JSON.stringify
    },
    {
        name: "Tyson's stringify",
        function: stringify
    }
];

let start, stop;
const COUNT = 2000000;

// create a new progress bar instance and use shades_classic theme
const progress = new cliProgress.SingleBar({ fps: 2 }, cliProgress.Presets.shades_classic);

// start the progress bar with a total value of 200 and start value of 0
progress.start(2 * 2 * Object.keys(data).length, 0);

const parseResults = [["Test", parsers[0].name, parsers[1].name, "Speed Gain"]];
for (const key of Object.keys(data)) {
    const result = [key];
    for (const parser of parsers) {
        start = performance.now();
        for (let i = 0; i < COUNT; ++i) {
            parser.function(JSON.stringify(data[key]));
        }
        stop = performance.now();
        progress.increment();
        result.push(stop - start);
    }

    parseResults.push([...result, generateGainCell(result[1], result[2])]);
}

const stringifyResults = [["Test", stringifiers[0].name, stringifiers[1].name, "Speed Gain"]];
for (const key of Object.keys(data)) {
    const result = [key];
    for (const type of stringifiers) {
        start = performance.now();
        for (let i = 0; i < COUNT; ++i) {
            type.function(data[key]);
        }
        stop = performance.now();
        progress.increment();
        result.push(stop - start);
    }

    stringifyResults.push([...result, generateGainCell(result[1], result[2])]);
}

progress.stop();

console.log(table(parseResults, {
    header: {
        alignment: 'center',
        content: 'Parse Results'
    }
}));
console.log(table(stringifyResults, {
    header: {
        alignment: 'center',
        content: 'Stringify Results'
    }
}));