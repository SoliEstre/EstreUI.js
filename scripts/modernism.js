/*

MIT License

Copyright (c) 2025 Estre Soliette (SoliEstre)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

     

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

// Modernism.js - Estre Modernism javscript patch //
// 
// Collections of bypass for process codes takes be inline,
// and monkey patching like as modern languages.
// 
// v0.4.0 / release 2025.08.20
// 
// Author: Estre Soliette
// Established: 2025.01.05


// primitive types alias constant
const UNDEFINED = "undefined";
const NULL = "null";
const TRUE = "true";
const FALSE = "false";

// prototype of primitive types alias constant
const FUNCTION = "function";
const BOOLEAN = "boolean";
const STRING = "string";
const SYMBOL = "symbol";
const NUMBER = "number";
const BIGINT = "bigint";
const OBJECT = "object";

// class names of primitive types constant
const _FUNCTION = "Function";
const _BOOLEAN = "Boolean";
const _STRING = "String";
const _SYMBOL = "Symbol";
const _NUMBER = "Number";
const _BIG_INT = "BigInt";
const _OBJECT = "Object";

// frequent object types alias constant
const _DATE = "Date";

const _ARRAY = "Array";
const _SET = "Set";
const _MAP = "Map";


// frequent assign types alias constant
const DEFAULT = "default";
const FINALLY = "finally";


// bypass constant
const executeIf = (bool, work = () => {}, args = [], ornot = () => {}) => {
    if (bool) return work(...args);
    else return ornot(...args);
}
const executeWhen = (args = [], isTrue = args => 1 == "0", work = args => {}, ornot = () => {}) => {
    if (isTrue(...args)) return work(...args);
    else return ornot(...args);
}

const ifReturn = (bool, returns, orNot) => bool ? returns : orNot;

const ifReturnOrEmptyNumber = (bool, returns) => ifReturn(bool, returns, 0);
const ifReturnOrEmptyString = (bool, returns) => ifReturn(bool, returns, "");
const ifReturnOrEmptyArray = (bool, returns) => ifReturn(bool, returns, []);
const ifReturnOrEmptyObject = (bool, returns) => ifReturn(bool, returns, {});

const valet = (value, process = it => it) => process(value);


// common process shortcut constant
const forZeroToBefore = (toward, work = i => { return false; }) => {
    for (let i=0; i<toward; i++) if (work(i)) break;
}
const forZeroToReach = (toward, work = i => { return false; }) => {
    for (let i=0; i<=toward; i++) if (work(i)) break;
}

const forToZeroFrom = (begins, work = i => { return false; }) => {
    for (let i=begins; i>=0; i--) if (work(i)) break;
}
const forToPrimeFrom = (begins, work = i => { return false; }) => {
    for (let i=begins; i>0; i--) if (work(i)) break;
}

const forForward = (from, work = i => { return false; }) => {
    for (let i=0; i<from.length; i++) if (work(i, from[i])) break;
}
const forBackward = (from, work = i => { return false; }) => {
    for (let i=from.length-1; i>=0; i--) if (work(i, from[i])) break;
}

const forin = (from, work = (k, v) => { return false; }) => {
    for (const k in from) if (work(k, from[k])) break;
}
const forinner = (from, work = v => { return false; }) => {
    for (const k in from) if (work(from[k])) break;
}

const forof = (from, work = v => { return false; }) => {
    for (const v of from) if (work(v)) break;
}
const forkv = (from, work = (k, v) => { return false; }) => {
    for (const [k, v] of Object.entries(from)) if (work(k, v)) break;
}

const whileIn = function (cond = function (self) { return true; }, work = function (self, count) { return false; }, self = {}) {
    forinner(self, (i, v) => this[i] = v);
    this.origin = self;
    this.cond = cond;
    this.work = work;
    let count = 0;
    while (this.cond(this)) if (this.work(this, count++)) break;
    return this;
}
const doWhileIn = function (cond = function (self) { return true; }, work = function (self, count) { return false; }, self = {}) {
    forinner(self, (i, v) => this[i] = v);
    this.origin = self;
    this.cond = cond;
    this.work = work;
    let count = 0;
    do if (this.work(this, count++)) break;
    while (this.cond(this));
    return this;
}


// meaning comparator constant
const typeOf = (val, process = it => it) => process(typeof val);

const typeMatch = (val, type) => typeof val == type;

const typeUndefined = val => typeMatch(val, UNDEFINED);
const typeFunction = val => typeMatch(val, FUNCTION);
const typeBoolean = val => typeMatch(val, BOOLEAN);
const typeString = val => typeMatch(val, STRING);
const typeSymbol = val => typeMatch(val, SYMBOL);
const typeNumber = val => typeMatch(val, NUMBER);
const typeBigint = val => typeMatch(val, BIGINT);
const typeObject = val => typeMatch(val, OBJECT);

const instanceMatch = (val, theClass = Object) => val instanceof theClass;
const isObject = val => instanceMatch(val);
const isArray = val => instanceMatch(val, Array);
const isString = val => instanceMatch(val, String);
const isNumber = val => instanceMatch(val, Number);
const isSet = val => instanceMatch(val, Set);
const isMap = val => instanceMatch(val, Map);

const exact = (...values) => values.reduce((accrue, value, index, array) => array[index-1] === value ? true : array.splice(index + 1) && false);
const notExact = (...values) => values.reduce((accrue, value, index, array) => array[index-1] !== value ? !(array.splice(index + 1) && false) : false);
const exactMatches = exact;
const notExactMatches = notExact;

const equals = (a, b) => a == b;
const notEquals = (a, b) => a != b;
const same = (a, b) => a == b;
const diffrent = (a, b) => a != b;

const getherThan = (a, b) => a > b;
const lessThan = (a, b) => a < b;
const notGetherThan = (a, b) => a <= b;
const notLessThan = (a, b) => a >= b;

const getherOrEquals = (a, b) => a >= b;
const lessOrEquels = (a, b) => a <= b;
const notGetherAndEquals = (a, b) => a < b;
const notLessAndEquals = (a, b) => a > b;

const isFalseCase = val => !val;
const isTrueCase = val => !!val;
const isNotFalseCase = isTrueCase;

const isUndefined = val => exact(val, undefined);
const isNull = val => exact(val, null);
const isExactTrue = val => exact(val, true);
const isHolyTrue = isExactTrue;
const isExactFalse = val => exact(val, false);
const isHolyFalse = isExactFalse

const isNotUndefined = val => notExact(val, undefined);
const isNotNull = val => notExact(val, null);
const isNotTrue = val => notExact(val, true);
const isNotFalse = val => notExact(val, false);

const isNully = val => equals(val, null);
const isTruely = val => equals(val, true);
const isFalsely = val => equals(val, false);
const isEmpty = (val, numberEmptyMatch = 0) => typeCase(val, {
    [BOOLEAN]: v => !!v <= numberEmptyMatch,
    [NUMBER]: v => v <= numberEmptyMatch,
    [BIGINT]: v => v <= numberEmptyMatch,
    [DEFAULT]: v => {
        const keys = Object.keys(v);
        if (keys.includes("length") && Number.isInteger(v.length)) return v.length <= numberEmptyMatch;
        else if (keys.includes("size") && Number.isInteger(v.size)) return v.size <= numberEmptyMatch;
        else return keys.length <= numberEmptyMatch
    },
});

const isNotNully = val => notEquals(val, null);
const isNotTruely = val => notEquals(val, true);
const isNotFalsely = val => notEquals(val, false);
const isNotEmpty = (val, numberEmptyMatch = 0) => typeCase(val, {
    [BOOLEAN]: v => !!v > numberEmptyMatch,
    [NUMBER]: v => v > numberEmptyMatch,
    [BIGINT]: v => v > numberEmptyMatch,
    [DEFAULT]: v => {
        const keys = Object.keys(v);
        if (keys.includes("length") && Number.isInteger(v.length)) return v.length > numberEmptyMatch;
        else if (keys.includes("size") && Number.isInteger(v.size)) return v.size > numberEmptyMatch;
        else return keys.length > numberEmptyMatch
    },
});

const isNullOrEmpty = val => isNully(val) || isEmpty(val);
const isNotNullAndEmpty = (val, numberEmptyMatch = 0) => isNotNully(val) && isNotEmpty(val, numberEmptyMatch);


// quick execute by conditions constant
const ifNullOrEmpty = (val, process = it => it, orNot = it => it) => isNullOrEmpty(val) ? process(val) : orNot(val);
const ifNotNullAndEmpty = (val, process = it => it, orNot = it => it, numberEmptyMatch = 0) => isNotNullAndEmpty(val, numberEmptyMatch) ? process(val) : orNot(val);


// do and return inline double takes
const doAndReturn = (does = args => {}, returns, ...args) => { does(...args); return returns; };
const doAndReturnByExecute = (does = args => {}, forReturns, ...args) => { does(...args); return forReturns(...args); };


// object method shortcut constant
const keysOf = (object) => Object.keys(object);
const waysOf = keysOf;
const valuesOf = (object) => Object.values(object);
const looksOf = valuesOf;
const entriesOf = (object) => Object.entries(object);
const entireOf = entriesOf;
const countOf = (object) => keysOf(object).length;
const casesOf = countOf;

const checkCount = (object, checker = (k, v) => true) => {
    let count = 0;
    forin(entriesOf(object), ([k, v]) => executeIf(checker(k, v), _ => count++));
    return count;
}


// match case constant
const matchCase = (val, cases = { [DEFAULT]: val => {}, [FINALLY]: (val, returns) => {} }, ignoreCase = false) => {
    let match;
    forin(cases, (k, v) => executeIf(k != DEFAULT && rx(k, ignoreCase ? "i" : "").test(val), () => doAndReturn(() => match = v, true)));
    const defaultCase = cases[DEFAULT];
    const finallyCase = cases[FINALLY];
    const returns = isNotNully(match) ? (typeFunction(match) ? match(val) : match) : (typeFunction(defaultCase) ? defaultCase(val) : defaultCase);
    const returnFinal = typeFunction(finallyCase) ? finallyCase(val, returns) : finallyCase;
    return isUndefined(returnFinal) ? returns : returns ?? returnFinal;
}
const equalCase = (val, cases = { [DEFAULT]: val => {}, [FINALLY]: (val, returns) => {} }, ignoreCase = false) => {
    let match;
    const vlc = to(val) == STRING ? val.toLowerCase() : val;
    forin(cases, (k, v) => executeIf(k != DEFAULT && (ignoreCase ? (to(k) == STRING ? k.toLowerCase() : k) == vlc : k == val), () => doAndReturn(() => match = v, true)));
    const defaultCase = cases[DEFAULT];
    const finallyCase = cases[FINALLY];
    const returns = isNotNully(match) ? (typeFunction(match) ? match(val) : match) : (typeFunction(defaultCase) ? defaultCase(val) : defaultCase);
    const returnFinal = typeFunction(finallyCase) ? finallyCase(val, returns) : finallyCase;
    return isUndefined(returnFinal) ? returns : returns ?? returnFinal;
}
const exactCase = (val, cases = { [DEFAULT]: val => {}, [FINALLY]: (val, returns) => {} }) => {
    const match = cases[val];
    const defaultCase = cases[DEFAULT];
    const finallyCase = cases[FINALLY];
    const returns = isNotNully(match) ? (typeFunction(match) ? match(val) : match) : (typeFunction(defaultCase) ? defaultCase(val) : defaultCase);
    const returnFinal = typeFunction(finallyCase) ? finallyCase(val, returns) : finallyCase;
    return isUndefined(returnFinal) ? returns : returns ?? returnFinal;
}
const typeCase = (variable, cases = { [DEFAULT]: variable => {}, [FINALLY]: (variable, returns) => {} }) => {
    const type = to(variable);
    const match = cases[type];
    const defaultCase = cases[DEFAULT];
    const finallyCase = cases[FINALLY];
    const returns = isNotNully(match) ? (typeFunction(match) ? match(variable) : match) : (typeFunction(defaultCase) ? defaultCase(variable) : defaultCase);
    const returnFinal = typeFunction(finallyCase) ? finallyCase(variable, returns) : finallyCase;
    return isUndefined(returnFinal) ? returns : returns ?? returnFinal;
}
const classCase = (object, cases = { [DEFAULT]: object => {}, [FINALLY]: (object, returns) => {} }) => {
    const className = object.constructor.name;
    const match = cases[className];
    const defaultCase = cases[DEFAULT];
    const finallyCase = cases[FINALLY];
    const returns = isNotNully(match) ? (typeFunction(match) ? match(object) : match) : (typeFunction(defaultCase) ? defaultCase(object) : defaultCase);
    const returnFinal = typeFunction(finallyCase) ? finallyCase(object, returns) : finallyCase;
    return isUndefined(returnFinal) ? returns : returns ?? returnFinal;
}
const kindCase = (kindFrom, cases = { [DEFAULT]: val => {}, [FINALLY]: val => {val, returns} }) => typeCase(kindFrom, { ...cases, [OBJECT]: () => classCase(kindFrom, { ...cases, [FINALLY]: undefined }) });


/** variable data copy */
const copy = (from, dataOnly = true, primitiveOnly = false, recusive = true) => isNully(from) ? from : typeCase(from, {
    [OBJECT]: val => {
        const object = new val.constructor();
        if (dataOnly || primitiveOnly) {
            for (const key in val) if (isNully(val) || typeCase(val[key], {
                [FUNCTION]: _ => !dataOnly,
                [OBJECT]: _ => !primitiveOnly,
                [DEFAULT]: _ => true
            })) object[key] = recusive ? copy(val[key], dataOnly, primitiveOnly, recusive) : val[key];
        } else for (const key in val) object[key] = copy(val[key], dataOnly, primitiveOnly);
        return object;
    },
    [DEFAULT]: val => val
});
/** Object data only shallow copy */
const mock = from => copy(from, true, false, true);
/** Object data only deep copy */
const mimic = from => copy(from, true, false, true);
/** Object functional shallow copy */
const twin = from => copy(from, false, false, false);
/** Object functional deep copy */
const clone = from => copy(from, false, false, true);

