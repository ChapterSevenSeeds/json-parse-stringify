module.exports = class TableEntry {
    Rule;
    ProductionIndex;

    constructor(rule, productionIndex) {
        this.Rule = rule;
        this.ProductionIndex = productionIndex;
    }
}