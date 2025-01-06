/*
    Estre Modernism javscript Alienese patch

    Collections of alias for shortener, bypass for inline code,
    monkey patching like as modern languages and thats' cross complexed things.

    Author: Estre Soliette
    Established: 2025.01.05
*/

// primitive types alias constant
const U = "undefined";
const N = "null";
const T = "true";
const F = "false";

const u = undefined;
const n = null;
const t = true;
const f = false;

const eoo = u;
const eoa = u;

// prototype of primitive types alias constant
const FNC = "function";
const BLE = "boolean";
const STR = "string";
const SYM = "symbol";
const NUM = "number";
const BIG = "bigint";
const OBJ = "object";

const fnc = Function;
const ble = Boolean;
const str = String;
const sym = Symbol;
const num = Number;
const big = BigInt;
const obj = Object;

// class names of primitive types constant
const FUNC = "Function";
const BOOL = "Boolean";
const STRI = "String";
const SYMB = "Symbol";
const NUMB = "Number";
const BIGI = "BigInt";
const OBJE = "Object";


// frequent object types alias constant
const DT = "Date";
const RR = "Array";
const SA = "Set";
const MA = "Map";

const dt = Date;
const rr = Array;
const sa = Set;
const ma = Map;


// frequent assign types alias constant
const def = "default";
const fin = "finally";


// frequent object types empty object issuer alias constant
const x = {
    get a() { return new Array(); },
    get d() { return new Date(); },
    get t() { return new Set(); },
    get p() { return new Map(); },
};
const newer = x;


// bypass constant
const ifx = (bool, work = () => {}, args = [], ornot = () => {}) => {
    if (bool) return work(...args);
    else return ornot(...args);
}
const executeIf = ifx;
const itx = (args = [], isTrue = args => 1 == "0", work = args => {}, ornot = () => {}) => {
    if (isTrue(...args)) return work(...args);
    else return ornot(...args);
}
const executeWhen = itx;


// common process shortcut constant
const ft = (toward, work = i => { return false; }) => {
    for (let i=0; i<toward; i++) if (work(i)) break;
}
const forZeroToBefore = ft;
const fr = (toward, work = i => { return false; }) => {
    for (let i=0; i<=toward; i++) if (work(i)) break;
}
const forZeroToReach = fr;
const fz = (begins, work = i => { return false; }) => {
    for (let i=begins; i>=0; i--) if (work(i)) break;
}
const forToZeroFrom = fz;
const fp = (begins, work = i => { return false; }) => {
    for (let i=begins; i>0; i--) if (work(i)) break;
}
const forToPrimeFrom = fp;
const ff = (from, work = i => { return false; }) => {
    for (let i=0; i<from.length; i++) if (work(i, from[i])) break;
}
const forForward = ff;
const fb = (from, work = i => { return false; }) => {
    for (let i=from.length-1; i>=0; i--) if (work(i, from[i])) break;
}
const forBackward = fb;
const fi = (from, work = (k, v) => { return false; }) => {
    for (const k in from) if (work(k, from[k])) break;
}
const forin = fi;
const fiv = (from, work = v => { return false; }) => {
    for (const k in from) if (work(from[k])) break;
}
const forinner = fiv;
const fo = (from, work = v => { return false; }) => {
    for (const v of from) if (work(v)) break;
}
const forof = fo;
const fkv = (from, work = (k, v) => { return false; }) => {
    for (const [k, v] of from) if (work(k, v)) break;
}
const forkv = fkv;

const w = function (cond = function (self) { return true; }, work = function (self, count) { return false; }, self = {}) {
    fiv(self, (i, v) => this[i] = v);
    this.origin = self;
    this.cond = cond;
    this.work = work;
    let count = 0;
    while (this.cond(this)) if (this.work(this, count++)) break;
    return this;
}
const whileIn = w;
const dw = function (cond = function (self) { return true; }, work = function (self, count) { return false; }, self = {}) {
    fiv(self, (i, v) => this[i] = v);
    this.origin = self;
    this.cond = cond;
    this.work = work;
    let count = 0;
    do if (this.work(this, count++)) break;
    while (this.cond(this));
    return this;
}
const doWhileIn = dw;


// meaning comparator constant
const to = val => typeof val;
const tm = (val, type) => to(val) == type;
const typeMatch = tm;
const tf = val => typeMatch(val, FNC);
const typeFunction = tf;
const tb = val => typeMatch(val, BLE);
const typeBoolean = tb;
const ts = val => typeMatch(val, STR);
const typeString = ts;
const ty = val => typeMatch(val, SYM);
const typeSymbol = ty;
const tn = val => typeMatch(val, NUM);
const typeNumber = tn;
const tg = val => typeMatch(val, BIG);
const typeBigint = tg;
const tj = val => typeMatch(val, OBJ);
const typeObject = tj;

