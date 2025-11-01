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

// Alienise.js - Estre javscript Alienese patch //
//
// A collection of aliases for shortening and simplifying JavaScript code.
// This patch aims to create smaller (quicker) and more concise (lighter) JavaScript code.
// It makes the code more implicit and serves as an alternative to obfuscation.
// 
// v0.4.1 / release 2025.09.24
// 
// * Must be loaded modernism.js before this script.
// 
// Author: Estre Soliette
// Established: 2025.01.05 / Extracted: 2025.03.15


// primitive types alias constant
const U = UNDEFINED;
const N = NULL;
const T = TRUE;
const F = FALSE;

const u = undefined;
const n = null;
const t = true;
const f = false;

// end point assigner constant
const eoo = u;
const eoa = u;

// prototype of primitive types alias constant
const FNC = FUNCTION;
const BLE = BOOLEAN;
const STR = STRING;
const SYM = SYMBOL;
const NUM = NUMBER;
const BIG = BIGINT;
const OBJ = OBJECT;

const fun = Function;
const ble = Boolean;
const str = String;
const sym = Symbol;
const num = Number;
const big = BigInt;
const obj = Object;

// class names of primitive types constant
const FN = _FUNCTION;
const BL = _BOOLEAN;
const ST = _STRING;
const SY = _SYMBOL;
const NO = _NUMBER;
const BI = _BIG_INT;
const OJ = _OBJECT;

const fn = Function;
const bl = Boolean;
const sg = String;
const sl = Symbol;
const no = Number;
const bi = BigInt;
const oj = Object;


// frequent object types alias constant
const DT = _DATE;

const RA = _ARRAY;
const SA = _SET;
const MA = _MAP;

const dt = Date;

const ra = Array;
const sa = Set;
const ma = Map;


// frequent assign types alias constant
const def = DEFAULT;
const fin = FINALLY;


// frequent object types empty object issuer alias constant
const x = {
    get a() { return new Array(); },
    get d() { return new Date(); },
    get t() { return new Set(); },
    get p() { return new Map(); },
};


// bypass constant
const ifx = executeIf;
const itx = executeWhen;

const ifr = ifReturn;

const roen = ifReturnOrEmptyNumber;
const roes = ifReturnOrEmptyString;
const roea = ifReturnOrEmptyArray;
const roeo = ifReturnOrEmptyObject;

const val = valet;


// common process shortcut constant
const f02b = forZeroToBefore;
const f02r = forZeroToReach;

const f20 = forToZeroFrom;
const f21 = forToPrimeFrom;

const ff = forForward;
const fb = forBackward;

const fi = forin;
const fiv = forinner;

const fo = forof;
const fkv = forkv;

const w = whileIn;
const dw = doWhileIn;


// meaning comparator constant
const to = typeOf;

const tm = typeMatch;

const tu = typeUndefined;
const tf = typeFunction;
const tb = typeBoolean;
const ts = typeString;
const ty = typeSymbol;
const tn = typeNumber;
const tg = typeBigint;
const tj = typeObject;

const im = instanceMatch;
const io = isObject;
const ia = isArray;
const ioa = isArray;
const ios = isString;
const ion = isNumber;
const iot = isSet;
const iop = isMap;

const xv = exact;
const nxv = notExact;
const xm = exactMatches;
const nx = notExactMatches;

const ev = equals;
const nev = notEquals;
const sm = same;
const df = diffrent;

const gtv = getherThan;
const ltv = lessThan;
const ngt = notGetherThan;
const nlt = notLessThan;

const gev = getherOrEquals;
const lev = lessOrEquels;
const nge = notGetherAndEquals;
const nle = notLessAndEquals;

const fc = isFalseCase;
const nfc = isTrueCase;

const xu = isUndefined;
const xn = isNull;
const xt = isExactTrue;
const xf = isExactFalse;

const nxu = isNotUndefined;
const nxn = isNotNull;
const nxt = isNotTrue;
const nxf = isNotFalse;

const en = isNully;
const et = isTruely;
const ef = isFalsely;
const ee = isEmpty;

const nn = isNotNully;
const nt = isNotTruely;
const nf = isNotFalsely;
const ne = isNotEmpty;

const noe = isNullOrEmpty;
const nne = isNotNullAndEmpty;


