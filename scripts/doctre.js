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

// DOCTRE.js - Document Object Cold Taste Refrigeration Effortlessness //
// 
// Cold(array object) assigning of HTML Tree for make to JSON string.
// 
// v0.15 / release 2025.10.17
// 
// cold = [] - Cold HTML child node list
// cold[0] - Tag name, classes, id, name, type = "tag.class1.class2#id@name$type" : string
// cold[1] - Content data = cold HCNL : Array / text or html codes or empty: string / node list : NodeList / element : Element / node : Node
// cold[2] - Style codes : string / styles : object
// cold[3] - Extra attributes : object
// cold[4] - Data attributes : object
//
//
// frost = '[["div.box.float#app@root", null], "text node or html code"]'
// 
// Match replace
// ex) Doctre.parse([["|tag|.|classes|#|id|", "empty content"], "|divider|"], { tag: () => isInline ? "span" | "div", classes: "test fixed", id: getId(), divider: it => '<hr class="' + it + '" />' })

class Doctre {

    static extractTagName(solidId) {
        let tagName, majorAttrs;
        if (typeof solidId == "string") {
            const tagFilter = /^[\w:-]+/;
            tagName = tagFilter.exec(solidId)[0];
            majorAttrs = solidId.replace(tagFilter, "");
        } else {
            tagName = solidId.tagName;
            delete solidId.tagName;
            majorAttrs = solidId;
        }
        return [tagName, majorAttrs];
    }

    static extractMajorAttrs(majorAttrs, to = {}) {
        const process = (string, divider, attrName) => {
            const filter = new RegExp(divider + "[\\w.-]*");
            const match = filter.exec(string);
            if (match != null) {
                to[attrName] = match[0].replace(new RegExp("^" + divider), "");
                return string.replace(filter, "");
            } else return string;
        };
        const classIdName = process(majorAttrs, "\\$", "type");
        const classId = process(classIdName, "@", "name");
        const classes = process(classId, "#", "id");
        if (classes.length > 0) to["class"] = classes === "." ? "" : classes.replace(/^\./, "").replace(/\./g, " ").replace(/\s+/g, " ").replace(/[^\w\s-]/g, "");
        return to;
    }

    static extractTagAndMajorAttrs(solidId) {
        const [tagName, majorAttrs] = this.extractTagName(solidId);
        return this.extractMajorAttrs(majorAttrs, { tagName });
    }


    static createElement(tagName = "template", majorAttrs, contentData, style = {}, attrs = {}, datas = {}, matchReplacer = {}) {
        if (tagName instanceof Array) return this.createElement(...tagName);

        const element = document.createElement(this.matchReplace(tagName, matchReplacer));
        if (majorAttrs != null) {
            const extracted = typeof majorAttrs == "string" ? this.extractMajorAttrs(majorAttrs) : majorAttrs;
            for (const attrName in extracted) element.setAttribute(this.matchReplace(attrName, matchReplacer), this.matchReplace(extracted[attrName], matchReplacer));
        }
        if (attrs != null) for (let [key, value] of Object.entries(attrs)) {
            key = this.matchReplace(key, matchReplacer);
            value = this.matchReplace(value, matchReplacer);

            switch (key) {
                case "id":
                case "name":
                case "type":
                case "class":
                case "style":
                    break;

                default:
                    element.setAttribute(key, value);
                    break;
            }
        }
        if (datas != null) for (const [key, value] of Object.entries(datas)) element.dataset[this.matchReplace(key)] = this.matchReplace(value);//Object.assign(element.dataset, datas);//
        if (contentData != null) switch (typeof contentData) {
            case "string":
                element.innerHTML = this.matchReplace(contentData, matchReplacer);
                break;

            default:
                if (contentData instanceof Array) element.append(this.createFragment(contentData, matchReplacer));
                else if (contentData instanceof NodeList) for (const node of contentData) element.appendChild(node);
                else if (contentData instanceof Node) element.appendChild(contentData);
                else if (contentData instanceof Doctre) element.appendChild(contentData.fresh(matchReplacer));
                else element.append(contentData);
                break;
        };
        if (style != null) {
            if (typeof style == "string") element.setAttribute("style", this.matchReplace(style, matchReplacer));
            else for (const [key, value] of Object.entries(style)) {
                if (key.includes("-")) element.style.setProperty(this.matchReplace(key), this.matchReplace(value));
                else Object.assign(element.style, style);
            }
        }
        return element;
    }

