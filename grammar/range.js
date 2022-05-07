module.exports = class Range {
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