// quick execute by conditions constant
const inoe = ifNullOrEmpty;
const inne = ifNotNullAndEmpty;


// do and return inline double takes
const dr = doAndReturn;
const drx = doAndReturnByExecute;


// object method shortcut constant
const ok = keysOf;
const ov = valuesOf;
const oe = entriesOf;
const oc = countOf;

const occ = checkCount;


// match case constant
const mc = matchCase;
const ec = equalCase;
const xc = exactCase;
const tc = typeCase;
const cc = classCase;
const kc = kindCase;


/** variable data copy */
const cp = copy;
const mk = mock;
const mm = mimic;
const tw = twin;
const cn = clone;

const pc = patch;
const ow = overwrite;
const tk = takeover;
const aq = acquire;
const ih = inherit;

const rv = revert;


/** run handle */
const pq = postQueue;
const pd = postDelayed;
const pp = postPromise;
const pb = postBonded;
const ppq = postPromiseQueue;
const paq = postAsyncQueue;
const pwq = postAwaitQueue;
const pfq = postFrameQueue;
const pfp = postFramePromise;


// Object function shortcut constants
const dsp = defineStaticProperty;
const dp = defineProperty;
const dpx = definePropertyPlex;
const dspgs = defineStaticGetterAndSetter;
const dpgs = defineGetterAndSetter;
const dpgsx = defineGetterAndSetterPlex;


// additional static function for classes
defineStaticGetterAndSetter(dt, "n", function () { return new Date(...arguments); });
defineStaticGetterAndSetter(dt, "t", function () { return this.now(); });


// additional global prototype functions
definePropertyPlex("mc", function () { return matchCase(this.it, ...arguments); });
definePropertyPlex("ec", function () { return equalCase(this.it, ...arguments); });
definePropertyPlex("xc", function () { return exactCase(this.it, ...arguments); });
definePropertyPlex("tc", function () { return typeCase(this.it, ...arguments); });
definePropertyPlex("cc", function () { return classCase(this.it, ...arguments); });
definePropertyPlex("kc", function () { return kindCase(this.it, ...arguments); });

definePropertyPlex("ee", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });
definePropertyPlex("ne", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isNotEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });

definePropertyPlex("dr", function (does = (it, args) => {}, returns, args = []) { return doAndReturn(does, returns, [this.it, ...args]); });
definePropertyPlex("drx", function (does = (it, args) => {}, forReturns, args = []) { return doAndReturnByExecute(does, forReturns, [this.it, ...args]); });

defineGetterAndSetter(Object, "ok", function () { return keysOf(this.it); });
defineGetterAndSetter(Object, "ov", function () { return valuesOf(this.it); });
defineGetterAndSetter(Object, "oe", function () { return entriesOf(this.it); });
defineGetterAndSetter(Object, "oc", function () { return countOf(this.it); });
defineGetterAndSetter(Object, "occ", function () { return checkCount(this.it, (k, v) => true); });

defineProperty(Object, "fk", function (work = key => { return false; }) { return forof(this.it.ways, work); });
defineProperty(Object, "fv", function (work = value => { return false; }) { return forof(this.it.looks, work); });
defineProperty(Object, "fe", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });
defineProperty(Object, "fkv", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });

defineProperty(Object, "cp", function (dataOnly = true, primitiveOnly = false, recusive = true) { return copy(this, dataOnly, primitiveOnly, recusive); });
defineProperty(Object, "pc", function (from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) { return patch(this.it, from, dataOnly, primitiveOnly, recusive, append); });
defineProperty(Object, "rv", function (from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) { return revert(this.it, from, dataOnly, primitiveOnly, recusive, exceptNew); });

definePropertyPlex("ifeq", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it == that, process, [it], ornot)); });
definePropertyPlex("ifneq", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it != that, process, [it], ornot)); });



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



// common extra characters constants
const lr = "(";
const rr = ")";
const lc = "{";
const rc = "}";
const ls = "[";
const rs = "]";
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
const ps = "%";
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
const vl = "|";
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

const cr = "\r";
const lf = "\n";
const crlf = cr + lf;
const lfcr = lf + cr;
const tab = "\t";

const ecr = "\\r";
const elf = "\\n";
const ecrlf = ecr + elf;
const elfcr = elf + ecr;
const etab = "\\t";

