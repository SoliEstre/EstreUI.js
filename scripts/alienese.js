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
// v0.5.1 / release 2025.12.16
// 
// * Must be loaded modernism.js before this script.
// 
// Author: Estre Soliette
// Established: 2025.01.05 / Extracted: 2025.03.15



// Auto-load modernism in Node.js environment
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    try { require("modernism"); } catch (e) {}
}

let _gb = _global ?? (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : global);
let dfg = defineGlobal ?? ((name, value) => {
    Object.defineProperty(_gb, name, {
        value: value,
        writable: false,
        configurable: false,
        enumerable: false
    });
});


// common letter constants
dfg("_0", "0");
dfg("_1", "1");
dfg("_2", "2");
dfg("_3", "3");
dfg("_4", "4");
dfg("_5", "5");
dfg("_6", "6");
dfg("_7", "7");
dfg("_8", "8");
dfg("_9", "9");

dfg("_a", "a");
dfg("_b", "b");
dfg("_c", "c");
dfg("_d", "d");
dfg("_e", "e");
dfg("_f", "f");
dfg("_g", "g");
dfg("_h", "h");
dfg("_i", "i");
dfg("_j", "j");
dfg("_k", "k");
dfg("_l", "l");
dfg("_m", "m");
dfg("_n", "n");
dfg("_o", "o");
dfg("_p", "p");
dfg("_q", "q");
dfg("_r", "r");
dfg("_s", "s");
dfg("_t", "t");
dfg("_u", "u");
dfg("_v", "v");
dfg("_w", "w");
dfg("_x", "x");
dfg("_y", "y");
dfg("_z", "z");

dfg("_A", "A");
dfg("_B", "B");
dfg("_C", "C");
dfg("_D", "D");
dfg("_E", "E");
dfg("_F", "F");
dfg("_G", "G");
dfg("_H", "H");
dfg("_I", "I");
dfg("_J", "J");
dfg("_K", "K");
dfg("_L", "L");
dfg("_M", "M");
dfg("_N", "N");
dfg("_O", "O");
dfg("_P", "P");
dfg("_Q", "Q");
dfg("_R", "R");
dfg("_S", "S");
dfg("_T", "T");
dfg("_U", "U");
dfg("_V", "V");
dfg("_W", "W");
dfg("_X", "X");
dfg("_Y", "Y");
dfg("_Z", "Z");


// common extra characters constants
dfg("lr", "(");
dfg("rr", ")");
dfg("lc", "{");
dfg("rc", "}");
dfg("ls", "[");
dfg("rs", "]");
dfg("lt", "<");
dfg("gt", ">");
dfg("ab", lt + gt);
dfg("cb", gt + lt);
dfg("ti", "~");
dfg("ep", "!");
dfg("em", ep);
dfg("at", "@");
dfg("ds", "$");
dfg("ms", "&");
dfg("ps", "%");
dfg("cf", "^");
dfg("ak", "*");
dfg("mp", ak);
dfg("ad", "+");
dfg("add", ad + ad);
dfg("hp", "-");
dfg("sr", hp);
dfg("srr", sr + sr);
dfg("us", "_");
dfg("eq", "=");
dfg("vl", "|");
dfg("bs", "\\");
dfg("ss", "/");
dfg("dv", ss);
dfg("qm", "?");
dfg("nl", ep + eq);
dfg("le", lt + eq);
dfg("ge", gt + eq);
dfg("fa", ad + eq);
dfg("fs", sr + eq);
dfg("fm", mp + eq);
dfg("fd", dv + eq);
dfg("sq", "'");
dfg("dq", '"');
dfg("gv", '`');
dfg("cl", ":");
dfg("sc", ";");
dfg("cm", ",");
dfg("es", "");
dfg("l", cm);
dfg("s", " ");
dfg("i", "#");
dfg("d", ".");

dfg("cr", "\r");
dfg("lf", "\n");
dfg("crlf", cr + lf);
dfg("lfcr", lf + cr);
dfg("tab", "\t");

