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

// Alienise.js - Estre javascript Alienese patch //
//
// A collection of aliases for shortening and simplifying JavaScript code.
// This patch aims to create smaller (quicker) and more concise (lighter) JavaScript code.
// It makes the code more implicit and serves as an alternative to obfuscation.
// 
// v0.6.0 / release 2026.01.03
// 
// * Must be loaded modernism.js before this script.
// 
// Author: Estre Soliette
// Established: 2025.01.05 / Extracted: 2025.03.15



// Auto-load modernism in Node.js environment
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    try { require("modernism"); } catch (e) {}
}

const _gb = _global ?? (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : global);
const dfg = defineGlobal ?? ((name, value) => Object.defineProperty(_gb, name, {
    value: value,
    writable: false,
    configurable: false,
    enumerable: false
}));


// common letter constants
const _0 = "0";
const _1 = "1";
const _2 = "2";
const _3 = "3";
const _4 = "4";
const _5 = "5";
const _6 = "6";
const _7 = "7";
const _8 = "8";
const _9 = "9";

const _a = "a";
const _b = "b";
const _c = "c";
const _d = "d";
const _e = "e";
const _f = "f";
const _g = "g";
const _h = "h";
const _i = "i";
const _j = "j";
const _k = "k";
const _l = "l";
const _m = "m";
const _n = "n";
const _o = "o";
const _p = "p";
const _q = "q";
const _r = "r";
const _s = "s";
const _t = "t";
const _u = "u";
const _v = "v";
const _w = "w";
const _x = "x";
const _y = "y";
const _z = "z";

const _A = "A";
const _B = "B";
const _C = "C";
const _D = "D";
const _E = "E";
const _F = "F";
const _G = "G";
const _H = "H";
const _I = "I";
const _J = "J";
const _K = "K";
const _L = "L";
const _M = "M";
const _N = "N";
const _O = "O";
const _P = "P";
const _Q = "Q";
const _R = "R";
const _S = "S";
const _T = "T";
const _U = "U";
const _V = "V";
const _W = "W";
const _X = "X";
const _Y = "Y";
const _Z = "Z";


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

const sm = same;
const df = differ;

const xv = exact;
const nxv = notExact;
const xnv = exactlyNot;
const xm = exactMatches;
const nx = notExactMatches;
const xnm = exactlyNotMatches;

const ev = equals;
const nev = notEquals;

const gtv = gatherThan;
const ltv = lessThan;
const ngt = notGatherThan;
const nlt = notLessThan;

const gev = gatherOrEquals;
const lev = lessOrEquals;
const nge = notGatherAndEquals;
const nle = notLessAndEquals;

const fc = isFalseCase;
const nfc = isNotFalseCase;

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


// additional static function for classes
defineStaticGetterAndSetter(dt, "n", function () { return new Date(...arguments); });
defineStaticGetterAndSetter(dt, "t", function () { return this.now(); });
defineStaticGetterAndSetter(dt, "ms", function () { return dt.n.millis; });
defineStaticGetterAndSetter(dt, "msd", function () { return this.ms.string.padStart(3, "0"); });


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

defineGetterAndSetter(obj, "ok", function () { return keysOf(this.it); });
defineGetterAndSetter(obj, "ov", function () { return valuesOf(this.it); });
defineGetterAndSetter(obj, "oe", function () { return entriesOf(this.it); });
defineGetterAndSetter(obj, "oc", function () { return countOf(this.it); });
defineGetterAndSetter(obj, "occ", function () { return checkCount(this.it, (k, v) => true); });

defineProperty(obj, "fk", function (work = key => { return false; }) { return forof(this.it.ways, work); });
defineProperty(obj, "fv", function (work = value => { return false; }) { return forof(this.it.looks, work); });
defineProperty(obj, "fe", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });
defineProperty(obj, "fkv", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });

defineProperty(obj, "ko", function (value) { for (const [key, val] of this.it.entire) if (val === value) return key; return undefined; });

defineProperty(obj, "tiw", function (key, process = (value, key, host) => value, ornot = (key, host) => host[key]) { return key in this.it ? process(this.it[key], key, this.it) : ornot(key, this.it); });

