/*
    Estre U0EEOZ(common) library for Estre UI

    Author: Estre Soliette
    Established: 2024.11.12

    NOTE: Must be loaded before EstreUi.js

    Visit this rim-work's official site(GitHub)
    https://estreui.mpsolutions.kr
*/

Doctre?.patch?.();

// document aliases
const doc = {
    get b() { return document.body; },
    get $b() { return $(this.b); },
    get e() { return document.documentElement; },
    get $e() { return $(this.e); },
    get h() { return document.head; },
    get $h() { return $(this.h); },

    ce: (tagName, classIdName, contentData, style, attrs = {}, datas = {}) => Doctre.createElement(tagName, classIdName, contentData, style, attrs, datas),
    cte: (innerHtml) => {
        const tmp = document.createElement("template");
        if (innerHtml != null) tmp.innerHTML = innerHtml;
        return tmp;
    },
    cdf: () => document.createDocumentFragment(),
    ctn: (string) => document.createTextNode(string),

    l: (frostOrCold, matchReplacer = {}) => Doctre.live(frostOrCold, matchReplacer),
    s: (nodeOrListOrCold, prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) => Doctre.stringify(nodeOrListOrCold, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent),
    tre: (solidIdOrExtracted, contentData, style = {}, attrs = {}, datas = {}) => new Doctre(solidIdOrExtracted, contentData, style, attrs, datas),

    ebi: id => document.getElementById(id),
    ebn: name => document.getElementsByName(name),
    ebt: tagName => document.getElementsByTagName(tagName),
    ebc: classNames => document.getElementsByClassName(classNames),

    qs: selectors => document.querySelector(selectors),
    qsa: selectors => document.querySelectorAll(selectors),
};

// jQuery fallback placeholder
if (typeof jQuery == UNDEFINED) jQuery = function(selector) {
    if (typeof selector == STRING) return jQuery(doc.qsa(selector));
    else if (selector instanceof Node || selector instanceof NodeList || selector instanceof Array) return new class extends Array {
        constructor (nodes) {
            super();
            if (selector instanceof Node) this.push(nodes);
            else for (const node of nodes) this.push(node);
        }

        find(selector) {
            const list = [];        
            for (const node of this) list.push(...node.querySelectorAll(selector));
            return jQuery(list);
        }
    } (selector);
};
if (typeof $ == UNDEFINED) $ = jQuery;


// Tag alias constants
const m1 = "meta";
const lk = "link";
const lz = "lazy";
const bd = "body";
const div = "div";
const nv = "nav";
const ar = "article";
const se = "section";
const tmp = "template";
const h1 = "h1";
const h2 = "h2";
const h3 = "h3";
const h4 = "h4";
const h5 = "h5";
const ul = "ul";
const li = "li";
const tbl = "table";
const thd = "thead";
const tbd = "tbody";
const tft = "tfoot";
const tr = "tr";
const td = "td";
const br = "br";
const hr = "hr";
const lbl = "label";
const sp = "span";
const rb = "ruby";
const rp = "rp";
const rt = "rt";
const pg = "p";
const img = "img";
const frm = "form";
const btn = "button";
const inp = "input";
const ta = "textarea";
const sel = "select";
const opt = "option";
const lp = "lottie-player";
const dlp = "dotlottie-player";
const dll = "dotlottie-loader";

// Tag alias constants (Upper case) - for compare
const M1 = "META";
const LK = "LINK";
const LZ = "LAZY";
const BD = "BODY";
const DIV = "DIV";
const NV = "NAV";
const AR = "ARTICLE";
const SE = "SECTION";
const TMP = "TEMPLATE";
const H1 = "H1";
const H2 = "H2";
const H3 = "H3";
const H4 = "H4";
const H5 = "H5";
const UL = "UL";
const LI = "LI";
const BR = "BR";
const HR = "HR";
const LBL = "LABEL";
const SP = "SPAN";
const RB = "RUBY";
const RP = "RP";
const RT = "RT";
const PG = "P";
const IMG = "IMG";
const FRM = "FORM";
const BTN = "BUTTON";
const INP = "INPUT";
const TA = "TEXTAREA";
const SEL = "SELECT";
const OPT = "OPTION";
const LP = "LOTTIE-PLAYER";
const DLP = "DOTLOTTIE-PLAYER";


// HTML escaped constants
const hee = val => ms + val + sc;
const hei = val => ms + i + val + sc;
const nbsp = hee("nbsp");
const ltt = hee("lt");
const gtt = hee("gt");


// inline tag constants
const itt = (tagName, attributes = {}, enumables = []) => {
    let texts = [lt + tagName];

    if (isNotNully(attributes) && typeObject(attributes)) forkv(attributes, (k, v) => { if (isNotNullAndEmpty(k) && isNotNully(v)) texts.push(k + eq + v4(v)); });
    if (isNotNully(enumables) && typeObject(enumables) && isArray(enumables)) forof(enumables, v => { if (isNotNullAndEmpty(v)) texts.push(v); });

    texts.push(ss + gt);
    return texts.join(s);
}
const tbr = (className, id) => itt(br, { class: className, id });
const thr = (className, id) => itt(hr, { class: className, id });
const tig = (src, alt, className, id) => itt(img, { class: className, id, src, alt });
const tip = (type, name, className, id) => itt(inp, { class: className, id, type, name });

// packing tag constants
const tag = (tagName, innerHtml = "", attributes = {}, enumables = []) => {
    let texts = [lt + tagName];

    if (isNotNully(attributes) && typeObject(attributes)) forkv(attributes, (k, v) => { if (isNotNullAndEmpty(k) && isNotNully(v)) texts.push(k + eq + v4(v)); });
    if (isNotNully(enumables) && typeObject(enumables) && isArray(enumables)) forof(enumables, v => { if (isNotNullAndEmpty(v)) texts.push(v); });

    return (texts.join(s) + gt) + innerHtml + (lt + ss + tagName + gt);
}