/** object data patch */
const patch = (to, from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) => {
    if (!append) for (const key in to) if (typeUndefined(from[key]) && typeCase(to[key], {
        [FUNCTION]: _ => !dataOnly,
        [OBJECT]: _ => !primitiveOnly,
        [DEFAULT]: _ => true
    })) delete to[key];
    for (const key in from) if (isNully(from[key])) to[key] = from[key];
    else typeCase(from[key], {
        [FUNCTION]: val => {
            if (!dataOnly) to[key] = val;
        },
        [OBJECT]: val => {
            if (!primitiveOnly) {
                if (recusive) {
                    if (isNully(to[key])) to[key] = from[key].constructor();
                    patch(to[key], val, dataOnly, primitiveOnly, recusive, append);
                } else to[key] = val;
            }
        },
        [DEFAULT]: val => to[key] = val
    });
    return to;
};
/** object data overwrite */
const overwrite = (to, from) => patch(to, from, false, false, true, false);
/** object data takeover */
const takeover = (to, from) => patch(to, from, false, false, true, true);
/** object data acquire */
const acquire = (to, from) => patch(to, from, true, false, true, false);
/** object data inherit */
const inherit = (to, from) => patch(to, from, true, false, true, true);

const revert = (to, from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) => {
    fromKeys = keysOf(from);
    toKeys = keysOf(to);
    scanKeys = exceptNew ? fromKeys : [...new Set([...fromKeys, ...toKeys])];
    for (const key of scanKeys) if (exceptNew || fromKeys.includes(key)) {
        if (isNully(from[key])) to[key] = from[key];
        else typeCase(from[key], {
            [FUNCTION]: val => {
                if (!dataOnly) to[key] = val;
            },
            [OBJECT]: val => {
                if (!primitiveOnly) {
                    if (recusive) revert(to[key], val, dataOnly, primitiveOnly, recusive, exceptNew);
                    else to[key] = val;
                }
            },
            [DEFAULT]: val => to[key] = val,
        });
    } else if (isNully(to[key]) || typeCase(to[key], {
        [FUNCTION]: _ => !dataOnly,
        [OBJECT]: _ => !primitiveOnly,
        [DEFAULT]: _ => true
    })) delete to[key];
};