defineProperty(obj, "cp", function (dataOnly = true, primitiveOnly = false, recusive = true) { return copy(this, dataOnly, primitiveOnly, recusive); });
defineGetterAndSetter(obj, "mk", function () { return mock(this); });
defineGetterAndSetter(obj, "mm", function () { return mimic(this); });
defineGetterAndSetter(obj, "tw", function () { return twin(this); });
defineGetterAndSetter(obj, "cl", function () { return clone(this); });

defineProperty(obj, "pc", function (from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) { return patch(this.it, from, dataOnly, primitiveOnly, recusive, append); });
defineProperty(obj, "ow", function (from) { return overwrite(this.it, from); });
defineProperty(obj, "tk", function (from) { return takeover(this.it, from); });
defineProperty(obj, "aq", function (from) { return acquire(this.it, from); });
defineProperty(obj, "ih", function (from) { return inherit(this.it, from); });

defineProperty(obj, "rv", function (from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) { return revert(this.it, from, dataOnly, primitiveOnly, recusive, exceptNew); });

definePropertyPlex("ifeq", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it == that, process, [it], ornot)); });
definePropertyPlex("ifneq", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it != that, process, [it], ornot)); });


// additional primitive prototype functions
defineGetterAndSetter(num, "str", function () { return this.it.string; });
defineGetterAndSetter(num, "prc", function () { return this.it.pricision; });
defineGetterAndSetter(num, "prs", function () { return this.it.pricisionString; });
defineGetterAndSetter(num, "pri", function () { return this.it.pricisionInt; });
defineGetterAndSetter(num, "d00", function () { return this.it.digit2; });
defineGetterAndSetter(num, "d000", function () { return this.it.digit3; });
defineGetterAndSetter(num, "d0000", function () { return this.it.digit4; });

defineGetterAndSetter(str, "low", function () { return this.it.lower; });
defineGetterAndSetter(str, "upp", function () { return this.it.upper; });
defineGetterAndSetter(str, "cap", function () { return this.it.capitalized; });
defineGetterAndSetter(str, "d00", function () { return this.it.digit2; });
defineGetterAndSetter(str, "d000", function () { return this.it.digit3; });
defineGetterAndSetter(str, "d0000", function () { return this.it.digit4; });