// terminal tag constants
const ttt = (tagName, attributes = {}, enumables = []) => tag(tagName, "", attributes, enumables);


// element builder constnat
const eb = (tagName, attributes = {}, enumables = [], property = {}) => {
    const elem = document.createElement(tagName);

    if (isNotNully(attributes) && typeObject(attributes)) forkv(attributes, (k, v) => { if (isNotNullAndEmpty(k) && isNotNully(v)) elem.setAttribute(k, v); });
    if (isNotNully(enumables) && typeObject(enumables) && isArray(enumables)) forof(enumables, v => { if (isNotNullAndEmpty(v)) elem.setAttribute(v, es); });
    if (isNotNully(property) && typeObject(property)) forkv(property, (k, v) => { if (isNotNullAndEmpty(k)) elem[k] = v; });

    return elem;
}
const ebr = (className, id) => eb(br, { class: className, id });
const ehr = (className, id) => eb(hr, { class: className, id });
const eig = (src, alt, className, id) => eb(img, { class: className, id, src, alt });
const eip = (type, name, className, id) => eb(inp, { class: className, id, type, name });


// Tag attribute constants
const m = {
    get k() { return "checked"; },
    get v() { return "checked"; },
    get ck() { return "checked"; },
    get ckd() { return "checked"; },
    get c() { return "class"; },
    get cls() { return "class"; },
    get ce() { return "contenteditable"; },
    get d() { return "disabled"; },
    get dad() { return "disabled"; },
    get f() { return "for"; },
    get i() { return "id"; },
    get id() { return "id"; },
    get name() { return "name"; },
    get tp() { return "type"; },
    get ro() { return "readonly"; },
    get st() { return "style"; },
    get ph() { return "placeholder"; },
    get t() { return "title"; },
};

// Tag type case constants
const tp = "type";
const tv = {
    get a() { return "contenteditable"; },
    get b() { return "button"; },
    get c() { return "color"; },
    get cb() { return "checkbox"; },
    get d() { return "date"; },
    get dt() { return "datetime"; },
    get dtl() { return "datetime-local"; },
    get e() { return "email"; },
    get f() { return "file"; },
    get g() { return "range"; },
    get h() { return "hidden"; },
    get i() { return "image"; },
    get j() { return "datetime"; },
    get k() { return "tel"; },
    get l() { return "datetime-local"; },
    get m() { return "month"; },
    get n() { return "number"; },
    get o() { return ""; },
    get p() { return "password"; },
    get q() { return "search"; },
    get r() { return "radio"; },
    get rst() { return "reset"; },
    get s() { return "submit"; },
    get sr() { return "search"; },
    get t() { return "time"; },
    get tx() { return "text"; },
    get tel() { return "tel"; },
    get tp() { return "tel"; },
    get u() { return "url"; },
    get v() { return "checkbox"; },
    get w() { return "week"; },
    get x() { return "text"; },
    get z() { return "reset"; },
};
const ipt = typeText => inp + (isNully(typeText) ? ax(tp) : aiv(tp, typeText));
const itc = typeCase => ipt(tv[typeCase]);


// CSS combinator constants
const c = {
    get a() { return ad; },
    get b() { return s; },
    get c() { return gt; },
    get d() { return s; },
    get g() { return ti; },
    get w() { return ak; },
};

// CSS group constant
const cor = l;

// CSS prefix constant
const eid = i;
const cls = d;

// CSS selector common constant
const st = cf;
const ed = ds;
const equ = eq;

const ops = lr;
const cps = rr;
const obk = ls;
const cbk = rs;
const obc = lc;
const cbc = rc;


// CSS puesedo selector constant
const iz = ":is";
const nz = ":not";
const hs = ":has";
const hst = ":host";
const lng = ":lang";

const blk = ":blank";
const ept = ":empty";
const ead = ":enabled";
const dad = ":disabled";
const ckd = ":checked";
const fcs = ":focus";
const fwi = ":focus-within";
const hvr = ":hover";
const atv = ":active";

const fcd = ":first-child";
const fot = ":first-of-type";
const ocd = ":only-child";
const oot = ":only-of-type";
const lcd = ":last-child";
const lot = ":last-of-type";

const ntd = ":nth-child";
const ntp = ":nth-of-type";
const nld = ":nth-last-child";
const nlp = ":nth-last-of-type";

const rut = ":root";

const bfr = "::before";
const ftr = "::after";
const ctt = "::content";
const phd = "::placeholder";


const iso = iz + ops;
const nto = nz + ops;
const hso = hs + ops;
const hsto = hst + ops;
const lngo = lng + ops;

const ntdo = ntd + ops;
const ntpo = ntp + ops;
const nldo = nld + ops;
const nlpo = nlp + ops;

const stb = st + equ;
const edb = ed + equ;
const isv = equ + dq;
const clv = dq + cbk;
const nao = nto + obk;
const cao = cbk + cps;

const is = function () { return iso + [...arguments].join(l) + cps; };
const not = function () { return nto + [...arguments].join(l) + cps; };
const has = val => hso + val + cps;
const host = val => hsto + val + cps;
const lang = val => lngo + val + cps;

const cof = nth => ntdo + nth + cps;
const tof = nth => ntpo + nth + cps;
const lcof = nth => nldo + nth + cps;
const ltof = nth => nlpo + nth + cps;

const ncd = not(ckd);