dfg("ecr", "\\r");
dfg("elf", "\\n");
dfg("ecrlf", ecr + elf);
dfg("elfcr", elf + ecr);
dfg("etab", "\\t");


// primitive types alias constant
dfg("U", UNDEFINED);
dfg("N", NULL);
dfg("T", TRUE);
dfg("F", FALSE);

dfg("u", undefined);
dfg("n", null);
dfg("t", true);
dfg("f", false);

// end point assigner constant
dfg("eoo", _gb.u);
dfg("eoa", _gb.u);

// prototype of primitive types alias constant
dfg("FNC", _gb.FUNCTION);
dfg("BLE", _gb.BOOLEAN);
dfg("STR", _gb.STRING);
dfg("SYM", _gb.SYMBOL);
dfg("NUM", _gb.NUMBER);
dfg("BIG", _gb.BIGINT);
dfg("OBJ", _gb.OBJECT);

dfg("fun", Function);
dfg("ble", Boolean);
dfg("str", String);
dfg("sym", Symbol);
dfg("num", Number);
dfg("big", BigInt);
dfg("obj", Object);

// class names of primitive types constant
dfg("FN", _gb._FUNCTION);
dfg("BL", _gb._BOOLEAN);
dfg("ST", _gb._STRING);
dfg("SY", _gb._SYMBOL);
dfg("NO", _gb._NUMBER);
dfg("BI", _gb._BIG_INT);
dfg("OJ", _gb._OBJECT);

dfg("fn", Function);
dfg("bl", Boolean);
dfg("sg", String);
dfg("sl", Symbol);
dfg("no", Number);
dfg("bi", BigInt);
dfg("oj", Object);


// frequent object types alias constant
dfg("DT", _gb._DATE);

dfg("RA", _gb._ARRAY);
dfg("SA", _gb._SET);
dfg("MA", _gb._MAP);

dfg("dt", Date);

dfg("ra", Array);
dfg("sa", Set);
dfg("ma", Map);


// frequent assign types alias constant
dfg("def", _gb.DEFAULT);
dfg("fin", _gb.FINALLY);


// frequent object types empty object issuer alias constant
dfg("x", {
    get a() { return new Array(); },
    get d() { return new Date(); },
    get t() { return new Set(); },
    get p() { return new Map(); },
});


// bypass constant
dfg("ifx", _gb.executeIf);
dfg("itx", _gb.executeWhen);

dfg("ifr", _gb.ifReturn);

dfg("roen", _gb.ifReturnOrEmptyNumber);
dfg("roes", _gb.ifReturnOrEmptyString);
dfg("roea", _gb.ifReturnOrEmptyArray);
dfg("roeo", _gb.ifReturnOrEmptyObject);

dfg("val", _gb.valet);


// common process shortcut constant
dfg("f02b", _gb.forZeroToBefore);
dfg("f02r", _gb.forZeroToReach);

dfg("f20", _gb.forToZeroFrom);
dfg("f21", _gb.forToPrimeFrom);

dfg("ff", _gb.forForward);
dfg("fb", _gb.forBackward);

dfg("fi", _gb.forin);
dfg("fiv", _gb.forinner);

dfg("fo", _gb.forof);
dfg("fkv", _gb.forkv);

dfg("w", _gb.whileIn);
dfg("dw", _gb.doWhileIn);


// meaning comparator constant
dfg("to", _gb.typeOf);

dfg("tm", _gb.typeMatch);

dfg("tu", _gb.typeUndefined);
dfg("tf", _gb.typeFunction);
dfg("tb", _gb.typeBoolean);
dfg("ts", _gb.typeString);
dfg("ty", _gb.typeSymbol);
dfg("tn", _gb.typeNumber);
dfg("tg", _gb.typeBigint);
dfg("tj", _gb.typeObject);