    static createElementReplaced(matchReplacer, tagName, majorAttrs, contentData, style = {}, attrs = {}, datas = {}, matchReplacerOrigin = {}) {
        return this.createElement(tagName, majorAttrs, contentData, style, attrs, datas, matchReplacer ?? matchReplacerOrigin);
    }

    static createElementBy(solidId, contentData, style = {}, attrs = {}, datas = {}, matchReplacer = {}) {
        if (solidId instanceof Array) return this.createElementBy(...solidId);

        let [tagName, majorAttrs] = this.extractTagName(this.matchReplace(solidId, matchReplacer));
        return this.createElement(tagName, majorAttrs, contentData, style, attrs, datas, matchReplacer);
    }

    static createElementReplacedBy(matchReplacer, solidId, contentData, style = {}, attrs = {}, datas = {}, matchReplacerOrigin = {}) {
        return this.createElementBy(solidId, contentData, style, attrs, datas, matchReplacer ?? matchReplacerOrigin);
    }

    static createFragment(hcnlArray, matchReplacer = {}) {
        const df = document.createDocumentFragment();
        for (const val of hcnlArray) switch (typeof val) {
            case "string": 
                const tmp = this.createElement();
                tmp.innerHTML = this.matchReplace(val, matchReplacer);
                const childNodes = tmp.content.childNodes;
                while (childNodes.length > 0) df.appendChild(childNodes[0]);
                break;

            case "object":
            default:
                if (val instanceof Node) df.appendChild(val);
                else if (val instanceof Doctre) df.appendChild(val.fresh(matchReplacer));
                else if (val instanceof Array) df.append(this.createElementReplacedBy(matchReplacer, val));
                else df.append(val);
                break;
        };
        return df;
    }

    static get userAgent() { return navigator?.userAgent ?? ""; }
    static get isRequiredEscape() {
        const userAgent = this.userAgent;
        return userAgent != "" && (userAgent.includes("iPad") || userAgent.includes("iPhone") || userAgent.includes("iPod") || (userAgent.includes("Macintosh") && !userAgent.includes("Chrome") && !userAgent.includes("Firefox") && !userAgent.includes("Edge") && !userAgent.includes("Opera")));
    }
    static crashBroker(jsonContent) {
        if (this.isRequiredEscape) jsonContent = jsonContent.replace(/\r\n/gm, "\\r\\n").replace(/\n\r/gm, "\\n\\r").replace(/\r/gm, "\\r").replace(/\n/gm, "\\n").replace(/\t/g, "\\t");
        return jsonContent;
    }

    static matchReplace(frostOrString, matchReplacer = {}) {
        if (typeof frostOrString != "string") return this.matchReplaceObject(frostOrString, matchReplacer);

        if (matchReplacer != null) {
            for (const key in matchReplacer) {
                let replacer = matchReplacer[key];
                const regex = new RegExp("\\|" + key + "\\|", "g");
                if (replacer == null) {
                    if (matchReplacer.dataPlaceholder == null) continue;
                    else replacer = matchReplacer.dataPlaceholder;
                }
                let forReplaced;
                switch (typeof replacer) {
                    case "string":
                        forReplaced = replacer;
                        break;
                    case "function":
                        forReplaced = replacer(key);
                        break;
                    case "object":
                        forReplaced = JSON.stringify(replacer);
                        break;
                    default:
                        forReplaced = "" + replacer;
                        break;
                }
                frostOrString = frostOrString.replace(regex, this.crashBroker(forReplaced));
            }
            if (matchReplacer.coverReplaceable && matchReplacer.dataPlaceholder != null) {
                const replacer = matchReplacer.dataPlaceholder;
                const regex = /\|([^\|]+)\|/g;
                const matches = frostOrString.match(regex);
                if (matches != null) {
                    for (const match of matches) {
                        let forReplaced;
                        switch (typeof replacer) {
                            case "string":
                                forReplaced = replacer;
                                break;
                            case "function":
                                forReplaced = replacer(match);
                                break;
                            case "object":
                                forReplaced = JSON.stringify(replacer);
                                break;
                            default:
                                forReplaced = "" + replacer;
                                break;
                        }
                        frostOrString = frostOrString.replace(match, this.crashBroker(forReplaced));
                    }
                }
            }
        }
        return frostOrString;
    }

