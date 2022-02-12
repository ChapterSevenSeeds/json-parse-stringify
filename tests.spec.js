const { expect, test, describe } = require('@jest/globals');
const _ = require('lodash');
const parse = require('./parse');
const stringify = require('./stringify');

describe("Parser tests", () => {
    test("invalid", () => {
        expect(() => parse("asdf")).toThrow();
        expect(() => parse("falser")).toThrow();
        expect(() => parse("nulll")).toThrow();
    });
    test("string", () => {
        const item = "hello";
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("integer", () => {
        const item = 151888;
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("float", () => {
        const item = 151.888;
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("booleans", () => {
        let item = false;
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
        item = true;
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("array", () => {
        const item = [3, 2, 5, null, false, 1, 235235];
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("object", () => {
        const item = { "d": 3, "a": "asdf", "q": false };
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("nested array", () => {
        const item = [3, [3, 2, 5, [1, [1, [5]]]], 5, ["asdf", false, null]];
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("nested object", () => {
        const item = { "d": { "a": "asdf", "b": { "3": false } } };
        expect(parse(JSON.stringify(item))).toStrictEqual(item);
    });
});

describe("Stringify tests", () => {
    test("string", () => {
        const item = "hello";
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
    test("integer", () => {
        const item = 151888;
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
    test("float", () => {
        const item = 151.888;
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
    test("booleans", () => {
        let item = false;
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
        item = true;
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
    test("array", () => {
        const item = [3, 2, 5, null, false, 1, 235235];
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
    test("object", () => {
        const item = { "d": 3, "a": "asdf", "q": false };
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
    test("nested array", () => {
        const item = [3, [3, 2, 5, [1, [1, [5]]]], 5, ["asdf", false, null]];
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
    test("nested object", () => {
        const item = { "d": { "a": "asdf", "b": { "3": false } } };
        expect(stringify(item)).toStrictEqual(JSON.stringify(item));
    });
})