dfg("im", _gb.instanceMatch);
dfg("io", _gb.isObject);
dfg("ia", _gb.isArray);
dfg("ioa", _gb.isArray);
dfg("ios", _gb.isString);
dfg("ion", _gb.isNumber);
dfg("iot", _gb.isSet);
dfg("iop", _gb.isMap);

dfg("xv", _gb.exact);
dfg("nxv", _gb.notExact);
dfg("xnv", _gb.exactlyNot);
dfg("xm", _gb.exactMatches);
dfg("nx", _gb.notExactMatches);
dfg("xnm", _gb.exactlyNotMatches);

dfg("ev", _gb.equals);
dfg("nev", _gb.notEquals);
dfg("sm", _gb.same);
dfg("df", _gb.different);

dfg("gtv", _gb.getherThan);
dfg("ltv", _gb.lessThan);
dfg("ngt", _gb.notGetherThan);
dfg("nlt", _gb.notLessThan);

dfg("gev", _gb.getherOrEquals);
dfg("lev", _gb.lessOrEquels);
dfg("nge", _gb.notGetherAndEquals);
dfg("nle", _gb.notLessAndEquals);

dfg("fc", _gb.isFalseCase);
dfg("nfc", _gb.isNotFalseCase);

dfg("xu", _gb.isUndefined);
dfg("xn", _gb.isNull);
dfg("xt", _gb.isExactTrue);
dfg("xf", _gb.isExactFalse);

dfg("nxu", _gb.isNotUndefined);
dfg("nxn", _gb.isNotNull);
dfg("nxt", _gb.isNotTrue);
dfg("nxf", _gb.isNotFalse);

dfg("en", _gb.isNully);
dfg("et", _gb.isTruely);
dfg("ef", _gb.isFalsely);
dfg("ee", _gb.isEmpty);

dfg("nn", _gb.isNotNully);
dfg("nt", _gb.isNotTruely);
dfg("nf", _gb.isNotFalsely);
dfg("ne", _gb.isNotEmpty);

dfg("noe", _gb.isNullOrEmpty);
dfg("nne", _gb.isNotNullAndEmpty);


// quick execute by conditions constant
dfg("inoe", _gb.ifNullOrEmpty);
dfg("inne", _gb.ifNotNullAndEmpty);


// do and return inline double takes
dfg("dr", _gb.doAndReturn);
dfg("drx", _gb.doAndReturnByExecute);


// object method shortcut constant
dfg("ok", _gb.keysOf);
dfg("ov", _gb.valuesOf);
dfg("oe", _gb.entriesOf);
dfg("oc", _gb.countOf);

dfg("occ", _gb.checkCount);


// match case constant
dfg("mc", _gb.matchCase);
dfg("ec", _gb.equalCase);
dfg("xc", _gb.exactCase);
dfg("tc", _gb.typeCase);
dfg("cc", _gb.classCase);
dfg("kc", _gb.kindCase);


/** variable data copy */
dfg("cp", _gb.copy);
dfg("mk", _gb.mock);
dfg("mm", _gb.mimic);
dfg("tw", _gb.twin);
dfg("cn", _gb.clone);

dfg("pc", _gb.patch);
dfg("ow", _gb.overwrite);
dfg("tk", _gb.takeover);
dfg("aq", _gb.acquire);
dfg("ih", _gb.inherit);

dfg("rv", _gb.revert);


/** run handle */
dfg("pq", _gb.postQueue);
dfg("pd", _gb.postDelayed);
dfg("pp", _gb.postPromise);
dfg("pb", _gb.postBonded);
dfg("ppq", _gb.postPromiseQueue);
dfg("paq", _gb.postAsyncQueue);
dfg("pwq", _gb.postAwaitQueue);
dfg("pfq", _gb.postFrameQueue);
dfg("pfp", _gb.postFramePromise);


// Object function shortcut constants
dfg("dsp", _gb.defineStaticProperty);
dfg("dp", _gb.defineProperty);
dfg("dpx", _gb.definePropertyPlex);
dfg("dspgs", _gb.defineStaticGetterAndSetter);
dfg("dpgs", _gb.defineGetterAndSetter);
dfg("dpgsx", _gb.defineGetterAndSetterPlex);


