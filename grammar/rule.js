module.exports = class Rule {
    Terminal;
    Identifier;
    Replacements = [];
    constructor(terminal, identifier) {
        this.Terminal = terminal;
        this.Identifier = identifier;
    }
}