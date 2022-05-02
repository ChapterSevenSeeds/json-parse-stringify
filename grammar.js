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

function singletonChar(hexOrChar) {
    if (hexOrChar.length > 1) {
        return String.fromCodePoint(parseInt(hexOrChar, 16));
    }

    return hexOrChar;
}

const grammar = require('fs').readFileSync("test grammar.txt").toString();

const ruleGroups = {};

for (const group of grammar.matchAll(/(\w+)(?:(?:\r\n)|\n)((?:[ \t]+.*?(?:(?:\r\n)|\n|$))+)/g)) {
    const rule = new Rule(false, group[1].trim());
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
                    const startRange = rule.Replacements[rule.Replacements.length - 1][rule.Replacements[rule.Replacements.length - 1].length - 1].Identifier;
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
                    rule.Replacements[rule.Replacements.length - 1].push(range);
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

const firstSets = Object.values(ruleGroups).filter(x => !x.Terminal).reduce((acc, cur) => Object.assign(acc, { [cur.Identifier]: new Set() }), {});

function first(variable) {
    const result = new Set();

    if (ruleGroups[variable].Terminal) {
        return new Set([ruleGroups[variable].Identifier]);
    }

    for (const replacement of ruleGroups[variable].Replacements) {
        for (const symbol of replacement) {
            const firstForSymbol = first(symbol.Identifier);
            if (firstForSymbol.has("")) {
                
            }
        }
    }
    if (ruleGroups[variable].Terminal) {
        return new Set([ruleGroups[variable].Identifier]);
    }

    if (ruleGroups[variable].Replacements.some(symbols => symbols.every(symbol => symbol === ""))) {
        return new Set([""]);
    }


}
for (const [variable, set] in Object.entries(firstSets)) {
    for (const rule of ruleGroups[variable]) {
        for (const symbol of rule) {
            if (symbol.Terminal) {
                set.add(symbol.Identifier);
                break;
            } else {

            }
        }
    }
}
console.log(firstSets);