/** run handle */
const postQueue = (process = (...args) => args[0], ...args) => setTimeout(process, 0, ...args);
const postDelayed = (process = (...args) => args[0], delay = 100, ...args) => setTimeout(process, delay, ...args);
const postPromise = (process = (rs, rj, ...args) => rs(args[0]), ...args) => new Promise((rs, rj) => process(rs, rj, ...args));
const postBonded = (process = (rs, rj, ...args) => rs(args[0]), delay = 100, ...args) => new Promise((rs, rj) => setTimeout(process, delay, rs, rj, ...args));
const postPromiseQueue = (process = (rs, rj, ...args) => rs(args[0]), ...args) => new Promise((rs, rj) => setTimeout(process, 0, rs, rj, ...args));
const postAsyncQueue = (process = async (...args) => args[0], ...args) => process(...args);
const postAwaitQueue = async (process = async (...args) => args[0], ...args) => await process(...args);
const postFrameQueue = (process = (...args) => args[0], ...args) => requestAnimationFrame(() => process(...args));
const postFramePromise = (process = (rs, rj, ...args) => rs(args[0]), ...args) => new Promise((rs, rj) => requestAnimationFrame(() => process(rs, rj, ...args)));


// Object function shortcut constants
const defineStaticProperty = (cls, name, value, wa = true, ca = true, ea = false, extras = {}) => Object.defineProperty(cls, name, {
    value,
    writable: wa,
    configurable: ca,
    enumerable: ea,
    ...extras,
});
const defineProperty = (cls, name, value, wa = true, ca = true, ea = false, extras = {}) => defineStaticProperty(cls.prototype, name, value, wa, ca, ea, extras);
    // obj.defineProperty(cls.prototype, name, {
    //     // get value() { return tc(value, {
    //     //     // [FUNCTION]: it => it,//function (...args) { return (value.bind(this))(...args); },
    //     //     // [DEFAULT]: it => cls(it),
    //     //     [BOOLEAN]: it => Boolean(it),
    //     //     [NUMBER]: it => Number(it),
    //     //     [STRING]: it => String(it),
    //     //     [BIGINT]: it => BigInt(it),
    //     //     [DEFAULT]: it => it,
    //     // }); },
    //     value,
    //     writable: wa,
    //     configurable: ca,
    //     enumerable: ea,
    //     ...extras,
    // });