const io = (val, classProto = obj) => val instanceof classProto;
const ioo = val => io(val);
const isObject = io;
const ia = val => io(val, rr);
const ioa = val => ia(val);
const isArray = ia;
const ios = val => io(val, str);
const isString = ios;
const ion = val => io(val, num);
const isNumber = ion;
const iot = val => io(val, se);
const isSet = iot;
const iop = val => io(val, ma);
const isMap = iop;

const xv = (a, b) => a === b;
const nxv = (a, b) => a !== b;
const xm = (a, b) => a === b;
const nx = (a, b) => a !== b;
const exact = xv;
const notExact = nxv;

const ev = (a, b) => a == b;
const nev = (a, b) => a != b;
const sm = (a, b) => a == b;
const df = (a, b) => a != b;
const equals = ev;
const notEquals = nev;
const same = sm;
const diffrent = df;

const gtv = (a, b) => a > b;
const getherThan = gtv;
const ltv = (a, b) => a < b;
const lessThan = ltv;
const ngt = (a, b) => a <= b;
const notGetherThan = ngt;
const nlt = (a, b) => a >= b;
const notLessThan = nlt;

const gev = (a, b) => a >= b;
const getherOrEquals = gev;
const lev = (a, b) => a <= b;
const lessOrEquels = lev;
const nge = (a, b) => a < b;
const notGetherOrEquals = nge;
const nle = (a, b) => a > b;
const notLessOrEquals = nle;

const fc = val => !val;
const isFalseCase = fc;
const nfc = val => !!val;
const isTrueCase = nfc;
const isNotFalseCase = nfc;

const xu = val => xm(val, u);
const isUndefined = xu;
const xn = val => xm(val, n);
const isNull = xn;
const xt = val => xm(val, t);
const isExactTrue = xt;
const isHolyTrue = xt;
const xf = val => xm(val, f);
const isExactFalse = xf;
const isHolyFalse = xf

const nxu = val => nx(val, u);
const isNotUndefined = nxu;
const nxn = val => nx(val, n);
const isNotNull = nxn;
const nxt = val => nx(val, t);
const isNotTrue = nxt;
const nxf = val => nx(val, f);
const isNotFalse = nxf;

const en = val => ev(val, n);
const isNully = en;
const et = val => ev(val, t);
const isTruely = et;
const ef = val => ev(val, f);
const isFalsely = ef;
const ee = (val, booleanOrNumberEmptyMatch) => kc(val, {
    [BLE]: v => ev(v, booleanOrNumberEmptyMatch),
    [NUM]: v => ev(v, booleanOrNumberEmptyMatch),
    [BIG]: v => ev(v, booleanOrNumberEmptyMatch),
    [STR]: v => ev(v, es),
    [RR]: v => v.length < 1,
    [SE]: v => v.size < 1,
    [MA]: v => v.size < 1,
    [def]: v => {
        let count = 0;
        for (const k in v) count++;
        return count < 1;
    }
});
const isEmpty = ee;

const nn = val => nev(val, n);
const isNotNully = nn;
const nt = val => nev(val, t);
const isNotTruely = nt;
const nf = val => nev(val, f);
const isNotFalsely = nf;
const ne = (val, numberEmptyMatch) => nev(val, es);
const isNotEmpty = ne;

const noe = val => en(val) || ee(val);
const isNullOrEmpty = noe;
const nne = val => nn(val) && ne(val);
const isNotNullAndEmpty = nne;


// do and return inline double takes
const dr = (does = args => {}, returns, args = []) => { does(...args); return returns; };
const doAndReturn = dr;
const drx = (does = args => {}, forReturns, args = []) => { does(...args); return forReturns(...args); };
const doAndReturnByExecute = drx;


