/*
    Estre U0EEOZ(common) library for Estre UI

    Author: Estre Soliette
    Established: 2024.11.12

    NOTE: Must be loaded before EstreUi.js

    Visit this rim-work's official site(GitHub)
    https://estreui.mpsolutions.kr
*/

// common constants
const N = "null";
const U = "undefined";
const T = "true";
const F = "false";
const n = null;
const u = undefined;
const t = true;
const f = false;
const eoo = u;
const STR = "string";
const NUM = "number";
const str = String;
const num = Number;


// document aliases
const doc = {
    get b() { return document.body; },
    get $b() { return $(this.b); },

    ce: (tagName, className, innerHTML) => {
        const element = document.createElement(tagName);
        if (className != null) element.setAttribute(m.cls, className);
        if (innerHTML != null) element.innerHTML = innerHTML;
        return element;
    },

    ebi: (id) => document.getElementById(id),
    ebn: (name) => document.getElementsByName(name),
    ebt: (tagName) => document.getElementsByTagName(tagName),
    ebc: (classNames) => document.getElementsByClassName(classNames),

    qs: (selectors) => document.querySelector(selectors),
    qsa: (selectors) => document.querySelectorAll(selectors),
};

// jQuery fallback placeholder
if (typeof jQuery == U) jQuery = function(selector) {
    if (typeof selector == STR) return jQuery(doc.qsa(selector));
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
if (typeof $ == U) $ = jQuery;


// Tag alias constants
const div = "div";
const ar = "article";
const se = "section";
const ul = "ul";
const li = "li";
const lbl = "label";
const sp = "span";
const rb = "ruby";
const rp = "rp";
const rt = "rt";
const btn = "button";
const inp = "input";
const ta = "textarea";
const sel = "select";
const opt = "option";

// Tag alias constants (Upper case) - for compare
const DIV = "DIV";
const AR = "ARTICLE";
const SE = "SECTION";
const UL = "UL";
const LI = "LI";
const LBL = "LABEL";
const SP = "SPAN";
const RB = "RUBY";
const RP = "RP";
const RT = "RT";
const BTN = "BUTTON";
const INP = "INPUT";
const TA = "TEXTAREA";
const SEL = "SELECT";
const OPT = "OPTION";

// Tag attribute constants
const m = {
    cls: "class",
};

// CSS combinator constants
const c = {
    a: "+",
    b: " ",
    c: ">",
    d: " ",
    g: "~",
    w: "*",

    eoo: eoo
};

// CSS group constant
const cor = ",";

// CSS prefix constant
const eid = "#";
const cls = ".";

// CSS selector constant
const sq = "'";
const dq = '"';
const bro = "(";
const is = ":is(";
const nto = ":not(";
const clo = ")";
const opa = "[";
const cla = "]";
const equ = "=";
const stb = "^=";
const edb = "$=";
const isv = '="';
const clv = '"]';
const nao = ":not(["
const cao = "])"
/** brt(val) = (val) */
const brt = (val) => bro + val + clo;
/** brc(val) = (.val) */
const brc = (val) => bro + cls + val + clo;
/** bri(val) = (#val) */
const bri = (val) => bro + eid + val + clo;
/** ax(attr) = [attr] */
const ax = (attr) => opa + attr + cla;
/** ai(attr) = [attr= */
const ai = (attr) => opa + attr + equ;
/** as(attr) = [attr^= */
const as = (attr) => opa + attr + stb;
/** ae(attr) = [attr$= */
const ae = (attr) => opa + attr + edb;
/** ah(attr) = [attr~= */
const ah = (attr) => opa + attr + c.g + equ;
/** ac(attr) = [attr*= */
const ac = (attr) => opa + attr + c.w + equ;
/** aiv(attr, val) = [attr="val"] */
const aiv = (attr, val) => ai(attr) + v4(val) + cla;
/** asv(attr, val) = [attr^="val"] */
const asv = (attr, val) => as(attr) + v4(val) + cla;
/** aev(attr, val) = [attr$="val"] */
const aev = (attr, val) => ae(attr) + v4(val) + cla;
/** ahv(attr, val) = [attr~="val"] */
const ahv = (attr, val) => ah(attr) + v4(val) + cla;
/** acv(attr, val) = [attr*="val"] */
const acv = (attr, val) => ac(attr) + v4(val) + cla;
/** is(val) = :is(val) */
const isc = (val) => is + val + clo;
/** ntt(val) = :not(val) */
const ntt = (val) => nto + val + clo;
/** ntc(val) = :not(.val) */
const ntc = (val) => nto + cls + val + clo;
/** nti(val) = :not(#val) */
const nti = (val) => nto + eid + val + clo;
/** nai(attr) = :not([attr= */
const nai = (attr) => nao + attr + equ;
/** nav(val) = "val"] */
const nav = (val) => dq + val + clv;
/** naiv(attr, val, append = "") = :not([attr="val"]append) */
const naiv = (attr, val, append = "") => nai(attr) + nav(val) + append + clo;

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
const v4 = (val) => '"' + val + '"';
const isv0 = '="0"]';
const isv1 = '="1"]';
const isv2 = '="2"]';
const isv3 = '="3"]';
/** isv4(val) = ="val"] */
const isv4 = (val) => '="' + val + '"]';

// CSS variable name constant
const v = {
    supportPrefix: "--support-",
    s: function(method) { return this.supportPrefix + method; },

    scalableMethod: "--scalable-method",

    eoo: eoo
};

/** CSS support check */ 
const csc = (method) => doc.$b.css(v.s(method)) == t1;

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
        case U:
            return u;

        case "":
        case N:
            return n;

        case F:
            return f;

        case T:
            return t;
    }
};


