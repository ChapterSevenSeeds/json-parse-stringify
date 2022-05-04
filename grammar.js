class Range {
    Start;
    End;
    Exclusions = [];
    StartCode;
    EndCode;

    constructor(start, end, exclusions) {
        this.Start = start;
        this.StartCode = start.charCodeAt(0);
        this.End = end;
        this.EndCode = end.charCodeAt(0);
        this.Exclusions = exclusions;
    }

    isInRange(char) {
        const code = char.charCodeAt(0);

        return code >= this.StartCode && code <= this.EndCode && this.Exclusions.every(exclusion !== char);
    }

    toString() {
        return `${this.Start}${this.End}${this.Exclusions.join("")}`;
    }
}

class Rule {
    Terminal;
    Identifier;
    Replacements = [];
    constructor(terminal, identifier) {
        this.Terminal = terminal;
        this.Identifier = identifier;
    }
}

function deepIsEqual(obj1, obj2) {
    const typeofObj1 = typeof (obj1);
    const typeofObj2 = typeof (obj2);

    if (typeofObj1 !== typeofObj2) return false;

    switch (typeofObj1) {
        case "number":
        case "string":
        case "boolean":
            return obj1 === obj2;
        case "object":
            if (obj1 instanceof Set !== obj2 instanceof Set) return false;
            if ((obj1 == null) !== (obj2 == null)) return false;
            if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

            if (obj1 instanceof Set) {
                return deepIsEqual(Array.from(obj1), Array.from(obj2));
            }

            if (Array.isArray(obj1)) {
                if (obj1.length !== obj2.length) return false;
                for (let i = 0; i < obj1.length; ++i) {
                    if (!deepIsEqual(obj1[i], obj2[i])) return false;
                }
            }

            for (const key in obj1) {
                if (!(key in obj2)) return false;
                if (!deepIsEqual(obj1[key], obj2[key])) return false;
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

const grammar = require('fs').readFileSync("test grammar 3.txt").toString();

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



Set.prototype.extend = function (enumerable) {
    for (const item of enumerable) this.add(item);
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
    followSets[startVariable].add("$");

    let copy = {};

    do {
        copy = Object.keys(followSets).reduce((acc, cur) => Object.assign(acc, { [cur]: new Set(Array.from(followSets[cur])) }), {});

        for (const variable in followSets) {
            for (const replacement of ruleGroups[variable].Replacements) {
                if (replacement.length === 3 && !firstSets[replacement[2].Identifier].has("")) {
                    const firstBeta = new Set(firstSets[replacement[2].Identifier]);

                    followSets[replacement[1].Identifier].extend(firstBeta);
                } else if (replacement.length === 3 && firstSets[replacement[2].Identifier].has("")) {
                    followSets[replacement[1].Identifier].extend(followSets[variable]);
                } else if (replacement.length === 2) {
                    followSets[replacement[1].Identifier].extend(followSets[variable]);
                }
            }
        }

    } while (!deepIsEqual(followSets, copy));
}

const firstSets = Object.values(ruleGroups).reduce((acc, cur) => Object.assign(acc, { [cur.Identifier]: first(cur.Identifier) }), {});
const followSets = Object.values(ruleGroups).reduce((acc, cur) => Object.assign(acc, { [cur.Identifier]: new Set() }), {});
follow(followSets, startVariable);
console.log(firstSets);