// match case constant
const mc = (val, cases = { [def]: val => {}, [fin]: (val, returns) => {} }, ignoreCase = f) => {
    let match;
    fi(cases, (k, v) => ifx(k != def && rx(k, ignoreCase ? "i" : "").test(val), () => dr(() => match = v, t)));
    const defaultCase = cases[def];
    const finallyCase = cases[fin];
    const returns = nn(match) ? (tf(match) ? match(val) : match) : (tf(defaultCase) ? defaultCase(val) : defaultCase);
    const returnFinal = tf(finallyCase) ? finallyCase(val, returns) : finallyCase;
    return xu(returnFinal) ? returns : returns ?? returnFinal;
}
const matchCase = (val, cases = { [def]: val => {}, [fin]: (val, returns) => {} }, ignoreCase = f) => mc(val, cases, ignoreCase);
const ec = (val, cases = { [def]: val => {}, [fin]: (val, returns) => {} }, ignoreCase = f) => {
    let match;
    const vlc = to(val) == STR ? val.toLowerCase() : val;
    fi(cases, (k, v) => ifx(k != def && (ignoreCase ? (to(k) == STR ? k.toLowerCase() : k) == vlc : k == val), () => dr(() => match = v, t)));
    const defaultCase = cases[def];
    const finallyCase = cases[fin];
    const returns = nn(match) ? (tf(match) ? match(val) : match) : (tf(defaultCase) ? defaultCase(val) : defaultCase);
    const returnFinal = tf(finallyCase) ? finallyCase(val, returns) : finallyCase;
    return xu(returnFinal) ? returns : returns ?? returnFinal;
}
const equalCase = (val, cases = { [def]: val => {}, [fin]: (val, returns) => {} }, ignoreCase = f) => ec(val, cases, ignoreCase);
const xc = (val, cases = { [def]: val => {}, [fin]: (val, returns) => {} }) => {
    const match = cases[val];
    const defaultCase = cases[def];
    const finallyCase = cases[fin];
    const returns = nn(match) ? (tf(match) ? match(val) : match) : (tf(defaultCase) ? defaultCase(val) : defaultCase);
    const returnFinal = tf(finallyCase) ? finallyCase(val, returns) : finallyCase;
    return xu(returnFinal) ? returns : returns ?? returnFinal;
}
const exactCase = (val, cases = { [def]: val => {}, [fin]: (val, returns) => {} }) => xc(val, cases);
const tc = (variable, cases = { [def]: variable => {}, [fin]: (variable, returns) => {} }) => {
    const type = to(variable);
    const match = cases[type];
    const defaultCase = cases[def];
    const finallyCase = cases[fin];
    const returns = nn(match) ? (tf(match) ? match(variable) : match) : (tf(defaultCase) ? defaultCase(variable) : defaultCase);
    const returnFinal = tf(finallyCase) ? finallyCase(variable, returns) : finallyCase;
    return xu(returnFinal) ? returns : returns ?? returnFinal;
}
const typeCase = (variable, cases = { [def]: variable => {}, [fin]: (variable, returns) => {} }) => tc(variable, cases);
const cc = (object, cases = { [def]: object => {}, [fin]: (object, returns) => {} }) => {
    const className = object.constructor.name;
    const match = cases[className];
    const defaultCase = cases[def];
    const finallyCase = cases[fin];
    const returns = nn(match) ? (tf(match) ? match(object) : match) : (tf(defaultCase) ? defaultCase(object) : defaultCase);
    const returnFinal = tf(finallyCase) ? finallyCase(object, returns) : finallyCase;
    return xu(returnFinal) ? returns : returns ?? returnFinal;
}
const classCase = (object, cases = { [def]: val => {}, [fin]: (val, returns) => {} }) => cc(object, cases);
const kc = (kindFrom, cases = { [def]: val => {}, [fin]: val => {val, returns} }) => tc(kindFrom, { ...cases, [OBJ]: () => cc(kindFrom, { ...cases, [fin]: u }) });
const kindCase = (kindFrom, cases = { [def]: val => {}, [fin]: val => {val, returns} }) => kc(kindFrom, cases);


// Object function shortcut constants
const dsp = (cls, name, value, wa = t, ca = t, ea = f, extras = {}) => obj.defineProperty(cls, name, {
    value,
    writable: wa,
    configurable: ca,
    enumerable: ea,
    ...extras,
});
const defineStaticProperty = dsp;
const dp = (cls, name, value, wa = t, ca = t, ea = f, extras = {}) => dsp(cls.prototype, name, value, wa, ca, ea, extras);
const dpx = (name, value, wa = t, ca = t, ea = f, classes = [obj, fnc, str, num, ble, big], extras = {}) => fo(classes, cls => {
    obj.defineProperty(cls.prototype, name, {
        // get value() { return tc(value, {
        //     // [FNC]: it => it,//function (...args) { return (value.bind(this))(...args); },
        //     // [def]: it => cls(it),
        //     [BLE]: it => Boolean(it),
        //     [NUM]: it => Number(it),
        //     [STR]: it => String(it),
        //     [BIG]: it => BigInt(it),
        //     [def]: it => it,
        // }); },
        value,
        writable: wa,
        configurable: ca,
        enumerable: ea,
        ...extras,
    });
});
const definePropertyPlex = dpx;
const ESTRE_MODERNISM_COMPATIBILITY_PREFIX = "__emcp_";
const dspgs = (cls, name, gets, sets, ca = t, ea = f, extras = {}) => obj.defineProperty(cls, name, {
    "get": function () { return nxu(this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name]) ? this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name] : gets() },
    "set": function (val) { if (xu(sets)) this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name] = val; else sets(val); },
    configurable: ca,
    enumerable: ea,
    ...extras,
});
const defineStaticGetterAndSetter = dspgs;
const dpgs = (cls, name, gets, sets, ca = t, ea = f, extras = {}) => dspgs(cls.prototype, name, gets, sets, ca, ea, extras);
const defineGetterAndSetter = dpgs;
const dpgsx = (name, gets, sets, ca = t, ea = f, classes = [obj, fnc, str, num, ble, big], extras = {}) => fo(classes, cls => dpgs(cls, name, gets, sets, ca, ea, extras));
const defineGetterAndSetterPlex = dpgsx;