// additional static function for classes
defineStaticGetterAndSetter(dt, "n", function () { return new Date(...arguments); });
defineStaticGetterAndSetter(dt, "t", function () { return this.now(); });
defineStaticGetterAndSetter(dt, "ttt", function () { return (this.now() + "").padStart(3, "0"); });


// additional global prototype functions
definePropertyPlex("mc", function () { return _gb.matchCase(this.it, ...arguments); });
definePropertyPlex("ec", function () { return _gb.equalCase(this.it, ...arguments); });
definePropertyPlex("xc", function () { return _gb.exactCase(this.it, ...arguments); });
definePropertyPlex("tc", function () { return _gb.typeCase(this.it, ...arguments); });
definePropertyPlex("cc", function () { return _gb.classCase(this.it, ...arguments); });
definePropertyPlex("kc", function () { return _gb.kindCase(this.it, ...arguments); });

definePropertyPlex("ee", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return _gb.isEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });
definePropertyPlex("ne", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return _gb.isNotEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });

definePropertyPlex("dr", function (does = (it, args) => {}, returns, args = []) { return _gb.doAndReturn(does, returns, [this.it, ...args]); });
definePropertyPlex("drx", function (does = (it, args) => {}, forReturns, args = []) { return _gb.doAndReturnByExecute(does, forReturns, [this.it, ...args]); });

defineGetterAndSetter(obj, "ok", function () { return _gb.keysOf(this.it); });
defineGetterAndSetter(obj, "ov", function () { return _gb.valuesOf(this.it); });
defineGetterAndSetter(obj, "oe", function () { return _gb.entriesOf(this.it); });
defineGetterAndSetter(obj, "oc", function () { return _gb.countOf(this.it); });
defineGetterAndSetter(obj, "occ", function () { return _gb.checkCount(this.it, (k, v) => true); });

defineProperty(obj, "fk", function (work = key => { return false; }) { return _gb.forof(this.it.ways, work); });
defineProperty(obj, "fv", function (work = value => { return false; }) { return _gb.forof(this.it.looks, work); });
defineProperty(obj, "fe", function (work = (key, value) => { return false; }) { return _gb.forkv(this.it.entire, work); });
defineProperty(obj, "fkv", function (work = (key, value) => { return false; }) { return _gb.forkv(this.it.entire, work); });

defineProperty(obj, "ko", function (value) { for (const [key, val] of this.it.entire) if (val === value) return key; return undefined; });

defineProperty(obj, "tiw", function (key, process = (value, key, host) => value, ornot = (key, host) => host[key]) { return key in this.it ? process(this.it[key], key, this.it) : ornot(key, this.it); });

defineProperty(obj, "cp", function (dataOnly = true, primitiveOnly = false, recusive = true) { return _gb.copy(this, dataOnly, primitiveOnly, recusive); });
defineGetterAndSetter(obj, "mk", function () { return _gb.mock(this); });
defineGetterAndSetter(obj, "mm", function () { return _gb.mimic(this); });
defineGetterAndSetter(obj, "tw", function () { return _gb.twin(this); });
defineGetterAndSetter(obj, "cl", function () { return _gb.clone(this); });

defineProperty(obj, "pc", function (from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) { return _gb.patch(this.it, from, dataOnly, primitiveOnly, recusive, append); });
defineProperty(obj, "ow", function (from) { return _gb.overwrite(this.it, from); });
defineProperty(obj, "to", function (from) { return _gb.takeover(this.it, from); });
defineProperty(obj, "aq", function (from) { return _gb.acquire(this.it, from); });
defineProperty(obj, "ih", function (from) { return _gb.inherit(this.it, from); });

defineProperty(obj, "rv", function (from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) { return _gb.revert(this.it, from, dataOnly, primitiveOnly, recusive, exceptNew); });

