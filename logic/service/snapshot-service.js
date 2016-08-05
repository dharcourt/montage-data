var Montage = require("montage/core/core").Montage;

/**
 * @class SnapshotService
 * @extends Montage
 */
exports.SnapshotService = Montage.specialize(/** @lends SnapshotService# */ {
    _cache: {
        value: null
    },

    constructor: {
        value: function() {
            this._cache = new Map();
        }
    },

    saveSnapshotForTypeNameAndId: {
        value: function(snapshot, typeName, id) {
            if (!this._cache.has(typeName)) {
                this._cache.set(typeName, new Map());
            }
            
            this._cache.get(typeName).set(id, this._getClone(snapshot));
        }
    },

    getSnapshotForTypeNameAndId: {
        value: function(typeName, id) {
            var result;
            if (this._cache.has(typeName)) {
                result = this._cache.get(typeName).get(id);
            }
            return result;
        }
    },

    removeSnapshotForTypeNameAndId: {
        value: function(typeName, id) {
            if (this._cache.has(typeName)) {
                this._cache.get(typeName).delete(id);
            }
        }
    },

    getDifferenceWithSnapshotForTypeNameAndId: {
        value: function(rawData, typeName, id) {
            var difference = this._getClone(rawData),
                cachedVersion, cachedKeys,
                key;
            if (this._cache.has(typeName)) {
                cachedVersion = this._cache.get(typeName).get(id);
            }
            if (cachedVersion) {
                cachedKeys = Object.keys(cachedVersion);
                for (var i = 0, length = cachedKeys.length; i < length; i++) {
                    key = cachedKeys[i];
                    if (this._areSameValues(rawData[key], cachedVersion[key])) {
                        delete difference[key];
                    }
                }
            }
            return difference;
        }
    },

    _getClone: {
        value: function(object) {
            if (object) {
                var result = Object.create(null),
                    keys = Object.keys(object),
                    key, temp, j, arrayLength, arrayKeys;
                for (var i = 0, length = keys.length; i < length; i++) {
                    key = keys[i];
                    if (Array.isArray(object[key])) {
                        result[key] = this._getArrayClone(object[key]);
                    } else if (typeof object[key] === "object") {
                        result[key] = this._getClone(object[key]);
                    } else {
                        result[key] = object[key];
                    }
                }
            } else {
                result = object;
            }
            return result;
        }
    },

    _getArrayClone: {
        value: function(array) {
            var result = [],
                value;
            for (var i = 0, length = array.length; i < length; i++) {
                value = array[i];
                if (Array.isArray(value)) {
                    result.push(this._getArrayClone(value));
                } else if (typeof value === "object") {
                    result.push(this._getClone(value));
                } else {
                    result.push(value);
                }
            }
            return result;
        }
    },

    _areSameValues: {
        value: function(a, b) {
            var result = a === b;
            if (!result) {
                if (typeof a === "object" && typeof b === "object") {
                    result = !!a === !!b;
                    if (result) {
                        var aKeys = Object.keys(a).sort(), aKey, aValue,
                            bKeys = Object.keys(b).sort(), bKey, bValue;
                        result = aKeys.filter(function(x) { return a[x] !== null }).length === bKeys.filter(function(x) { return b[x] !== null }).length;
                        if (result) {
                            for (var i = 0, length = aKeys.length; i < length; i++) {
                                aKey = aKeys[i];
                                bKey = bKeys[i];
                                if (aKey === bKey) {
                                    aValue = a[aKey];
                                    bValue = b[bKey];
                                    if (!this._areSameValues(aValue, bValue)) {
                                        result = false;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }
    }
});
