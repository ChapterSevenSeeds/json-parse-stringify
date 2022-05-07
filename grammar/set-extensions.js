Set.prototype.extend = function (enumerable) {
    for (const item of enumerable) this.add(item);
}