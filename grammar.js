class Range {
    Start;
    End;
    Exclusions = [];

    constructor(start, end, exclusions) {
        this.Start = start;
        this.End = end;
        this.Exclusions = exclusions;
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

const grammar = require('fs').readFileSync("JSON grammar.txt").toString();

const ruleGroups = {};
for (const group of grammar.matchAll(/(\w+)(?:(?:\r\n)|\n)((?:[ \t]+.*?(?:(?:\r\n)|\n|$))+)/g)) {
    const rule = new Rule(false, group[1].trim());

    for (const replacement of group[2].split(/(\r\n)|\n/).map(x => x.trim()).filter(x => x)) {
        rule.Replacements.push([]);
        let identifier;
        const items = replacement.split(' ');

        // First, loop through and fix any split items that had spaces in them.
        for (let i = 0; i < items.length; ++i) {
            if ([...items[i].matchAll(/(?<!\\)['"]/g)].length === 1) {
                items[i] += ' ' + items[i + 1];
                items.splice(i + 1, 1);
            }
        }

        // Second, fix any ranges. 
        for (let i = 0; i < items.length; ++i) {
            if (items[i] === '.') {
                const rangeStart = i - 1;
                items[rangeStart] += '.' + items[rangeStart + 2];
                while (items[i += 2] === '-') {
                    items[rangeStart] += '-' + items[i + 1];
                }

                items.splice(rangeStart + 1, i - rangeStart);
                i = rangeStart;
            }
        }

        for (const item of items) {
            if (identifier = /^"(.*?)"$/i.exec(item)) {
                // Terminal string
                if (!(identifier[1] in ruleGroups)) {
                    ruleGroups[identifier[1]] = new Rule(true, identifier[1]);
                }
                rule.Replacements[rule.Replacements.length - 1].push(ruleGroups[identifier[1]]);
            } else if (identifier = /^'([0-9A-F]{4,5}|10[0-9A-F]{4}|.)'$/i.exec(item)) {
                // Singleton
                const toString = singletonChar(identifier[1]);
                if (!(toString in ruleGroups)) {
                    ruleGroups[toString] = new Rule(true, toString);
                }
                rule.Replacements[rule.Replacements.length - 1].push(ruleGroups[toString]);
            } else if (identifier = /^'([0-9A-F]{4,5}|10[0-9A-F]{4}|.)'\.'([0-9A-F]{4,5}|10[0-9A-F]{4}|.)'((?:-'(?:[0-9A-F]{4,5}|10[0-9A-F]{4}|.)')*)$/i.exec(item)) {
                // Range
                const range = new Range(singletonChar(identifier[1]), singletonChar(identifier[2]), [...identifier[3].matchAll(/^'([0-9A-F]{4,5}|10[0-9A-F]{4}|.)'$/i)].map(singletonChar));
                rule.Replacements[rule.Replacements.length - 1].push(range);
            } else {
                // Non-terminal
                if (item in ruleGroups) {
                    rule.Replacements[rule.Replacements.length - 1].push(ruleGroups[item]);
                } else {
                    rule.Replacements[rule.Replacements.length - 1].push(item);
                }
            }
        }

    }

    ruleGroups[rule.Identifier] = rule;
}

for (const key in ruleGroups) {
    for (let i = 0; i < ruleGroups[key].Replacements; ++i) {
        if (typeof(ruleGroups[key].Replacements[i]) === 'string') {
            ruleGroups[key].Replacements[i] = ruleGroups[ruleGroups[key].Replacements[i]];
        }
    }
}
console.log(ruleGroups);