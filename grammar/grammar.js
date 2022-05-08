const Rule = require('./rule');
const Range = require('./range');
const { singletonChar, deepAreEqual } = require('./tools');
require('./set-extensions');

const grammar = require('fs').readFileSync("test grammar 4.txt").toString();

const ruleGroups = {};
let startVariable;
for (const group of grammar.matchAll(/(.+?)(?:(?:\r\n)|\n)((?:[ \t]+.*?(?:(?:\r\n)|\n|$))+)/g)) {
    const rule = new Rule(false, group[1].trim());
    if (!startVariable) {
        startVariable = rule.Identifier;
    }

    for (const line of group[2].split(/(\r\n)|\n/).map(x => x.trim()).filter(x => x)) {
        rule.Replacements.push([]);
        for (let i = 0; i < line.length; ++i) {
            switch (line[i]) {
                case "'": {
                    let singleton = "";
                    while (line[++i] !== "'") singleton += line[i];
                    const toString = singletonChar(singleton);
                    if (!(toString in ruleGroups)) {
                        ruleGroups[toString] = new Rule(true, toString);
                    }
                    rule.Replacements[rule.Replacements.length - 1].push(ruleGroups[toString]);
                    break;
                }
                case '\t':
                case ' ':
                    break;
                case '"': {
                    let string = "";
                    while (line[++i] !== '"') string += line[i];
                    if (!(string in ruleGroups)) {
                        ruleGroups[string] = new Rule(true, string);
                    }
                    rule.Replacements[rule.Replacements.length - 1].push(ruleGroups[string]);
                    break;
                }
                case '.': {
                    const startRange = rule.Replacements[rule.Replacements.length - 1].splice(rule.Replacements[rule.Replacements.length - 1].length - 1, 1)[0].Identifier;
                    delete ruleGroups[startRange];
                    let endRange = "";
                    while (line[++i] !== "'"); // Consume until singleton start.
                    while (line[++i] !== "'") endRange += line[i]; // Grab the ending of the range.
                    endRange = singletonChar(endRange);
                    while (line[++i] === " "); // Consume whitespace.

                    const exclusions = [];
                    while (line[i] === '-') {
                        let exclusionChar = "";
                        while (line[++i] !== "'"); // Consume until singleton start.
                        while (line[++i] !== "'") exclusionChar += line[i]; // Grab the ending of the range.
                        exclusionChar = singletonChar(exclusionChar);
                        while (line[++i] === " "); // Consume whitespace.
                        exclusions.push(exclusionChar);
                    }

                    const range = new Range(startRange, endRange, exclusions);

                    const rangeString = range.toString();
                    if (!(rangeString in ruleGroups)) {
                        ruleGroups[rangeString] = new Rule(true, range);
                    }
                    rule.Replacements[rule.Replacements.length - 1].push(ruleGroups[rangeString]);

                    break;
                }
                default: {
                    let variable = "";
                    while (line[i] !== " " && i < line.length) variable += line[i++];

                    if (variable in ruleGroups) {
                        rule.Replacements[rule.Replacements.length - 1].push(ruleGroups[variable]);
                    } else {
                        rule.Replacements[rule.Replacements.length - 1].push(variable);
                    }
                }
            }
        }
    }

    ruleGroups[rule.Identifier] = rule;
}

for (const key in ruleGroups) {
    for (let i = 0; i < ruleGroups[key].Replacements.length; ++i) {
        for (let j = 0; j < ruleGroups[key].Replacements[i].length; ++j) {
            if (typeof (ruleGroups[key].Replacements[i][j]) === 'string') {
                ruleGroups[key].Replacements[i][j] = ruleGroups[ruleGroups[key].Replacements[i][j]];
            }
        }
    }
}

function first(variable) {
    const result = new Set();

    if (ruleGroups[variable].Terminal) {
        return new Set([ruleGroups[variable].Identifier]);
    }

    for (const replacement of ruleGroups[variable].Replacements) {
        const cumulative = new Set();
        let exhausted = true;
        for (const symbol of replacement) {
            const firstForSymbol = first(symbol.Identifier.toString());
            if (firstForSymbol.has("")) {
                firstForSymbol.delete("");
                cumulative.extend(firstForSymbol);
            } else {
                cumulative.extend(firstForSymbol);
                exhausted = false;
                break;
            }
        }

        if (exhausted) cumulative.add("");

        result.extend(cumulative);
    }

    return result;
}

function follow(followSets, startVariable) {
    followSets[startVariable].add(Symbol("EOF"));

    let copy = {};

    do {
        copy = Object.keys(followSets).reduce((acc, cur) => Object.assign(acc, { [cur]: new Set(Array.from(followSets[cur])) }), {});

        for (const variable in followSets) {
            for (const replacement of ruleGroups[variable].Replacements) {
                if (replacement.length >= 2) {
                    for (let i = 0; i < replacement.length - 1; ++i) {
                        if (ruleGroups[replacement[i].Identifier].Terminal) continue;
                        let stopped = false;
                        for (let j = i + 1; j < replacement.length; ++j) {
                            if (!ruleGroups[replacement[i].Identifier].Terminal) {
                                const firstBeta = new Set(ruleGroups[replacement[j].Identifier].Terminal ? replacement[j].Identifier : firstSets[replacement[j].Identifier]);
                                if (firstBeta.has("")) {
                                    firstBeta.delete("");
                                    followSets[replacement[i].Identifier].extend(firstBeta);
                                } else {
                                    stopped = true;
                                    followSets[replacement[i].Identifier].extend(firstBeta);
                                    break;
                                }
                            }
                        }

                        if (!stopped) {
                            followSets[replacement[i].Identifier].extend(followSets[variable]);
                        }
                    }
                }

                if (!ruleGroups[replacement[replacement.length - 1].Identifier].Terminal) {
                    followSets[replacement[replacement.length - 1].Identifier].extend(followSets[variable]);
                }
            }
        }

    } while (!deepAreEqual(followSets, copy));
}

const firstSets = Object.values(ruleGroups).filter(x => !x.Terminal).reduce((acc, cur) => Object.assign(acc, { [cur.Identifier]: first(cur.Identifier) }), {});
const followSets = Object.values(ruleGroups).filter(x => !x.Terminal).reduce((acc, cur) => Object.assign(acc, { [cur.Identifier]: new Set() }), {});
follow(followSets, startVariable);

const parseTable = {};

for (const variable in ruleGroups) {
    if (ruleGroups)
}