const definePropertyPlex = (name, value, wa = true, ca = true, ea = false, classes = [Object, Function, String, Number, Boolean, BigInt], extras = {}) => forof(classes, cls => defineProperty(cls, name, value, wa, ca, ea, extras));
const ESTRE_MODERNISM_COMPATIBILITY_PREFIX = "__emcp_";
const defineStaticGetterAndSetter = (cls, name, gets, sets, ca = true, ea = false, extras = {}) => Object.defineProperty(cls, name, {
    "get": function () { return isNotUndefined(this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name]) ? this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name] : gets.bind(this)() },
    "set": function (val) { if (isUndefined(sets)) this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name] = val; else sets.bind(this)(val); },
    configurable: ca,
    enumerable: ea,
    ...extras,
});
const defineGetterAndSetter = (cls, name, gets, sets, ca = true, ea = false, extras = {}) => defineStaticGetterAndSetter(cls.prototype, name, gets, sets, ca, ea, extras);
const defineGetterAndSetterPlex = (name, gets, sets, ca = true, ea = false, classes = [Object, Function, String, Number, Boolean, BigInt], extras = {}) => forof(classes, cls => defineGetterAndSetter(cls, name, gets, sets, ca, ea, extras));


// additional static function for classes
defineStaticGetterAndSetter(Object, "new", function () { return new this.constructor(...arguments); });