definePropertyPlex("ifeq", function (that, process = it => it, ornot = it => {}) { return this.let(it => _gb.executeIf(it == that, process, [it], ornot)); });
definePropertyPlex("ifneq", function (that, process = it => it, ornot = it => {}) { return this.let(it => _gb.executeIf(it != that, process, [it], ornot)); });


// additional primitive prototype functions
defineGetterAndSetter(num, "abs", function () { return Math.abs(this.it); });
defineGetterAndSetter(num, "int", function () { return parseInt(this.it); });
defineGetterAndSetter(num, "prc", function () { return this.it - this.int; });
defineGetterAndSetter(num, "prs", function () { return (this.prc + "").replace(/^0\./, ""); });
defineGetterAndSetter(num, "pri", function () { return parseInt(this.prs); });
defineGetterAndSetter(num, "d00", function () { return this.it.let(it => ((it < 0 ? hp : "") + it.abs).padStart(2, _0)); });
defineGetterAndSetter(num, "d000", function () { return this.it.let(it => ((it < 0 ? hp : "") + it.abs).padStart(3, _0)); });
defineGetterAndSetter(num, "d0000", function () { return this.it.let(it => ((it < 0 ? hp : "") + it.abs).padStart(4, _0)); });

defineGetterAndSetter(str, "low", function () { return this.it.toLowerCase(); });
defineGetterAndSetter(str, "upp", function () { return this.it.toUpperCase(); });
defineGetterAndSetter(str, "cap", function () { return this.it.let(it => it[0].upp + it.substring(1)); });
defineGetterAndSetter(str, "int", function () { return parseInt(this.it); });
defineGetterAndSetter(str, "float", function () { return parseFloat(this.it); });
defineGetterAndSetter(str, "d00", function () { return this.it.padStart(2, _0); });
defineGetterAndSetter(str, "d000", function () { return this.it.padStart(3, _0); });
defineGetterAndSetter(str, "d0000", function () { return this.it.padStart(4, _0); });

