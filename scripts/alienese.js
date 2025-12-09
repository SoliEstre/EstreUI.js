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
// v0.5.0 / release 2025.12.09
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

defineGetterAndSetter(Object, "ok", function () { return _gb.keysOf(this.it); });
defineGetterAndSetter(Object, "ov", function () { return _gb.valuesOf(this.it); });
defineGetterAndSetter(Object, "oe", function () { return _gb.entriesOf(this.it); });
defineGetterAndSetter(Object, "oc", function () { return _gb.countOf(this.it); });
defineGetterAndSetter(Object, "occ", function () { return _gb.checkCount(this.it, (k, v) => true); });

defineProperty(Object, "fk", function (work = key => { return false; }) { return _gb.forof(this.it.ways, work); });
defineProperty(Object, "fv", function (work = value => { return false; }) { return _gb.forof(this.it.looks, work); });
defineProperty(Object, "fe", function (work = (key, value) => { return false; }) { return _gb.forkv(this.it.entire, work); });
defineProperty(Object, "fkv", function (work = (key, value) => { return false; }) { return _gb.forkv(this.it.entire, work); });

defineProperty(Object, "ko", function (value) { for (const [key, val] of this.it.entire) if (val === value) return key; return undefined; });

defineProperty(Object, "tiw", function (key, process = (value, key, host) => value, ornot = (key, host) => host[key]) { return key in this.it ? process(this.it[key], key, this.it) : ornot(key, this.it); });

defineProperty(Object, "cp", function (dataOnly = true, primitiveOnly = false, recusive = true) { return _gb.copy(this, dataOnly, primitiveOnly, recusive); });
defineGetterAndSetter(Object, "mk", function () { return _gb.mock(this); });
defineGetterAndSetter(Object, "mm", function () { return _gb.mimic(this); });
defineGetterAndSetter(Object, "tw", function () { return _gb.twin(this); });
defineGetterAndSetter(Object, "cl", function () { return _gb.clone(this); });

defineProperty(Object, "pc", function (from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) { return _gb.patch(this.it, from, dataOnly, primitiveOnly, recusive, append); });
defineProperty(Object, "ow", function (from) { return _gb.overwrite(this.it, from); });
defineProperty(Object, "to", function (from) { return _gb.takeover(this.it, from); });
defineProperty(Object, "aq", function (from) { return _gb.acquire(this.it, from); });
defineProperty(Object, "ih", function (from) { return _gb.inherit(this.it, from); });

defineProperty(Object, "rv", function (from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) { return _gb.revert(this.it, from, dataOnly, primitiveOnly, recusive, exceptNew); });

definePropertyPlex("ifeq", function (that, process = it => it, ornot = it => {}) { return this.let(it => _gb.executeIf(it == that, process, [it], ornot)); });
definePropertyPlex("ifneq", function (that, process = it => it, ornot = it => {}) { return this.let(it => _gb.executeIf(it != that, process, [it], ornot)); });



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



// common extra characters constants
dfg("lr", "(");
dfg("rr", ")");
dfg("lc", "{");
dfg("rc", "}");
dfg("ls", "[");
dfg("rs", "]");
dfg("lt", "<");
dfg("gt", ">");
dfg("ab", _gb.lt + _gb.gt);
dfg("cb", _gb.gt + _gb.lt);
dfg("ti", "~");
dfg("ep", "!");
dfg("em", _gb.ep);
dfg("at", "@");
dfg("ds", "$");
dfg("ms", "&");
dfg("ps", "%");
dfg("cf", "^");
dfg("ak", "*");
dfg("mp", _gb.ak);
dfg("ad", "+");
dfg("add", _gb.ad + _gb.ad);
dfg("hp", "-");
dfg("sr", _gb.hp);
dfg("srr", _gb.sr + _gb.sr);
dfg("us", "_");
dfg("eq", "=");
dfg("vl", "|");
dfg("bs", "\\");
dfg("ss", "/");
dfg("dv", _gb.ss);
dfg("qm", "?");
dfg("nl", _gb.ep + _gb.eq);
dfg("le", _gb.lt + _gb.eq);
dfg("ge", _gb.gt + _gb.eq);
dfg("fa", _gb.ad + _gb.eq);
dfg("fs", _gb.sr + _gb.eq);
dfg("fm", _gb.mp + _gb.eq);
dfg("fd", _gb.dv + _gb.eq);
dfg("sq", "'");
dfg("dq", '"');
dfg("gv", '`');
dfg("cl", ":");
dfg("sc", ";");
dfg("cm", ",");
dfg("es", "");
dfg("l", _gb.cm);
dfg("s", " ");
dfg("i", "#");
dfg("d", ".");

dfg("cr", "\r");
dfg("lf", "\n");
dfg("crlf", _gb.cr + _gb.lf);
dfg("lfcr", _gb.lf + _gb.cr);
dfg("tab", "\t");

dfg("ecr", "\\r");
dfg("elf", "\\n");
dfg("ecrlf", _gb.ecr + _gb.elf);
dfg("elfcr", _gb.elf + _gb.ecr);
dfg("etab", "\\t");