    static matchReplaceObject(object, matchReplacer = {}) {
        const replaced = object.constructor();
        for (const key in object) replaced[this.matchReplace(key, matchReplacer)] = this.matchReplace(object[key], matchReplacer);
        return replaced;
    }

    static parse(frost, matchReplacer = {}) {
        frost = this.crashBroker(frost);
        const trimmedFrost = frost.trim();
        if (trimmedFrost.startsWith("[['") || trimmedFrost.startsWith("['")) frost = frost.replace(/\'/g, '"');
        const replaced = this.matchReplace(frost, matchReplacer);
        let parsed;
        try {
            parsed = JSON.parse(replaced);
        } catch (error) {
            try {
                parsed = this.matchReplaceObject(JSON.parse(frost), matchReplacer);
            } catch (error) {
                console.error("Doctre.parse - Frozen JSON parse error: ", error);
            }
        }
        return this.createFragment(parsed);
    }

    static live(frostOrCold, matchReplacer = {}) {
        if (typeof frostOrCold == "string") return this.parse(frostOrCold, matchReplacer);
        else return this.createFragment(frostOrCold);
    }

    static takeOut(frostOrCold, matchReplacer = {}) {
        const element = this.createElement();
        element.append(this.live(frostOrCold, matchReplacer));
        return element;
    }


    static getSolidId(tagName, className, id, name, type) {
        let solidId = tagName;
        if (className != null) solidId += "." + className.replace(/ /g, ".");
        if (id != null) solidId += "#" + id;
        if (name != null) solidId += "@" + name;
        if (type != null) solidId += "$" + type;
        return solidId;
    }

    static packTagAndMajorAttrs(element, asSolidId = false) {
        const tagName = element.tagName.toLowerCase();
        const className = element.getAttribute("class");
        const id = element.getAttribute("id");
        const name = element.getAttribute("name");
        const type = element.getAttribute("type");

        if (asSolidId) return this.getSolidId(tagName, className, id, name, type);
        else {
            const extracted = { tagName };
            if (className != null) extracted["class"] = className;
            if (id != null) extracted["id"] = id;
            if (name != null) extracted["name"] = name;
            if (type != null) extracted["type"] = type;
            return extracted;
        }
    }

    static getStyleObject(style) {
        const styles = {};
        const divided = style.split(";");
        for (var item of divided) {
            let [key, value] = item.split(":");
            key = key.trim();
            if (key == "") continue;
            value = value.trim();
            if (key && value) styles[key] = value;
        }
        return styles;
    }

    static packAttributes(attrs) {
        const pack = {};
        for (const attr of attrs) {
            const name = attr.name;
            switch (name) {
                case "id":
                case "name":
                case "type":
                case "class":
                case "style":
                    break;
                
                default:
                    if (!name.startsWith("data-")) pack[name] = attr.value;
                    break;
            }
        }
        return pack;
    }

    static getDataObject(dataset) {
        const datas = {};
        for (const key in dataset) datas[key] = dataset[key];
        return datas;
    }
    

    static trimHecp(hecp) {
        for (var i = hecp.length - 1; i > 0; i--) {
            if (hecp[i] == null) delete hecp[i];
            else if (typeof hecp[i] == "string" || hecp[i] instanceof Array) {
                if (hecp[i].length == 0) hecp.pop();
                else break;
            } else {
                const count = Object.keys(hecp[i]).length;
                if (count == 0) hecp.pop();
                else break;
            }
        }
        return hecp;
    }

    static frostElement(element, trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        const frozen = [];
        frozen.push(this.packTagAndMajorAttrs(element, !elementAsDoctre));
        frozen.push(this.coldify(element.childNodes, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre));
        const style = element.getAttribute("style");
        if (styleToObject && style != null) frozen.push(this.getStyleObject(style));
        else frozen.push(style ?? {});
        frozen.push(this.packAttributes(element.attributes));
        frozen.push(this.getDataObject(element.dataset));
        return trimHecp ? this.trimHecp(frozen) : frozen;
    }

    static trimTextIndent(text, trimIndent = false) {
        return text.split("\n").map(line => {
            let std = line.trimStart();
            if (!trimIndent && std.length != line.length) std = " " + std;
            let etd = std.trimEnd();
            if (!trimIndent && etd.lenth != std.length) etd += " ";
            return etd;
        }).join("\n");
    }

    static frostNode(node, trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        if (node instanceof Doctre) return elementAsDoctre ? node : node.frost(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
        else if (node instanceof DocumentFragment) return this.coldify(node.childNodes, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
        else if (node instanceof Element) return this.frostElement(node, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
        else if (node instanceof Array) return elementAsDoctre ? new Doctre(...node) : (trimHecp ? this.trimHecp(node) : node);
        else {
            const textValue = typeof node == "string" ? node : (node.nodeName == "#comment" ? "<!--" + node.nodeValue + "-->" : node.nodeValue);
            return trimIndent ? this.trimTextIndent(textValue, trimIndent) : textValue;
        }
    }

    static coldify(nodeOrList, trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        if (typeof nodeOrList == "string") return this.coldify([nodeOrList], trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);

        const cold = [];
        if (nodeOrList instanceof Doctre) cold.push(elementAsDoctre ? nodeOrList : nodeOrList.frost(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre));
        else if (nodeOrList instanceof Node) cold.push(this.frostNode(nodeOrList, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre));
        else for (const node of nodeOrList) {
            let frozen = this.frostNode(node, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
            if (!trimBobbleNode || typeof frozen != "string" || frozen.replace(/[\s\t\v\r\n]+/g, "").length > 0) cold.push(frozen);
        }
        return cold;
    }

    static stringify(nodeOrListOrCold, prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        const cold = this.coldify(nodeOrListOrCold, trimBobbleNode, trimHecp, styleToObject, trimIndent, false);

        if (prettyJson == null || prettyJson === false) return JSON.stringify(cold);
        else return JSON.stringify(cold, null, typeof prettyJson == "number" ? prettyJson : 2);
    }


    static patch() {
        const attach = (cls, name, value) => Object.defineProperty(cls.prototype, name, { value, writable: true, configurable: true, enumerable: false });
        const attachGS = (cls, name, getter, setter) => Object.defineProperty(cls.prototype, name, { getter, setter, configurable: true, enumerable: false });

        attach(NodeList, "coldify", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return Doctre.coldify(this, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
        attach(NodeList, "stringify", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return Doctre.stringify(this, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });

        attach(Node, "coldify", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return Doctre.coldify(this, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
        attach(Node, "coldified", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { const cold = this.coldify(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); this.remove(); return cold; });

        attach(Node, "stringify", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return Doctre.stringify(this, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });
        attach(Node, "stringified", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { const frost = this.stringify(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); this.remove(); return frost; });

        if (typeof jQuery != "undefined") {
            attach(jQuery, "coldify", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return Doctre.coldify(this, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
            attach(jQuery, "coldified", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { const cold = this.coldify(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); this.remove(); return cold; });

            attach(jQuery, "stringify", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return Doctre.stringify(this, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });
            attach(jQuery, "stringified", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { const frost = this.stringify(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); this.remove(); return frost; });
        }

        attach(Element, "cold", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return this.childNodes.coldify(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
        attach(Element, "takeCold", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { const cold = this.cold(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); this.innerHTML = ""; return cold; });

        attach(Element, "frozen", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return this.childNodes.stringify(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });
        attach(Element, "takeFrozen", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { const frozen = this.frozen(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); this.innerHTML = ""; return frozen; });

        attach(Element, "alive", function (frostOrCold, matchReplacer = {}) { const live = Doctre.live(frostOrCold, matchReplacer); const nodeArray = live == null ? null : NodeArray.box(live); if (live != null) this.append(live); return nodeArray; });
        attach(Element, "alone", function (frostOrCold, matchReplacer = {}) { this.innerHTML = ""; return this.alive(frostOrCold, matchReplacer); });

        attach(Element, "freeze", function (dataName = "frozen", trimBobbleNode = true) { this.dataset[dataName] = this.childNodes.stringify(false, trimBobbleNode); return this; });
        attach(Element, "solid", function (dataName = "frozen", trimBobbleNode = true) { this.freeze(dataName, trimBobbleNode); this.innerHTML = ""; return this; });

        attach(Element, "hot", function (matchReplacer = {}, dataName = "frozen") { const frozen = this.dataset[dataName]; return frozen == null || frozen.trim().length < 2 ? null : Doctre.live(frozen, matchReplacer); });
        attach(Element, "worm", function (matchReplacer = {}, dataName = "frozen") { const live = this.hot(matchReplacer, dataName); const nodeArray = live == null ? null : NodeArray.box(live); if (live != null) this.append(live); return nodeArray; });
        attach(Element, "melt", function (matchReplacer = {}, dataName = "frozen") { this.innerHTML = ""; return this.worm(matchReplacer, dataName); });

        attach(Element, "burn", function (matchReplacer = {}, dataName = "frozen") { const live = this.hot(matchReplacer, dataName); delete this.dataset.frozen; return live; });
        attach(Element, "wormOut", function (matchReplacer = {}, dataName = "frozen") { const nodeArray = this.worm(frozen, matchReplacer); delete this.dataset.frozen; return nodeArray; });
        attach(Element, "meltOut", function (matchReplacer = {}, dataName = "frozen") { this.innerHTML = ""; return this.wormOut(matchReplacer, dataName); });
    }


    tagName;

    classes;

    id;
    name;
    type;

    childDoctres;

    style;
    attrs;
    datas;

    matchReplacer;

    constructor(solidIdOrExtracted, contentData, style = {}, attrs = {}, datas = {}, matchReplacer = {}) {
        if (solidIdOrExtracted instanceof Array) {
            solidIdOrExtracted = solidIdOrExtracted[0];
            contentData = solidIdOrExtracted[1];
            style = solidIdOrExtracted[2];
            attrs = solidIdOrExtracted[3];
            datas = solidIdOrExtracted[4];
            matchReplacer = solidIdOrExtracted[5];
        }

        if (solidIdOrExtracted != null) {
            const extracted = typeof solidIdOrExtracted == "string" ? Doctre.extractTagAndMajorAttrs(solidIdOrExtracted) : solidIdOrExtracted;
            this.tagName = extracted.tagName;
            this.classes = extracted.class?.split(" ") ?? [];
            this.id = extracted.id;
            this.name = extracted.name;
            this.type = extracted.type;
        } else {
            this.tagName = "tamplate";
            this.classes = [];
        }

        if (contentData != null) this.childDoctres = Doctre.coldify(contentData, true, false, true);
        else this.contentDoctres = [];

        this.style = style ?? {};
        this.attrs = attrs ?? {};
        this.datas = datas ?? {};
        this.matchReplacer = matchReplacer ?? {};
    }

    get className() { return this.classes.join(" "); }
    set className(value) { this.classes = value.split(" "); }

    get majorAttrs() { return {
        class: this.className,
        id: this.id,
        name: this.name,
        type: this.type,
    }; }

    get solidId() { return Doctre.getSolidId(this.tagName, this.className, this.id, this.name, this.type); }


    get live() { return Doctre.createElement(this.tagName, this.majorAttrs, this.childDoctres, this.style, this.attrs, this.datas); }

    fresh(matchReplacer) { return Doctre.createElement(this.tagName, this.majorAttrs, this.childDoctres, this.style, this.attrs, this.datas, matchReplacer ?? this.matchReplacer ?? {}); }

    frost(trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        const hecp = [[this.solidId, this.cold(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre), this.style, this.attrs, this.datas]];
        return trimHecp ? Doctre.trimHecp(hecp) : hecp;
    }

    get icy() { return this.frost(false, true, false, false); }

    toString(prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        const hecp = this.frost(trimBobbleNode, trimHecp, styleToObject, trimIndent, false);
        if (prettyJson == null || prettyJson === false) return JSON.stringify(hecp);
        return JSON.stringify(hecp, null, typeof prettyJson == "number" ? prettyJson : 2);
    }



    get chill() { return Doctre.createFragment(this.childDoctres); }

    cold(trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        return Doctre.coldify(this.childDoctres, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
    }

    frozen(prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        return Doctre.stringify(this.childDoctres, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent);
    }
}

class NodeArray extends Array {

    static box(fragmentOrNodeList, into = new NodeArray()) {
        const nodeList = fragmentOrNodeList instanceof DocumentFragment ? fragmentOrNodeList.childNodes : fragmentOrNodeList;
        for (const node of nodeList) into.push(node); 
        return into;
    }

}