defineGetterAndSetter(dt, "year", function () { return this.getFullYear(); });
defineGetterAndSetter(dt, "yyyy", function () { return this.year; });
defineGetterAndSetter(dt, "y", function () { return this.yyyy; });
defineGetterAndSetter(dt, "yy", function () { return (this.yyyy % 100).d00; });
defineGetterAndSetter(dt, "M0", function () { return this.getMonth(); });
defineGetterAndSetter(dt, "M", function () { return this.M0 + 1; });
defineGetterAndSetter(dt, "MM", function () { return this.M.d00; });
defineGetterAndSetter(dt, "d", function () { return this.getDate(); });
defineGetterAndSetter(dt, "dd", function () { return this.d.d00; });
defineGetterAndSetter(dt, "U", function () { return this.getDay(); });
defineGetterAndSetter(dt, "u", function () { return this.U.let(it => it == 0 ? 7 : it); });
defineGetterAndSetter(dt, "uu", function () { return ["su", "mo", "tu", "we", "th", "fr", "sa"][this.U]; });
defineGetterAndSetter(dt, "Uu", function () { return this.uu.cap; });
defineGetterAndSetter(dt, "UU", function () { return this.uu.upp; });
defineGetterAndSetter(dt, "uuu", function () { return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][this.U]; });
defineGetterAndSetter(dt, "Uuu", function () { return this.uuu.cap; });
defineGetterAndSetter(dt, "UUU", function () { return this.uuu.upp; });
defineGetterAndSetter(dt, "uuuu", function () { return ["sun", "mon", "tues", "wedns", "thurs", "fri", "satur"][this.U]; });
defineGetterAndSetter(dt, "Uuuu", function () { return this.uuuu.cap; });
defineGetterAndSetter(dt, "UUUU", function () { return this.uuuu.upp; });
defineGetterAndSetter(dt, "day", function () { return this.uuuu + "day"; });
defineGetterAndSetter(dt, "Day", function () { return this.day.cap; });
defineGetterAndSetter(dt, "DAY", function () { return this.day.upp; });
defineGetterAndSetter(dt, "yoil", function () { return ["일", "월", "화", "수", "목", "금", "토"][this.U]; });
defineGetterAndSetter(dt, "YOIL", function () { return this.yoil + "요일"; });
defineGetterAndSetter(dt, "youbi", function () { return ["日", "月", "火", "水", "木", "金", "土"][this.U]; });
defineGetterAndSetter(dt, "YOUBI", function () { return this.youbi + "曜日"; });
defineGetterAndSetter(dt, "H", function () { return this.getHour(); });
defineGetterAndSetter(dt, "HH", function () { return this.H.d00; });
defineGetterAndSetter(dt, "a", function () { return this.H < 12 ? _A : _P; });
defineGetterAndSetter(dt, "aa", function () { return this.a + _M; });
defineGetterAndSetter(dt, "h", function () { return (this.H % 12).let(it => it == 0 ? 12 : it); });
defineGetterAndSetter(dt, "hh", function () { return this.h.d00; });
defineGetterAndSetter(dt, "m", function () { return this.getMinutes(); });
defineGetterAndSetter(dt, "mm", function () { return this.m.d00; });
defineGetterAndSetter(dt, "s", function () { return this.getSeconds(); });
defineGetterAndSetter(dt, "ss", function () { return this.s.d00; });
defineGetterAndSetter(dt, "S", function () { return this.getMilliseconds(); });
defineGetterAndSetter(dt, "SSS", function () { return this.S.d000; });
defineGetterAndSetter(dt, "O", function () { return this.getTimezoneOffset(); });
defineGetterAndSetter(dt, "Z", function () { return this.O / 60; });
defineGetterAndSetter(dt, "Zm", function () { return this.O % 60; });
defineGetterAndSetter(dt, "Zmm", function () { return this.Zm.d00; });
defineGetterAndSetter(dt, "Zh", function () { return this.Z.int; });
defineGetterAndSetter(dt, "Zhh", function () { return this.Zh.d00; });
defineGetterAndSetter(dt, "X", function () { return this.Zhh + cl + this.Zmm; });
defineGetterAndSetter(dt, "time", function () { return this.getTime(); });
defineGetterAndSetter(dt, "unix", function () { return (this.t / 1000).int; });
defineGetterAndSetter(dt, "t", function () { return this.time; });
defineGetterAndSetter(dt, "ut", function () { return this.unix; });
defineGetterAndSetter(dt, "mo", function () { return this.y * 12 + this.M0; });
defineGetterAndSetter(dt, "do", function () { return (((this.time / 60 / 60 / 1000) + (this.O / -60)) / 24).int; });
defineGetterAndSetter(dt, "yearMonth", function () { return this.YYYY + hp + this.MM; });
defineGetterAndSetter(dt, "ym", function () { return this.yearMonth; });
defineGetterAndSetter(dt, "dateString", function () { return this.YYYY + hp + this.MM + hp + this.dd; });
defineGetterAndSetter(dt, "ymd", function () { return this.dateString; });
defineGetterAndSetter(dt, "hourMinutes", function () { return this.HH + cl + this.mm; });
defineGetterAndSetter(dt, "hm", function () { return this.hourMinutes; });
defineGetterAndSetter(dt, "timeString", function () { return this.HH + cl + this.mm + cl + this.ss; });
defineGetterAndSetter(dt, "hms", function () { return this.timeString; });



// Regex builder alias
dfg("rx", (regex, flags) => new RegExp(regex, flags));
dfg("reg", _gb.rx);
dfg("ri", regex => new RegExp(regex, "i"));
dfg("rg", regex => new RegExp(regex, "g"));
dfg("rm", regex => new RegExp(regex, "m"));
dfg("rig", regex => new RegExp(regex, "ig"));
dfg("rim", regex => new RegExp(regex, "im"));
dfg("rgm", regex => new RegExp(regex, "gm"));
dfg("rigm", regex => new RegExp(regex, "igm"));