/** brt(val) = (val) */
const brt = val => opt + val + cps;
/** brc(val) = (.val) */
const brc = val => opt + cls + val + cps;
/** bri(val) = (#val) */
const bri = val => opt + eid + val + cps;
/** ax(attr) = [attr] */
const ax = attr => obk + attr + cbk;
/** ai(attr) = [attr= */
const ai = attr => obk + attr + equ;
/** as(attr) = [attr^= */
const as = attr => obk + attr + stb;
/** ae(attr) = [attr$= */
const ae = attr => obk + attr + edb;
/** ah(attr) = [attr~= */
const ah = attr => obk + attr + c.g + equ;
/** ac(attr) = [attr*= */
const ac = attr => obk + attr + c.w + equ;
/** aiv(attr, val) = [attr="val"] */
const aiv = (attr, val) => ai(attr) + v4(val) + cbk;
/** asv(attr, val) = [attr^="val"] */
const asv = (attr, val) => as(attr) + v4(val) + cbk;
/** aev(attr, val) = [attr$="val"] */
const aev = (attr, val) => ae(attr) + v4(val) + cbk;
/** ahv(attr, val) = [attr~="val"] */
const ahv = (attr, val) => ah(attr) + v4(val) + cbk;
/** acv(attr, val) = [attr*="val"] */
const acv = (attr, val) => ac(attr) + v4(val) + cbk;
/** is(val) = :is(val) */
const isc = val => iso + val + cps;
/** ntt(val) = :not(val) */
const ntt = val => nto + val + cps;
/** ntc(val) = :not(.val) */
const ntc = val => nto + cls + val + cps;
/** nti(val) = :not(#val) */
const nti = val => nto + eid + val + cps;
/** nai(attr) = :not([attr= */
const nai = attr => nao + attr + equ;
/** nav(val) = "val"] */
const nav = val => dq + val + clv;
/** nax(attr) = :not([attr]) */
const nax = attr => nao + attr + cao;
/** naiv(attr, val, append = "") = :not([attr="val"]append) */
const naiv = (attr, val, append = "") => nai(attr) + nav(val) + append + cps;

// CSS attrib name constant
const a = {
    trdr: "transition-duration",
    trdl: "transition-delay",
    _trdl_hide: "--trdl-hide",
    _trdr_hide: "--trdr-hide",
};

// CSS attrib values constant
const v0 = '"0"';
const v1 = '"1"';
const v2 = '"2"';
const v3 = '"3"';
/** v4(val) = "val" */
const v4 = val => '"' + val + '"';
const isv0 = '="0"]';
const isv1 = '="1"]';
const isv2 = '="2"]';
const isv3 = '="3"]';
/** isv4(val) = ="val"] */
const isv4 = val => '="' + val + '"]';

// CSS variable name constant
const v = {
    supportPrefix: "--support-",
    s: function(method) { return this.supportPrefix + method; },

    scalableMethod: "--scalable-method",

    eoo: eoo
};

/** CSS support check */ 
const csc = method => doc.$b.css(v.s(method)) == t1;

/** CSS support methods */
const csm = {
    containerQuery: "container-query",
};

/** CSS value time - to miliseconds */
const cvt = {
    t2ms: function(timeCSS) {
        if (timeCSS == null || timeCSS == "") return 0;
        var time;
        if (timeCSS.indexOf("m") > -1) time = parseInt(parseFloat(timeCSS.replace("m", "")) * 60000);
        if (timeCSS.indexOf("ms") > -1) time = parseInt(timeCSS.replace("ms", ""));
        else time = parseInt(parseFloat(timeCSS.replace("s", "")) * 1000);
        
        return time;
    },
};



// Utility constants block --

// Text alias constant
const t0 = "0";
const t1 = "1";
const t2 = "2";
const t3 = "3";
const t4 = "4";
const t5 = "5";
const t6 = "6";
const t7 = "7";
const t8 = "8";
const t9 = "9";

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


//common methods
const v2a = function (value) {
    value += "";
    
	var regex = /(^[+-]?\d+)(\d{3})/;
	while (regex.test(value)) value = value.replace(regex, "$1" + "," + "$2");

	return value;
}

const v2d = function (value, length = 2) {
    return (value + "").padStart(length, "0");
}    

const f4f = function (value, length = 2) {
    return parseFloat(value).toFixed(length);
}

const koInitMatchTable = {
    "ㄱ": "[가-깋]",
    "ㄲ": "[까-낗]",
    "ㄴ": "[나-닣]",
    "ㄷ": "[다-딯]",
    "ㄸ": "[따-띻]",
    "ㄹ": "[라-맇]",
    "ㅁ": "[마-밓]",
    "ㅂ": "[바-빟]",
    "ㅃ": "[빠-삫]",
    "ㅅ": "[사-싷]",
    "ㅆ": "[싸-앃]",
    "ㅇ": "[아-잏]",
    "ㅈ": "[자-짛]",
    "ㅉ": "[짜-찧]",
    "ㅊ": "[차-칳]",
    "ㅋ": "[카-킿]",
    "ㅌ": "[타-팋]",
    "ㅍ": "[파-핗]",
    "ㅎ": "[하-힣]",
}

const t2r = function (text, options = "gi") {
    let trd;
    if (text.match(/[ㄱ-ㅎ]/) == null) trd = text;
    else {
        const tcs = [];
        for (var i in text) {
            const char = text[i];
            const found = char.match(/[ㄱ-ㅎ]/);
            let tc;
            if (found == null) tc = char;
            else tc = koInitMatchTable[char];
            tcs[i] = tc;
        }
        trd = tcs.join("");
    }
    return new RegExp(trd, options);
}


const parseBoolean = function (value) {
    switch (value) {
        default:        
        case UNDEFINED:
            return undefined;

        case "":
        case NULL:
            return null;

        case FALSE:
            return false;

        case TRUE:
            return true;
    }
};