function isKorean() { return navigator.language.indexOf("ko") > -1; }


function getUA(lowercase = true) {
    var ua = navigator.userAgent;
    if (lowercase) ua = ua.toLowerCase();
    return ua;
}


function isAndroid() {
    return getUA().indexOf("android") > -1;
}

function isAppleMobile() {
    const ua = getUA();
    return ua.indexOf("ipad") > -1 || ua.indexOf("iphone") > -1 || ua.indexOf("ipod") > -1;
}

function isSafari() {
    return ua.indexOf("safari") > -1;
}

function getIosVersion() {
    const ua = getUA();
    const matches = ua.match(/os (\d+(_\d+)+)\s/);
    if (matches != null) {
        const raw = matches[1];
        return raw != null ? raw.replace(/_/g, ".") : null;
    } else return null;
}



/**
 * User Experience constants and static functions
 */
class EUX {

    static setOnImagesFullyLoaded(callback = () => {}, debug = false) {
        Promise.all(Array.from(document.images).map(img => {
            if (img.complete)
                return Promise.resolve(img.naturalHeight !== 0);
            return new Promise(resolve => {
                img.addEventListener('load', () => resolve(true));
                img.addEventListener('error', () => resolve(false));
            });
        })).then(results => {
            if (debug) {
                if (results.every(res => res)) console.log('all images loaded successfully');
                else console.log('some images failed to load, all finished loading');
            }

            callback();
        });
    }

}



/**
 * Common calendar methods
 */
const Ecal = {

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
        const beginOfNextMonth = Ecal.getBeginSundayAndWeek(firstDateOfNextMonth);
        
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

            const monthBeginSunday = Ecal.getBeginSundayAndWeek(date);
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
                const thisYear = beginDate.getFullYear();
                const thisMonth = beginDate.getMonth();
                const thisWeek = this.getYearMonthWeek(thisYear, thisMonth, beginDate.getDate() - 14).week + 2;
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

    getDateSetNearPosition(criteria, offset = 0, unit = "day") {
        if (unit == null) return null;
        else return this.getDateSet(this.getNearPosition(criteria, offset, unit));
    },

    getDateOffset(year, month0, date) {
        if (year instanceof Date) date = new Date(year.getFullYear(), year.getMonth(), year.getDate());
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

    getDayText(date) {
        switch(date instanceof Date ? date.getDay() : date) {
            case 0:
                return "일";
            case 1:
                return "월";
            case 2:
                return "화";
            case 3:
                return "수";
            case 4:
                return "목";
            case 5:
                return "금";
            case 6:
                return "토";
        }
        return "";
    },

    getDayTextDay(date, suffix) {
        if (suffix == null) suffix = "요일";
        return this.getDayText(date) + suffix;
    },

    getDateSet(date = new Date()) {
        return {
            ymw: this.getYearMonthWeek(date),
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            month0: date.getMonth(),
            week: this.getWeek(date),
            date: date.getDate(),
            day: date.getDay(),
            dayText: this.getDayText(date),
            time: date.getTime(),
            dateOrigin: new Date(date),
        }
    },


    eoo
};


/**
 * Common scheduler methods
 */
const Escd = {

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

    getBoundBy(offset, bound, scope) {
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

    parseBound(bound, scope) {
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
                var day = Ecal.getDayText(new Date(year, month - 1, date));
                return { year: year, month: month, month0: month - 1, date: date, day: day };
        }
    },


    eoo
};