defineGetterAndSetter(dt, "YYYY", function () { return this.it.year.d0000; });
defineGetterAndSetter(dt, "yyyy", function () { return this.it.year; });
defineGetterAndSetter(dt, "y", function () { return this.it.yyyy; });
defineGetterAndSetter(dt, "yy", function () { return (this.it.yyyy % 100).d00; });
defineGetterAndSetter(dt, "M0", function () { return this.it.month0; });
defineGetterAndSetter(dt, "M", function () { return this.it.month; });
defineGetterAndSetter(dt, "MM", function () { return this.it.M.d00; });
defineGetterAndSetter(dt, "d", function () { return this.it.date; });
defineGetterAndSetter(dt, "dd", function () { return this.it.d.d00; });
defineGetterAndSetter(dt, "U", function () { return this.it.day; });
defineGetterAndSetter(dt, "u", function () { return this.it.U.let(it => it == 0 ? 7 : it); });
defineGetterAndSetter(dt, "uu", function () { return this.it.dayEngChar2; });
defineGetterAndSetter(dt, "Uu", function () { return this.it.dayEngChar2Cap; });
defineGetterAndSetter(dt, "UU", function () { return this.it.dayEngChar2Up; });
defineGetterAndSetter(dt, "uuu", function () { return this.it.dayEngShort; });
defineGetterAndSetter(dt, "Uuu", function () { return this.it.dayEngShortCap; });
defineGetterAndSetter(dt, "UUU", function () { return this.it.dayEngShortUp; });
defineGetterAndSetter(dt, "uuuu", function () { return this.it.dayEngPrefix; });
defineGetterAndSetter(dt, "Uuuu", function () { return this.it.dayEngPrefixCap; });
defineGetterAndSetter(dt, "UUUU", function () { return this.it.dayEngPrefixUp; });
defineGetterAndSetter(dt, "wd", function () { return this.it.dayEng + "day"; });
defineGetterAndSetter(dt, "Wd", function () { return this.it.dayEng.cap; });
defineGetterAndSetter(dt, "WD", function () { return this.it.dayEng.upp; });
defineGetterAndSetter(dt, "yi", function () { return this.it.dayKorShort; });
defineGetterAndSetter(dt, "YI", function () { return this.it.dayKor; });
defineGetterAndSetter(dt, "yb", function () { return this.it.dayJpnShort; });
defineGetterAndSetter(dt, "YB", function () { return this.it.dayJpn; });
defineGetterAndSetter(dt, "zh", function () { return this.it.dayChn; });
defineGetterAndSetter(dt, "xq", function () { return this.it.dayChnX; });
defineGetterAndSetter(dt, "zt", function () { return this.it.dayCnT; });
defineGetterAndSetter(dt, "xqt", function () { return this.it.dayCnTX; });
defineGetterAndSetter(dt, "H", function () { return this.it.hours; });
defineGetterAndSetter(dt, "HH", function () { return this.it.H.d00; });
defineGetterAndSetter(dt, "a", function () { return this.it.H < 12 ? _A : _P; });
defineGetterAndSetter(dt, "aa", function () { return this.it.a + _M; });
defineGetterAndSetter(dt, "h", function () { return (this.it.H % 12).let(it => it == 0 ? 12 : it); });
defineGetterAndSetter(dt, "hh", function () { return this.it.h.d00; });
defineGetterAndSetter(dt, "m", function () { return this.it.minutes; });
defineGetterAndSetter(dt, "mm", function () { return this.it.m.d00; });
defineGetterAndSetter(dt, "s", function () { return this.it.seconds; });
defineGetterAndSetter(dt, "ss", function () { return this.it.s.d00; });
defineGetterAndSetter(dt, "ms", function () { return this.it.millis; });
defineGetterAndSetter(dt, "S", function () { return this.it.ms; });
defineGetterAndSetter(dt, "SSS", function () { return this.it.S.d000; });
defineGetterAndSetter(dt, "zone0", function () { return this.it.zoneOffset; });
defineGetterAndSetter(dt, "O", function () { return this.it.zone0; });
defineGetterAndSetter(dt, "Z", function () { return this.it.zoneHours; });
defineGetterAndSetter(dt, "Zm", function () { return this.it.zoneMinutes; });
defineGetterAndSetter(dt, "Zmm", function () { return this.it.Zm.d00; });
defineGetterAndSetter(dt, "Zh", function () { return this.it.Z.int; });
defineGetterAndSetter(dt, "Zhh", function () { return this.it.Zh.d00; });
defineGetterAndSetter(dt, "X", function () { return this.it.Zhh + cl + this.it.Zmm; });
defineGetterAndSetter(dt, "t", function () { return this.it.time; });
defineGetterAndSetter(dt, "ut", function () { return this.it.unix; });
defineGetterAndSetter(dt, "mo", function () { return this.it.y * 12 + this.it.M0; });
defineGetterAndSetter(dt, "do", function () { return this.it.dateOffset; });
defineGetterAndSetter(dt, "yma", function () { return this.it.yearMonthArray; });
defineGetterAndSetter(dt, "ym", function () { return this.it.yearMonth; });
defineGetterAndSetter(dt, "ymda", function () { return this.it.dateStringArray; });
defineGetterAndSetter(dt, "ymd", function () { return this.it.dateString; });
defineGetterAndSetter(dt, "hma", function () { return this.it.hourMinutesArray; });
defineGetterAndSetter(dt, "hm", function () { return this.it.hourMinutes; });
defineGetterAndSetter(dt, "hmsa", function () { return this.it.timeStringArray; });
defineGetterAndSetter(dt, "hms", function () { return this.it.timeString; });