class EstreBytes{
    static shorten(bytes) {
        var bytes = parseInt(bytes);
        var level = 0;
        while (bytes > 999) {
            bytes /= 1024;
            level++;
        }
        return bytes.toFixed(bytes < 1 ? 2 : 1) + this.getByteUnit(level);
    }

    static get byteUnits() { return ["byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]; }

    static getByteUnit(level) {
        if (level < this.byteUnits.length) return this.byteUnits[level];
        else return "·2^" + (level * 10) + "Byte";
    }
}



function isKorean() { return navigator.language.indexOf("ko") > -1; }


const UA = navigator.userAgent;
const ua = {
    get lc() {
        return UA.toLowerCase();
    },


    get isAndroid() {
        return this.lc.indexOf("android") > -1;
    },

    get isAppleMobile() {
        const lc = this.lc;
        return lc.indexOf("ipad") > -1 || lc.indexOf("iphone") > -1 || lc.indexOf("ipod") > -1;
    },

    get isSafari() {
        return this.lc.indexOf("safari") > -1;
    },

    get iOsVersion() {
        const matches = this.lc.match(/os (\d+(_\d+)+)\s/);
        if (matches != null) {
            const raw = matches[1];
            return raw != null ? raw.replace(/_/g, ".") : null;
        } else return null;
    },
}



/**
 * User Experience constants and static functions
 */
class EUX {

    static get isExtensive() {
        return $(document.body).css("--ui-extensive") == TRUE;
    }


    static async setOnImagesFullyLoaded(callback = () => {}, debug = globalThis?.isDebug ?? false) {
        await Promise.all(Array.from(document.images).map(img => {
            if (img.complete)
                return Promise.resolve(img.naturalHeight !== 0);
            return new Promise(resolve => {
                let clear;
                const onLoad = e => {
                    clear(e.target);
                    resolve(true);
                }
                const onError = e => {
                    clear(e.target);
                    resolve(false);
                }
                clear = elem => {
                    elem.removeEventListener('load', onLoad);
                    elem.removeEventListener('error', onError);
                }
                
                img.addEventListener('load', onLoad);
                img.addEventListener('error', onError);
            });
        })).then(results => {
            if (debug) {
                if (results.every(res => res)) console.log('all images loaded successfully');
                else console.log('some images failed to load, all finished loading');
            }

            callback();
        });
    }


    static async setOnLinksFullyLoaded(callback = () => {}, debug = globalThis?.isDebug ?? false) {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]'));
        
        await Promise.all(links.map(link => {
            // 이미 로드된 경우 체크
            if (link.sheet || link.readyState === 'complete') {
                return Promise.resolve(true);
            }
            
            return new Promise(resolve => {
                let clear;
                const onLoad = e => {
                    clear(e.target);
                    resolve(true);
                }
                const onError = e => {
                    clear(e.target);
                    resolve(false);
                }
                clear = elem => {
                    elem.removeEventListener('load', onLoad);
                    elem.removeEventListener('error', onError);
                }

                link.addEventListener('load', onLoad);
                link.addEventListener('error', onError);
                
                // 타임아웃 설정 (10초)
                setTimeout(onError, 10000, { target: link });
            });
        })).then(results => {
            if (debug) {
                if (results.every(res => res)) console.log('all links loaded successfully');
                else console.log('some links failed to load, all finished loading');
            }

            callback();
        });
    }

}



/**
 * Estre Local styler
 */
class LocalStyle {

