const { expect, test, describe } = require('@jest/globals');
const _ = require('lodash');
const recursiveParse = require('./parse');
const iterativeParse = require('./parse2');
const stringify = require('./stringify');

describe("Recursive parser tests", () => {
    test("invalid", () => {
        expect(() => recursiveParse("asdf")).toThrow();
        expect(() => recursiveParse("falser")).toThrow();
        expect(() => recursiveParse("nulll")).toThrow();
    });
    test("string", () => {
        const item = "hello";
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("integer", () => {
        const item = 151888;
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("float", () => {
        const item = 151.888;
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("booleans", () => {
        let item = false;
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
        item = true;
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("array", () => {
        const item = [3, 2, 5, null, false, 1, 235235];
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("object", () => {
        const item = { "d": 3, "a": "asdf", "q": false };
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("nested array", () => {
        const item = [3, [3, 2, 5, [1, [1, [5]]]], 5, ["asdf", false, null]];
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("nested object", () => {
        const item = { "d": { "a": "asdf", "b": { "3": false } } };
        expect(recursiveParse(JSON.stringify(item))).toStrictEqual(item);
    });
});

describe("Iterative parser tests", () => {
    test("invalid", () => {
        expect(() => iterativeParse("asdf")).toThrow();
        expect(() => iterativeParse("falser")).toThrow();
        expect(() => iterativeParse("nulll")).toThrow();
    });
    test("string", () => {
        const item = "hello";
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("integer", () => {
        const item = 151888;
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("float", () => {
        const item = 151.888;
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("booleans", () => {
        let item = false;
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
        item = true;
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("array", () => {
        const item = [3, 2, 5, null, false, 1, 235235];
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("object", () => {
        const item = { "d": 3, "a": "asdf", "q": false };
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("nested array", () => {
        const item = [3, [3, 2, 5, [1, [1, [5]]]], 5, ["asdf", false, null]];
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
    });
    test("nested object", () => {
        const item = { "d": { "a": "asdf", "b": { "3": false } } };
        expect(iterativeParse(JSON.stringify(item))).toStrictEqual(item);
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