// additional global prototype functions
defineGetterAndSetterPlex("it", function () { return classCase(this, { [_BOOLEAN]: it => Boolean(it), [_NUMBER]: it => Number(it), [_STRING]: it => String(it), [_BIG_INT]: it => BigInt(it), [DEFAULT]: it => it }); });

definePropertyPlex("matchCase", function () { return matchCase(this.it, ...arguments); });
definePropertyPlex("equalCase", function () { return equalCase(this.it, ...arguments); });
definePropertyPlex("exactCase", function () { return exactCase(this.it, ...arguments); });
definePropertyPlex("typeCase", function () { return typeCase(this.it, ...arguments); });
definePropertyPlex("classCase", function () { return classCase(this.it, ...arguments); });
definePropertyPlex("kindCase", function () { return kindCase(this.it, ...arguments); });

definePropertyPlex("ifEmpty", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });
definePropertyPlex("ifNotEmpty", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isNotEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });

definePropertyPlex("doAndReturn", function (does = (it, args) => {}, returns, args = []) { return doAndReturn(does, returns, [this.it, ...args]); });
definePropertyPlex("doAndReturnByExecute", function (does = (it, args) => {}, forReturns, args = []) { return doAndReturnByExecute(does, forReturns, [this.it, ...args]); });

defineGetterAndSetter(Object, "ways", function () { return keysOf(this.it); });
defineGetterAndSetter(Object, "looks", function () { return valuesOf(this.it); });
defineGetterAndSetter(Object, "entire", function () { return entriesOf(this.it); });
defineGetterAndSetter(Object, "count", function () { return countOf(this.it); });
defineGetterAndSetter(Object, "checkCount", function () { return checkCount(this.it, (k, v) => true); });