    static localize(elem, styleText = elem.innerHTML, location = elem.parentElement) {
        const htmlEntities = {
            "&nbsp;": " ",
            "&lt;": "<",
            "&gt;": ">",
            "&amp;": "&",
            "&quot;": '"',
            "&#39;": "'"
        };
        const styles = styleText.replace(/&[a-zA-Z0-9#]+;/g, match => htmlEntities[match] || match);

        const pathTree = [];
        var current = location;
        do {
            pathTree.push(current);
            current = current.parentElement;
        } while (current.tagName != BD)
        pathTree.reverse();

        let localPrefix = "";
        for (const [index, item] of pathTree.entire) {
            const { tagName: TagName, className, id } = item;
            const tagName = TagName.toLowerCase();
            let parent;
            let parentChildren;
            let childIndex;

            if (index > 0) {
                localPrefix += " > ";
                parent = pathTree[index - 1];
                parentChildren = Array.from(parent.children);
                childIndex = parentChildren.indexOf(item);
            } else {
                parent = null;
                childIndex = null;
            }

            let specifier = tagName;
            if (tagName == div && className.replace(" ").includes("container") && isNotNullAndEmpty(item.dataset.containerId)) {
                specifier += '[data-container-id="' + item.dataset.containerId + '"]';
            } else if (tagName == ar && isNotNullAndEmpty(item.dataset.articleId)) {
                specifier += '[data-article-id="' + item.dataset.articleId + '"]';
            } else {
                if (isNotNullAndEmpty(id)) specifier += "#" + id;
                else {
                    if (isNotNullAndEmpty(className)) specifier += "." + className.replace(" ", ".");
                    if (isNotNully(childIndex)) {
                        const moreExistSameSpecfier = checkCount((k, v) => v != item && v.tagName + roes(isNotNullAndEmpty(v.className), "." + v.className.replace(" ", ".")) == specifier) > 0;
                        if (moreExistSameSpecfier) specifier += ":nth-child(" + (childIndex + 1) + ")";
                    }
                }
            }
            localPrefix += specifier;
        }
        // const localizedStyles = styles.replace(/^([\t\s]*)##/gm, "$1" + localPrefix);
        const localizedStyles = styles.replace(/([^#])##([^#])/g, "$1" + localPrefix + "$2").replace(/^##([^#])/gm, localPrefix + "$1");

        const styleSheet = doc.ce("style");
        if (elem == null) location.append(styleSheet);
        else {
            styleSheet.innerHTML = localizedStyles;
            elem.outerHTML = styleSheet.outerHTML;
        }
    }

    static appendLocalize(location, localStyle) {
        this.localize(null, localStyle, location);
    }
}


/**
 * Locale constants
 */
class EsLocale {
    static get currentLocale() { return navigator.language; }
    static get currentLanguage() { return this.currentLocale?.split("-")[0] ?? "en"; }

    static collections = {
        "en": {
            "weekdays": ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"],
            "weekdaysFull": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "weekdaysShort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "months": ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
            "monthsFull": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "monthsShort": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

            "yearPrefix": "",
            "yearSuffix": "",
            "yearSequencePrefix": "Year ",
            "yearSequenceSuffix": "",
            "monthPrefix": "",
            "monthSuffix": "",
            "monthSequencePrefix": "",
            "monthSequenceSuffix": "",
            "weekPrefix": "w",
            "weekSuffix": "",
            "weekSequencePrefix": "Week ",
            "weekSequenceSuffix": "",
            "dayPrefix": "",
            "daySuffix": "",
            "daySequencePrefix": "Day ",
            "daySequenceSuffix": "",
            "weekdayPrefix": "",
            "weekdaySuffix": "",
            "weekdayShortPrefix": "",
            "weekdayShortSuffix": "",

            "hourPrefix": "",
            "hourSuffix": "",
            "minutePrefix": "",
            "minuteSuffix": "",
            "secondPrefix": "",
            "secondSuffix": "",

            "yearly": "Yearly",
            "monthly": "Monthly",
            "weekly": "Weekly",
            "daily": "Daily",
            "wholeday": "Whole day",
            "wholedayShort": "Whole",
            "timely": "Timely",
            "timelyShort": "Time",
            "hourly": "Hourly",

            "today": "Today",

            "am": "morning",
            "pm": "afternoon",
            "amShort": "AM",
            "pmShort": "PM",

            "dateDataDivider": "-",
            "timeDataDivider": ":",
            "dateDivider": "/",
            "timeDivider": ":",

            "dataDataSequence": "ymd",
            "dateSequence": "mdy",
            "timeSequence": "hms",

            "weekStart": 0,
            "weekStartSunday": 0,
            "weekStartMonday": 1,
            "weekStartSaturday": 6,

            "noSchedule": "No schedule",


            "exitApplicationWhenPressBackAgain": "Press back again to exit",
        },
        
        "ko": {
            "weekdays": ["일", "월", "화", "수", "목", "금", "토"],
            "weekdaysFull": ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
            "weekdaysShort": ["일", "월", "화", "수", "목", "금", "토"],
            "months": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            "monthsFull": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            "monthsShort": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],

            "yearPrefix": "",
            "yearSuffix": "년",
            "yearSequencePrefix": "",
            "yearSequenceSuffix": "년도",
            "monthPrefix": "",
            "monthSuffix": "월",
            "monthSequencePrefix": "",
            "monthSequenceSuffix": "월",
            "weekPrefix": "",
            "weekSuffix": "주",
            "weekSequencePrefix": "",
            "weekSequenceSuffix": "주차",
            "dayPrefix": "",
            "daySuffix": "일",
            "daySequencePrefix": "",
            "daySequenceSuffix": "일",
            "weekdayPrefix": "",
            "weekdaySuffix": "요일",
            "weekdayShortPrefix": "(",
            "weekdayShortSuffix": ")",

            "hourPrefix": "",
            "hourSuffix": "시",
            "minutePrefix": "",
            "minuteSuffix": "분",
            "secondPrefix": "",
            "secondSuffix": "초",

            "yearly": "연간",
            "monthly": "월간",
            "weekly": "주간",
            "daily": "일간",
            "wholeday": "하루종일",
            "wholedayShort": "종일",
            "timely": "시간별",
            "timelyShort": "시간",
            "hourly": "시간별",

            "today": "오늘",

            "am": "오전",
            "pm": "오후",
            "amShort": "오전",
            "pmShort": "오후",

            "dateDataDivider": "-",
            "timeDataDivider": ":",
            "dateDivider": ".",
            "timeDivider": ":",

            "dateDataSequence": "ymd",
            "dateSequence": "ymd",
            "timeSequence": "hms",

            "weekStart": 0,
            "weekStartSunday": 0,
            "weekStartMonday": 1,
            "weekStartSaturday": 6,

            "noSchedule": "일정 없음",


            "exitApplicationWhenPressBackAgain": "다시 한번 뒤로 이동하면 앱을 종료합니다",
        },
    }

    static get(item, lang = this.currentLocale) {
        return this.collections[lang]?.[item] ?? this.collections[lang.split("-")[0]]?.[item] ?? this.collections["en"][item];
    }
}


/**
 * Common calendar methods
 */
const Ecal = {

    get currentLocale() { return EsLocale.currentLocale; },

    getLastDate(year, month0) {
        if (year instanceof Date) {
            month0 = year.getMonth();
            year = year.getFullYear();
        }
        return new Date(year, month0 + 1, 0);
    },

    getLastDay(year, month0) {
        return this.getLastDate(year, month0).getDate();
    },


    getLastWeek(year, month0) {
        const lastDay = this.getLastDate(year, month0);
        const ymw = this.getYearMonthWeek(lastDay);

        if (ymw.year == year && ymw.month0 == month0) return ymw.week;
        else {
            lastDay.setDate(lastDay.getDate() - 7);
            return this.getYearMonthWeek(lastDay).week;
        }
    },

    getWeek(year, month0, date) {
        var ddate;
        if (year instanceof Date) {
            ddate = year;
            year = ddate.getFullYear();
            month0 = ddate.getMonth();
            date = ddate.getDate();
        } else ddate = new Date(year, month0, date);

        const ymw = this.getYearMonthWeek(ddate);

        if (ymw.year > year || (ymw.year == year && ymw.month0 > month0)) return this.getYearMonthWeek(year, month0, date - 7).week + 1;
        else if (ymw.year < year || (ymw.year == year && ymw.month0 < month0)) return Ecal.getBeginSundayAndWeek(ddate).week;
        else return ymw.week;
    },

    getYearMonthWeek(year, month0, date) {
        if (year instanceof Date) date = new Date(year.getFullYear(), year.getMonth(), year.getDate());
        else date = new Date(year, month0, date);

        const forYear = date.getFullYear();
        const forMonth = date.getMonth();
        const firstDateOfNextMonth = new Date(forYear, forMonth + 1, 1);
        const beginOfNextMonth = this.getBeginSundayAndWeek(firstDateOfNextMonth);
        
        if (date.getTime() >= beginOfNextMonth.date.getTime() && firstDateOfNextMonth.getDay() < 5) {
            const firstDateOfWeek = beginOfNextMonth.date;
                firstDateOfWeek.setDate(firstDateOfWeek.getDate() + 4);
                const thisYear = firstDateOfWeek.getFullYear();
                const thisMonth = firstDateOfWeek.getMonth();
                return { year: thisYear, month: thisMonth + 1, month0: thisMonth, week: 1 };
        } else {
            const forDate = date.getDate();
            const forDay = date.getDay();
            const weekBeginDate = forDate - forDay;

            const monthBeginSunday = this.getBeginSundayAndWeek(date);
            const beginDate = monthBeginSunday.date;
            var beginWeek = monthBeginSunday.week;
            date.setDate(weekBeginDate);
            while (beginDate.getTime() < date.getTime()) {
                beginDate.setDate(beginDate.getDate() + 7);
                beginWeek++;
            }

            if (beginWeek > 0) {
                date.setDate(date.getDate() + 4);
                const m0 = date.getMonth();
                return { year: date.getFullYear(), month: m0 + 1, month0: m0, week: beginWeek };
            } else {
                const lastDateOfPrevMonth = new Date(forYear, forMonth, 0);
                const beginDateOfLastWeekOfPrevMonth = lastDateOfPrevMonth.getDate() - lastDateOfPrevMonth.getDay();
                const weekBeginDate = new Date(forYear, forMonth, beginDateOfLastWeekOfPrevMonth);
                const monthBeginSunday = this.getBeginSundayAndWeek(weekBeginDate);
                const thisYear = beginDate.getFullYear();
                const thisMonth = beginDate.getMonth();
                const thisWeek = monthBeginSunday.week + parseInt((weekBeginDate.getDate() - monthBeginSunday.date.getDate()) / 7);//this.getYearMonthWeek(thisYear, thisMonth, beginDate.getDate() - 14).week + 2;
                return { year: thisYear, month: thisMonth + 1, month0: thisMonth, week: thisWeek };
            }
        }
    },


    getDateSundayOfWeek(year, month0, week) {
        return this.getDateWeekSundayOfWeek(year, month0, week).date;
    },

    getBeginSundayAndWeek(year, month0) {
        return this.getDateWeekSundayOfWeek(year, month0);
    },

    getDateWeekSundayOfWeek(year, month0, week) {
        if (year instanceof Date) return this.getDateWeekSundayOfWeek(year.getFullYear(), month0 == null ? year.getMonth() : month0, week);

        const lastDateOfPrevMonth = new Date(year, month0, 0);
        const lastDayOfPrevMonth = lastDateOfPrevMonth.getDay();
        var baseWeek;
        var justBegin = false;
        switch(lastDayOfPrevMonth) {
            case 6: //토 - 일요일 시작
                justBegin = true;
            case 0: //일 - 월요일 시작
            case 1: //월 - 화요일 시작
            case 2: //화 - 수요일 시작
            case 3: //수 - 목요일 시작
                baseWeek = 1;
                break;
            case 4: //목 - 금요일 시작
            case 5: //금 - 토요일 시작
                baseWeek = 0;
                break;
        }

        var firstSunday = 0 - lastDayOfPrevMonth;
        var adjustOffset;
        if (week == null) {
            week = baseWeek;
            adjustOffset = 1;
            if (justBegin || week == 0) firstSunday += 7;
        } else {
            adjustOffset = baseWeek;
            if (justBegin) firstSunday += 7;
        }
        const addDays = 7 * (week - adjustOffset);
        
        return { date: new Date(year, month0, firstSunday + addDays), week: week };
    },

    getDateSetSundayOfWeek(year, month0, week) {
        return this.getDateSet(Ecal.getDateSundayOfWeek(year, month0, week));
    },

    getNearPosition(criteria, offset = 0, unit = "day") {
        if (unit == null) return null;

        const cd = this.getDateSet(criteria);

        var d = null;
        var year = null;
        var month0 = null;
        var date = null;
        switch (unit) {
            case "year":
                year = cd.year + offset;
                break;

            case "month":
                month0 = cd.month0 + offset;
                if (month0 < 0) {
                    year = cd.year;
                    do {
                        year--;
                        month0 += 12;
                    } while (month0 < 0);
                } else if (month0 > 11) {
                    year = cd.year + parseInt(month0 / 12);
                    month0 %= 12;
                }
                break;

            case "week":
                d = Ecal.getDateSundayOfWeek(cd.year, cd.month0, cd.week + offset);
                d.setDate(d.getDate() + cd.day);
                break;

            case "day":
                d = new Date(criteria);
                d.setDate(d.getDate() + offset);
                break;
        }
        if (d == null) {
            if (year == null) year = cd.year
            if (month0 == null) month0 = cd.month0;
            if (date == null) date = Math.min(cd.date, Ecal.getLastDay(year, month0)); 
            d = new Date(year, month0, date);
        }

        return d;
    },

    getUnitFrom(scale) {
        switch (scale) {
            case 1:
                //do nothing
                break;
                
            case 2:
                return "year";

            case 3:
                return "month";

            case 5:
                return "week";

            case 6:
                return "day";

        }
        return null;
    },

    getScopeFrom(scale) {
        switch (scale) {
            case 1:
                //do nothing
                break;
                
            case 2:
                return "yearly";

            case 3:
                return "monthly";

            case 5:
                return "weekly";

            case 6:
                return "daily";
    
        }
        return null;
    },

    getPrevMonth(year, month) {
        let date;
        if (year instanceof Date) date = year;
        else date = new Date(year, month - 1, 1);

        date.setMonth(date.getMonth() - 1);

        return date;
    },

    getNextMonth(year, month) {
        let date;
        if (year instanceof Date) date = year;
        else date = new Date(year, month - 1, 1);

        date.setMonth(date.getMonth() + 1);

        return date;
    },

    getDateSetNearPosition(criteria, offset = 0, unit = "day") {
        if (unit == null) return null;
        else return this.getDateSet(this.getNearPosition(criteria, offset, unit));
    },

    getDateOffset(year = new Date(), month0, date) {
        if (year instanceof Date) date = new Date(year.getFullYear(), year.getMonth(), year.getDate());
        else if (typeof year == STR && year.length == 10 && year.indexOf(hp) > -1) date = new Date(year);
        else date = new Date(year, month0, date);
        
        return parseInt(((date.getTime() / 60 / 60 / 1000) + (date.getTimezoneOffset() / -60)) / 24);
    },

    getDateFrom(offset) {
        const date = new Date();
        return new Date(((offset * 24) + (date.getTimezoneOffset() / 60)) * 60 * 60 * 1000);
    },

    getDateSetFrom(offset) {
        return this.getDateSet(this.getDateFrom(offset));
    },

    getDateStringFrom(offset) {
        return this.getDateString(this.getDateFrom(offset));
    },

    getMonthOffset(year, month0) {
        if (year instanceof Date) {
            month0 = year.getMonth();
            year = year.getFullYear();
        }
        return year * 12 + month0;
    },

    getDateFromMonth(offset, date = 1) {
        const year = parseInt(offset / 12);
        const month0 = offset % 12;
        return new Date(year, month0, date < 28 ? date : Math.min(date, Ecal.getLastDay(year, month0)));
    },

    getDateSetFromMonth(offset, date = 1) {
        return this.getDateSet(this.getDateFromMonth(offset, date));
    },

    getDateArray(date = new Date()) {
        return [date.getFullYear(), v2d(date.getMonth() + 1), v2d(date.getDate())];
    },

    getDateString(date = new Date(), divider = hp) {
        return this.getDateArray(date).join(divider);
    },

    getTimeArray(date = new Date()) {
        return [date.getHours(), v2d(date.getMinutes()), v2d(date.getSeconds())];
    },

    getTimeString(date = new Date(), divider = cl) {  
        return this.getTimeArray(date).join(divider);
    },

    getDateTimeString(date = new Date()) {
        return [this.getDateString(date), this.getTimeString(date)].join(s);
    },

    getDayEmoji(date) {
        switch(date instanceof Date ? date.getDay() : date) {
            case 0:
                return "☀️";
            case 1:
                return "🌙";
            case 2:
                return "🔥";
            case 3:
                return "💧";
            case 4:
                return "🪵";
            case 5:
                return "👑";
            case 6:
                return "⛱️";
        }
        return "";
    },

    getDayText(date, lang = this.defaultLanguage) {
        const day = date instanceof Date ? date.getDay() : date;
        return EsLocale.get("weekdays", lang)[day] ?? "";
    },

    getDayTextDay(date, lang = this.defaultLanguage, suffix) {
        if (suffix == null) suffix = EsLocale.get("weekdaySuffix");
        return this.getDayText(date) + suffix;
    },

    getDateSet(date = new Date(), lang = this.defaultLanguage) {
        const month0 = date.getMonth();
        const day = date.getDay();
        const dateArray = this.getDateArray(date);
        const dateString = dateArray.join(hp);
        const timeArray = this.getTimeArray(date);
        const timeString = timeArray.join(cl);
        const dateTimeString = [this.getDateString(date), timeString].join(s);
        const hours = date.getHours();
        const hours12 = (hours % 12).let(it => it == 0 ? 12 : it);
        const isPM = hours >= 12;
        return {
            ymw: this.getYearMonthWeek(date),
            year: date.getFullYear(),
            year2d: date.getFullYear() % 100,
            yearShort: date.getFullYear() % 100,
            month: month0 + 1,
            month0,
            month2d: v2d(month0 + 1),
            monthText: EsLocale.get("monthsShort", lang)[month0],
            monthTextFull: EsLocale.get("monthsFull", lang)[month0],
            monthTextShort: EsLocale.get("months", lang)[month0],
            week: this.getWeek(date),
            date: date.getDate(),
            date2d: v2d(date.getDate()),
            day,
            dayText: this.getDayText(day, lang),
            dayTextDay: this.getDayTextDay(day, lang),
            dayTextFull: EsLocale.get("weekdaysFull", lang)[day],
            dayTextShort: EsLocale.get("weekdaysShort", lang)[day],
            dayEmoji: this.getDayEmoji(day),
            dateArray,
            dateString,
            time: date.getTime(),
            timeArray,
            timeString,
            isPM,
            noon: isPM ? EsLocale.get("pm", lang) : EsLocale.get("am", lang),
            noonShort: isPM ? EsLocale.get("pmShort", lang) : EsLocale.get("amShort", lang),
            hours,
            hours2d: v2d(hours),
            hours12,
            minutes: date.getMinutes(),
            minutes2d: v2d(date.getMinutes()),
            seconds: date.getSeconds(),
            seconds2d: v2d(date.getSeconds()),
            dateTimeString,
            dateOrigin: new Date(date),
        }
    },

    /** 시간순 정렬 함수 */
    byTime: (a, b) => a.time - b.time,

    eoo
};


/**
 * Common scheduler methods
 */
const Escd = {

    get currentLocale() { return EsLocale.currentLocale; },

    getScopeBy(bound) {
        bound += "";
        if (bound.length < 5) return "yearly";
        else {
            const divided = bound.split(".");
            if (divided.length > 2) return "daily";
            else {
                const monthand = divided[1].split("w");
                if (monthand.length > 1) return "weekly";
                else return "monthly";
            }
        }
    },

    getDateBeginEndFrom(bound, scope = this.getScopeBy(bound)) {
        const d = Escd.parseBound(bound, scope);

        var beginDate;
        var endDate;
        switch (scope) {
            case "yearly":
                beginDate = Ecal.getDateOffset(new Date(d.year, 0, 1));
                endDate = Ecal.getDateOffset(new Date(d.year, 11, 31));
                break;
                
            case "monthly":
                beginDate = Ecal.getDateOffset(new Date(d.year, d.month0, 1));
                endDate = Ecal.getDateOffset(new Date(d.year, d.month0, Ecal.getLastDay(d.year, d.month0)));
                break;

            case "weekly":
                const begin = Ecal.getDateSundayOfWeek(d.year, d.month0, d.week);
                beginDate = Ecal.getDateOffset(begin);
                endDate = Ecal.getDateOffset(new Date(begin.getFullYear(), begin.getMonth(), begin.getDate() + 6));
                break;

            case "daily":
                const offset = Ecal.getDateOffset(new Date(d.year, d.month0, d.date));
                beginDate = offset;
                endDate = offset;
                break;
        }

        return { beginDate: beginDate, endDate: endDate };
    },

    getBounds(scope, date) {
        const d = Ecal.getDateSet(date);

        var bounds = [];
        switch (scope) {
            case "yearly":
                bounds[0] = d.year;
                bounds[-1] = d.year - 1;
                bounds[1] = d.year + 1;
                break;
                
            case "monthly":
                const isFirstMonth = d.month == 1;
                const isLastMonth = d.month == 12;
                bounds[0] = d.year + "." + v2d(d.month + "");
                bounds[-1] = (isFirstMonth ? d.year - 1 : d.year) + "." + v2d(isFirstMonth ? 12 : d.month - 1);
                bounds[1] = (isLastMonth ? d.year + 1 : d.year) + "." + v2d(isLastMonth ? 1 : d.month + 1);
                break;

            case "weekly":
                const pw = Ecal.getYearMonthWeek(new Date(d.year, d.month0, d.date - 7));
                const nw = Ecal.getYearMonthWeek(new Date(d.year, d.month0, d.date + 7));
                bounds[0] = d.ymw.year + "." + v2d(d.ymw.month) + "w" + d.ymw.week;
                bounds[-1] = pw.year + "." + v2d(pw.month) + "w" + pw.week;
                bounds[1] = nw.year + "." + v2d(nw.month) + "w" + nw.week;
                break;

            case "daily":
                const pd = Ecal.getDateSet(new Date(d.year, d.month0, d.date - 1));
                const nd = Ecal.getDateSet(new Date(d.year, d.month0, d.date + 1));
                bounds[0] = d.year + "." + v2d(d.month) + "." + v2d(d.date);
                bounds[-1] = pd.year + "." + v2d(pd.month) + "." + v2d(pd.date);
                bounds[1] = nd.year + "." + v2d(nd.month) + "." + v2d(nd.date);
                break;
        }

        return bounds;
    },

    getBoundBy(offset, bound, scope, lang = this.defaultLanguage) {
        const d = this.parseBound(bound, scope);
        var bounds;
        switch (scope) {
            case "yearly":
                bounds = this.getBounds(scope, new Date(d.year, 1, 11));
                break;
                
            case "monthly":
                bounds = this.getBounds(scope, new Date(d.year, d.month0, 11));
                break;

            case "weekly":
                bounds = this.getBounds(scope, Ecal.getDateSundayOfWeek(d.year, d.month0, d.week));
                break;

            case "daily":
                bounds = this.getBounds(scope, new Date(d.year, d.month0, d.date));
                break;
        }

        return bounds[offset];
    },

    parseBound(bound, scope, lang = this.defaultLanguage) {
        switch (scope) {
            case "yearly":
                return { year: parseInt(bound) };
                
            case "monthly":
                var divided = bound.split(".");
                var year = divided[0];
                var month = parseInt(divided[1]);
                return { year: year, month: month, month0: month - 1 };

            case "weekly":
                var divided = bound.split(".");
                var year = divided[0];
                divided = divided[1].split("w");
                var month = parseInt(divided[0]);
                var week = divided[1];
                return { year: year, month: month, month0: month - 1, week: week };
                
            case "daily":
                var divided = bound.split(".");
                var year = divided[0];
                var month = parseInt(divided[1]);
                var date = parseInt(divided[2]);
                var day = EsLocale.get("weekdaysShort", lang)[new Date(year, month - 1, date).getDay()];
                return { year: year, month: month, month0: month - 1, date: date, day: day };
        }
    },

    getCategoryEmoji(category) {
        return matchCase(category, {
            "holiday": "🏠",
            "vacation": "🏖️",
            "closed": "⛓️",
            "ceremony": "🎉",
            "exam": "💯",
            [def]: "📅",
        });
    },

    eoo
};