// additional static function for classes
dspgs(dt, "n", function () { return this.now(); });


// additional global prototype functions
dpgsx("it", function () { return cc(this, { [BOOL]: it => ble(it), [NUMB]: it => num(it), [STRI]: it => str(it), [BIGI]: it => big(it), [def]: it => it }); });

dpx("mc", function () { return mc(this.it, ...arguments); });
dpx("matchCase", function () { return mc(this.it, ...arguments); });
dpx("ec", function () { return ec(this.it, ...arguments); });
dpx("equalCase", function () { return ec(this.it, ...arguments); });
dpx("xc", function () { return xc(this.it, ...arguments); });
dpx("exactCase", function () { return xc(this.it, ...arguments); });
dpx("tc", function () { return tc(this.it, ...arguments); });
dpx("typeCase", function () { return tc(this.it, ...arguments); });
dpx("cc", function () { return cc(this.it, ...arguments); });
dpx("classCase", function () { return cc(this.it, ...arguments); });
dpx("kc", function () { return kc(this.it, ...arguments); });
dpx("kindCase", function () { return kc(this.it, ...arguments); });

dpx("dr", function (does = (it, args) => {}, returns, args = []) { return dr(does, returns, [this.it, ...args]); });
dpx("drx", function (does = (it, args) => {}, forReturns, args = []) { return drx(does, forReturns, [this.it, ...args]); });

dpx("let", function (process = it => it) { return process(this.it); });
dpx("go", function (asyncProcess = (resolve, reject) => resolve(this.it)) { return new Promise(asyncProcess); });

dpx("if", function (bool, process = it => it, ornot = it => {}) { return ifx(bool, process, [this.it], ornot); });
dpx("ifex", function (equals, process = it => it, ornot = it => {}) { return this.let(it => ifx(it === equals, process, [it], ornot)); });
dpx("ifexnt", function (equals, process = it => it, ornot = it => {}) { return this.let(it => ifx(it !== equals, process, [it], ornot)); });
dpx("ifis", function (equals, process = it => it, ornot = it => {}) { return this.let(it => ifx(it == equals, process, [it], ornot)); });
dpx("ifisnt", function (equals, process = it => it, ornot = it => {}) { return this.let(it => ifx(it != equals, process, [it], ornot)); });


// common extra characters constants
const lt = "<";
const gt = ">";
const ab = lt + gt;
const cb = gt + lt;
const ti = "~";
const ep = "!";
const em = ep;
const at = "@";
const ds = "$";
const ms = "&";
const pc = "%";
const cf = "^";
const ak = "*";
const mp = ak;
const ad = "+";
const add = ad + ad;
const hp = "-";
const sr = hp;
const srr = sr + sr;
const us = "_";
const eq = "=";
const bl = "|";
const bs = "\\";
const ss = "/";
const dv = ss;
const qm = "?";
const nl = ep + eq;
const le = lt + eq;
const ge = gt + eq;
const fa = ad + eq;
const fs = sr + eq;
const fm = mp + eq;
const fd = dv + eq;
const sq = "'";
const dq = '"';
const gv = '`';
const cl = ":";
const sc = ";";
const cm = ",";
const es = "";
const l = cm;
const s = " ";
const i = "#";
const d = ".";


// Regex builder alias
const rx = (regex, flags) => new RegExp(regex, flags);
const reg = rx;
const ri = regex => new RegExp(regex, "i");
const rg = regex => new RegExp(regex, "g");
const rm = regex => new RegExp(regex, "m");
const rig = regex => new RegExp(regex, "ig");
const rim = regex => new RegExp(regex, "im");
const rgm = regex => new RegExp(regex, "gm");
const rigm = regex => new RegExp(regex, "igm");