defineProperty(Object, "forKeys", function (work = key => { return false; }) { return forof(this.it.ways, work); });
defineProperty(Object, "forWays", function (work = key => { return false; }) { return forof(this.it.ways, work); });
defineProperty(Object, "forValues", function (work = value => { return false; }) { return forof(this.it.looks, work); });
defineProperty(Object, "forLooks", function (work = value => { return false; }) { return forof(this.it.looks, work); });
defineProperty(Object, "forEntries", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });
defineProperty(Object, "forEntire", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });

defineProperty(Object, "keyOf", function (value) { for (const [key, val] of this.it.entire) if (val === value) return key; return undefined; });

defineProperty(Object, "copy", function (dataOnly = true, primitiveOnly = false, recusive = true) { return copy(this, dataOnly, primitiveOnly, recusive); });
defineGetterAndSetter(Object, "mock", function () { return mock(this); });
defineGetterAndSetter(Object, "mimic", function () { return mimic(this); });
defineGetterAndSetter(Object, "twin", function () { return twin(this); });
defineGetterAndSetter(Object, "clone", function () { return clone(this); });
defineProperty(Object, "patch", function (from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) { return patch(this.it, from, dataOnly, primitiveOnly, recusive, append); });
defineProperty(Object, "overwrite", function (from) { return overwrite(this.it, from); });
defineProperty(Object, "takeover", function (from) { return takeover(this.it, from); });
defineProperty(Object, "acquire", function (from) { return acquire(this.it, from); });
defineProperty(Object, "inherit", function (from) { return inherit(this.it, from); });
defineProperty(Object, "revert", function (from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) { return revert(this.it, from, dataOnly, primitiveOnly, recusive, exceptNew); });

// dpx("apply", function (process = it => it) { process.bind(this)(); return this.it; });
definePropertyPlex("also", function (process = it => it) { process(this.it); return this.it; });
// dpx("run", function (process = it => it) { return process.bind(this)(); });
definePropertyPlex("let", function (process = it => it) { return process(this.it); });
definePropertyPlex("wait", async function (process = async it => it) { return await process(this.it); });
definePropertyPlex("go", function (asyncProcess = (resolve, reject) => resolve(this.it)) { return new Promise(asyncProcess); });

definePropertyPlex("if", function (bool, process = it => it, ornot = it => {}) { return executeIf(bool, process, [this.it], ornot); });

definePropertyPlex("ifis", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it === that, process, [it], ornot)); });
definePropertyPlex("ifisnt", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it !== that, process, [it], ornot)); });

definePropertyPlex("ifEquals", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it == that, process, [it], ornot)); });
definePropertyPlex("ifNotEquals", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it != that, process, [it], ornot)); });
