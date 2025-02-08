/*

MIT License

Copyright (c) 2023 Esterkxz (Ester1 / 에스터1z)

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

// JSON Characterized Object Data Definition //
//
// The JSON based lite code format
//
// v0.6 / release 2025.02.07
//
// Take to be liten from JSON code to smaller converted characters for like as BASE64.
//
//
// :: Code regulations
//
// 1. null is n, true is t, false is f.
// 2. No space and carriage return & line feed on code. Only allowed in data.
// 3. Omit "" variable definition.

let Jcodd = {

    /**
     * Characterize JSON
     * 
     * @param {string} json 
     * 
     * @returns {string} jcodd
     */
    toCodd: function (json) {
        var ex;
        //Get clean json
        let p1 = JSON.stringify(JSON.parse(json));
        //Convert null to n
        let p2 = p1.replace(/([\[\,\:])null([\]\,\}])/g, "$1n$2").replace(/([\[\,\:])null([\]\,\}])/g, "$1n$2");
        //Convert true to t
        let p3 = p2.replace(/([\[\,\:])true([\]\,\}])/g, "$1t$2").replace(/([\[\,\:])true([\]\,\}])/g, "$1t$2");
        //Convert false to f
        let p4 = p3.replace(/([\[\,\:])false([\]\,\}])/g, "$1f$2").replace(/([\[\,\:])false([\]\,\}])/g, "$1f$2");
        //Rem4ve ""
        let p5 = p4.replace(/([\{\,])\"([^\"]*)\"\:/g, "$1$2:");
        //Check convert unicode
        if (p5.match(/[\u0000-\u001F|\u0080-\uFFFF]/g) != null) {
            let p6 = this.escape(p5);
            ex = p6;
        } else ex = p5;

        // console.log(p1);
        // console.log(p2);
        // console.log(p3);
        // console.log(ex);

        return ex;
    },

    /**
     * Convert object to JCODD directly
     * 
     * @param {object} obj 
     * 
     * @returns {string} JCODD
     */
    coddify: function (obj) {
        let json = JSON.stringify(obj);

        return this.toCodd(json);
    },

    /**
     * Parse JCODD to JSON
     * 
     * @param {string} codd 
     * 
     * @return {string} json
     */
    toJson: function (codd) {
        //unescape
        let p1 = this.unescape(codd);//unescape(codd);//=> deprecated
        //Assign ""
        let p2 = p1.replace(/(\{|\}\,|\]\,|\"\,|[eE]?[+\-]?[\d.]+\,|[ntf]\,|true\,|false\,)([^\"\{\}\[\]\,\:]*)\:/g, '$1"$2":');
        //Convert n to null
        let p3 = p2.replace(/([\[\,\:])n([\]\,\}])/g, "$1null$2").replace(/([\[\,\:])n([\]\,\}])/g, "$1null$2");
        //Convert t to true
        let p4 = p3.replace(/([\[\,\:])t([\]\,\}])/g, "$1true$2").replace(/([\[\,\:])t([\]\,\}])/g, "$1true$2");
        //Convert f to false
        let p5 = p4.replace(/([\[\,\:])f([\]\,\}])/g, "$1false$2").replace(/([\[\,\:])f([\]\,\}])/g, "$1false$2");

        return p5;
    },

    /**
     * Convert JCODD to object directly
     * 
     * @param {string} codd 
     * 
     * @returns {*} object
     */
    parse: function (codd) {
        let json = this.toJson(codd);

        return JSON.parse(json);
    },

    /**
     * Return to be escaped unicode character from char code
     * 
     * @param {Integer} cc  Char Code
     * 
     * @returns {String} unescaped
     */
    esc: function (cc) {
        if (cc < 0x20 || cc > 0x7e) {
            let x16 = cc.toString(16);
            var ex;
            if (x16.length > 2) ex = "%u" + x16.padStart(4, '0').toUpperCase();
            else ex = "%" + x16.padStart(2, '0').toUpperCase();
            return ex;
        } else return String.fromCharCode(cc);
    },

    /**
     * Return to be escaped unicode characters in string
     * 
     * @param {String} str
     * 
     * @returns {String} unescaped
     */
    escape: function (str) {
        var escaped = "";
        for (var i=0; i<str.length; i++) {
            escaped += this.esc(str.charCodeAt(i));
        }
        return escaped;
    },

    /**
     * Return to be unescaped unicode characters in string
     * 
     * @param {String} str
     * 
     * @returns {String} escaped
     */
    unescape: function (str) {
        return str.replace(/%u([\dA-F]{4})/gi, (match, block) => 
            String.fromCharCode(parseInt(block, 16))
        );
    },
}

let JCODD = function(jcodd) {
    return Jcodd.parse(jcodd);
}
