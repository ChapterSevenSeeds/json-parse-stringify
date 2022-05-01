class Rule {
    Terminal;

}

const grammar = require('fs').readFileSync("JSON grammar.txt").toString();
console.log(grammar);

const ruleGroups = {};
let group = null;
while (group = /\w+((\r\n)|\n)([ \t]+.*?((\r\n)|\n|$))+/.exec(grammar)) {

}
console.log(ruleGroups);

let input = "{}"
let char = '';
let index = 0;

function advance(count = 1) {
    char = input[index + count];
}

function accept(expected) {
    return char === expected;
}

function expect(expected) {
    if (char !== expected) {
        throw new Error("Syntax error");
    }
}

function json() {
    element();
}

function value() {
    const substr = input.substring(index);
    if (/^{/.test(substr)) {
        object();
    } else if (/^\[/.test(substr)) {
        array();
    } else if (/^"/.test(substr)) {
        string();
    } else if (/^(0|[1-9]|-)/.test(substr)) {
        number();
    } else if (/^true/.test(substr)) {
        advance(4);
    } else if (/^false/.test(substr)) {
        advance(5);
    } else if (/^null/.test(substr)) {
        advance(4);
    }
}

function object() {
    expect('{');
    advance();

    const substr = input.substring(index);
    
    if (/^)
}

function members() {

}

function member() {

}

function array() {

}

function elements() {

}

function element() {

}

function string() {

}

function characters() {

}

function character() {

}

function escape() {

}

function hex() {

}

function number() {

}

function integer() {

}

function digits() {

}

function digit() {

}

function onenine() {

}

function fraction() {

}

function exponent() {

}

function sign() {

}

function ws() {

}