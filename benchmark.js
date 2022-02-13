const recursiveParse = require("./parse");
const iterativeParse = require("./parse2");
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

const parsers1 = [
    {
        name: "JSON.parse",
        function: JSON.parse
    },
    {
        name: "Tyson's recursive parse",
        function: recursiveParse
    }
];

const parsers2 = [
    {
        name: "JSON.parse",
        function: JSON.parse
    },
    {
        name: "Tyson's iterative parse",
        function: iterativeParse
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
const COUNT = 500000;

// create a new progress bar instance and use shades_classic theme
const progress = new cliProgress.SingleBar({ fps: 2 }, cliProgress.Presets.shades_classic);

// start the progress bar with a total value of 200 and start value of 0
progress.start(3 * 2 * Object.keys(data).length, 0);

const recursiveParseResults = [["Test", parsers1[0].name, parsers1[1].name, "Speed Gain"]];
for (const key of Object.keys(data)) {
    const result = [key];
    for (const parser of parsers1) {
        start = performance.now();
        for (let i = 0; i < COUNT; ++i) {
            parser.function(JSON.stringify(data[key]));
        }
        stop = performance.now();
        progress.increment();
        result.push(stop - start);
    }

    recursiveParseResults.push([...result, generateGainCell(result[1], result[2])]);
}

const iterativeParseResults = [["Test", parsers2[0].name, parsers2[1].name, "Speed Gain"]];
for (const key of Object.keys(data)) {
    const result = [key];
    for (const parser of parsers2) {
        start = performance.now();
        for (let i = 0; i < COUNT; ++i) {
            parser.function(JSON.stringify(data[key]));
        }
        stop = performance.now();
        progress.increment();
        result.push(stop - start);
    }

    iterativeParseResults.push([...result, generateGainCell(result[1], result[2])]);
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

console.log(table(recursiveParseResults, {
    header: {
        alignment: 'center',
        content: 'Recursive Parse Results'
    }
}));

console.log(table(iterativeParseResults, {
    header: {
        alignment: 'center',
        content: 'Iterative Parse Results'
    }
}));

console.log(table(stringifyResults, {
    header: {
        alignment: 'center',
        content: 'Stringify Results'
    }
}));