// Bind to global when not a browser
if (typeof window === U) {
    dfg("_0", _0);
    dfg("_1", _1);
    dfg("_2", _2);
    dfg("_3", _3);
    dfg("_4", _4);
    dfg("_5", _5);
    dfg("_6", _6);
    dfg("_7", _7);
    dfg("_8", _8);
    dfg("_9", _9);

    dfg("_a", _a);
    dfg("_b", _b);
    dfg("_c", _c);
    dfg("_d", _d);
    dfg("_e", _e);
    dfg("_f", _f);
    dfg("_g", _g);
    dfg("_h", _h);
    dfg("_i", _i);
    dfg("_j", _j);
    dfg("_k", _k);
    dfg("_l", _l);
    dfg("_m", _m);
    dfg("_n", _n);
    dfg("_o", _o);
    dfg("_p", _p);
    dfg("_q", _q);
    dfg("_r", _r);
    dfg("_s", _s);
    dfg("_t", _t);
    dfg("_u", _u);
    dfg("_v", _v);
    dfg("_w", _w);
    dfg("_x", _x);
    dfg("_y", _y);
    dfg("_z", _z);

    dfg("_A", _A);
    dfg("_B", _B);
    dfg("_C", _C);
    dfg("_D", _D);
    dfg("_E", _E);
    dfg("_F", _F);
    dfg("_G", _G);
    dfg("_H", _H);
    dfg("_I", _I);
    dfg("_J", _J);
    dfg("_K", _K);
    dfg("_L", _L);
    dfg("_M", _M);
    dfg("_N", _N);
    dfg("_O", _O);
    dfg("_P", _P);
    dfg("_Q", _Q);
    dfg("_R", _R);
    dfg("_S", _S);
    dfg("_T", _T);
    dfg("_U", _U);
    dfg("_V", _V);
    dfg("_W", _W);
    dfg("_X", _X);
    dfg("_Y", _Y);
    dfg("_Z", _Z);


    dfg("lr", lr);
    dfg("rr", rr);
    dfg("lc", lc);
    dfg("rc", rc);
    dfg("ls", ls);
    dfg("rs", rs);
    dfg("lt", lt);
    dfg("gt", gt);
    dfg("ab", ab);
    dfg("cb", cb);
    dfg("ti", ti);
    dfg("ep", ep);
    dfg("em", em);
    dfg("at", at);
    dfg("ds", ds);
    dfg("ms", ms);
    dfg("ps", ps);
    dfg("cf", cf);
    dfg("ak", ak);
    dfg("mp", mp);
    dfg("ad", ad);
    dfg("add", add);
    dfg("hp", hp);
    dfg("sr", sr);
    dfg("srr", srr);
    dfg("us", us);
    dfg("eq", eq);
    dfg("vl", vl);
    dfg("bs", bs);
    dfg("ss", ss);
    dfg("dv", dv);
    dfg("qm", qm);
    dfg("nl", nl);
    dfg("le", le);
    dfg("ge", ge);
    dfg("fa", fa);
    dfg("fs", fs);
    dfg("fm", fm);
    dfg("fd", fd);
    dfg("sq", sq);
    dfg("dq", dq);
    dfg("gv", gv);
    dfg("cl", cl);
    dfg("sc", sc);
    dfg("cm", cm);
    dfg("es", es);
    dfg("l", l);
    dfg("s", s);
    dfg("i", i);
    dfg("d", d);

    dfg("cr", cr);
    dfg("lf", lf);
    dfg("crlf", crlf);
    dfg("lfcr", lfcr);
    dfg("tab", tab);

    dfg("ecr", ecr);
    dfg("elf", elf);
    dfg("ecrlf", ecrlf);
    dfg("elfcr", elfcr);
    dfg("etab", etab);


    dfg("U", U);
    dfg("N", N);
    dfg("T", T);
    dfg("F", F);

    dfg("u", u);
    dfg("n", n);
    dfg("t", t);
    dfg("f", f);

    dfg("eoo", eoo);
    dfg("eoa", eoa);

    dfg("FNC", FNC);
    dfg("BLE", BLE);
    dfg("STR", STR);
    dfg("SYM", SYM);
    dfg("NUM", NUM);
    dfg("BIG", BIG);
    dfg("OBJ", OBJ);

    dfg("fun", fun);
    dfg("ble", ble);
    dfg("str", str);
    dfg("sym", sym);
    dfg("num", num);
    dfg("big", big);
    dfg("obj", obj);

    dfg("FN", FN);
    dfg("BL", BL);
    dfg("ST", ST);
    dfg("SY", SY);
    dfg("NO", NO);
    dfg("BI", BI);
    dfg("OJ", OJ);

    dfg("fn", fn);
    dfg("bl", bl);
    dfg("sg", sg);
    dfg("sl", sl);
    dfg("no", no);
    dfg("bi", bi);
    dfg("oj", oj);


    dfg("DT", DT);

    dfg("RA", RA);
    dfg("SA", SA);
    dfg("MA", MA);

    dfg("dt", dt);

    dfg("ra", ra);
    dfg("sa", sa);
    dfg("ma", ma);


    dfg("def", def);
    dfg("fin", fin);


    dfg("x", x);


    dfg("ifx", ifx);
    dfg("itx", itx);

    dfg("ifr", ifr);

    dfg("roen", roen);
    dfg("roes", roes);
    dfg("roea", roea);
    dfg("roeo", roeo);

    dfg("val", val);


    dfg("f02b", f02b);
    dfg("f02r", f02r);

    dfg("f20", f20);
    dfg("f21", f21);

    dfg("ff", ff);
    dfg("fb", fb);

    dfg("fi", fi);
    dfg("fiv", fiv);

    dfg("fo", fo);
    dfg("fkv", fkv);

    dfg("w", w);
    dfg("dw", dw);


    dfg("to", to);

    dfg("tm", tm);

    dfg("tu", tu);
    dfg("tf", tf);
    dfg("tb", tb);
    dfg("ts", ts);
    dfg("ty", ty);
    dfg("tn", tn);
    dfg("tg", tg);
    dfg("tj", tj);

    dfg("im", im);
    dfg("io", io);
    dfg("ia", ia);
    dfg("ioa", ioa);
    dfg("ios", ios);
    dfg("ion", ion);
    dfg("iot", iot);
    dfg("iop", iop);

    dfg("sm", sm);
    dfg("df", df);

    dfg("xv", xv);
    dfg("nxv", nxv);
    dfg("xnv", xnv);
    dfg("xm", xm);
    dfg("nx", nx);
    dfg("xnm", xnm);

    dfg("ev", ev);
    dfg("nev", nev);

    dfg("gtv", gtv);
    dfg("ltv", ltv);
    dfg("ngt", ngt);
    dfg("nlt", nlt);

    dfg("gev", gev);
    dfg("lev", lev);
    dfg("nge", nge);
    dfg("nle", nle);

    dfg("fc", fc);
    dfg("nfc", nfc);

    dfg("xu", xu);
    dfg("xn", xn);
    dfg("xt", xt);
    dfg("xf", xf);

    dfg("nxu", nxu);
    dfg("nxn", nxn);
    dfg("nxt", nxt);
    dfg("nxf", nxf);

    dfg("en", en);
    dfg("et", et);
    dfg("ef", ef);
    dfg("ee", ee);

    dfg("nn", nn);
    dfg("nt", nt);
    dfg("nf", nf);
    dfg("ne", ne);

    dfg("noe", noe);
    dfg("nne", nne);


    dfg("inoe", inoe);
    dfg("inne", inne);


    dfg("dr", dr);
    dfg("drx", drx);


    dfg("ok", ok);
    dfg("ov", ov);
    dfg("oe", oe);
    dfg("oc", oc);

    dfg("occ", occ);

    dfg("mc", mc);
    dfg("ec", ec);
    dfg("xc", xc);
    dfg("tc", tc);
    dfg("cc", cc);
    dfg("kc", kc);


    dfg("cp", cp);
    dfg("mk", mk);
    dfg("mm", mm);
    dfg("tw", tw);
    dfg("cn", cn);

    dfg("pc", pc);
    dfg("ow", ow);
    dfg("tk", tk);
    dfg("aq", aq);
    dfg("ih", ih);

    dfg("rv", rv);


    dfg("pq", pq);
    dfg("pd", pd);
    dfg("pp", pp);
    dfg("pb", pb);
    dfg("ppq", ppq);
    dfg("paq", paq);
    dfg("pwq", pwq);
    dfg("pfq", pfq);
    dfg("pfp", pfp);


    dfg("dsp", dsp);
    dfg("dp", dp);
    dfg("dpx", dpx);
    dfg("dspgs", dspgs);
    dfg("dpgs", dpgs);
    dfg("dpgsx", dpgsx);


    dfg("rx", rx);
    dfg("reg", reg);
    dfg("ri", ri);
    dfg("rg", rg);
    dfg("rm", rm);
    dfg("rig", rig);
    dfg("rim", rim);
    dfg("rgm", rgm);
    dfg("rigm", rigm);
}