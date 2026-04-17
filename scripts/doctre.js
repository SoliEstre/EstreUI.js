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
// v1.1.1 / release 2026.02.20
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

/**
 * Document Object Cold Taste Refrigeration Effortlessness — DOM 직렬화/역직렬화 엔진.
 * cold(배열 객체)와 frost(JSON 문자열) 포맷으로 HTML 트리를 보존·복원한다.
 *
 * **cold 포맷**: `[solidId, contentData, style, attrs, datas]`
 * - `solidId`: `"tag.class1.class2#id@name$type"` 문자열 또는 추출 객체
 * - `contentData`: cold 배열 / 텍스트 문자열 / NodeList / Element / Node
 * - `style`: 스타일 문자열 또는 객체
 * - `attrs`: 일반 속성 객체
 * - `datas`: data-* 속성 객체
 *
 * **frost 포맷**: cold를 JSON.stringify한 문자열
 *
 * **matchReplace**: `|key|` 토큰을 matchReplacer 객체의 값으로 치환
 * @class
 */
class Doctre {

    /**
     * solidId 문자열에서 태그명과 나머지 주요 속성 부분을 분리한다.
     * @param {string|Object} solidId - solidId 문자열 또는 `{ tagName, ... }` 객체.
     * @returns {[string, string|Object]} `[tagName, majorAttrs]` 튜플.
     */
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

    /**
     * solidId의 주요 속성 부분(`.class#id@name$type`)을 파싱하여 객체로 반환한다.
     * @param {string} majorAttrs - 주요 속성 문자열.
     * @param {Object} [to={}] - 결과를 저장할 객체.
     * @returns {Object} `{ class?, id?, name?, type? }` 속성 객체.
     */
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

    /**
     * solidId에서 태그명과 주요 속성을 모두 추출한다.
     * @param {string} solidId - solidId 문자열.
     * @returns {Object} `{ tagName, class?, id?, name?, type? }`.
     */
    static extractTagAndMajorAttrs(solidId) {
        const [tagName, majorAttrs] = this.extractTagName(solidId);
        return this.extractMajorAttrs(majorAttrs, { tagName });
    }


    /**
     * cold 파라미터로 DOM 엘리먼트를 생성한다.
     * @param {string|Array} [tagName="template"] - 태그명 또는 cold 배열.
     * @param {string|Object} [majorAttrs] - 주요 속성 문자열/객체.
     * @param {string|Array|NodeList|Node|Doctre|null} [contentData] - 자식 콘텐츠.
     * @param {string|Object} [style={}] - 스타일.
     * @param {Object} [attrs={}] - 일반 속성.
     * @param {Object} [datas={}] - data-* 속성.
     * @param {Object} [matchReplacer={}] - `|key|` 토큰 치환 맵.
     * @returns {Element} 생성된 DOM 엘리먼트.
     */
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

    /**
     * matchReplacer를 첫 번째 인자로 받는 createElement 변형.
     * @param {Object} matchReplacer - 토큰 치환 맵.
     * @param {string} tagName - 태그명.
     * @param {string|Object} [majorAttrs] - 주요 속성.
     * @param {*} [contentData] - 자식 콘텐츠.
     * @param {string|Object} [style={}] - 스타일.
     * @param {Object} [attrs={}] - 일반 속성.
     * @param {Object} [datas={}] - data-* 속성.
     * @param {Object} [matchReplacerOrigin={}] - matchReplacer가 null일 때의 폴백.
     * @returns {Element}
     */
    static createElementReplaced(matchReplacer, tagName, majorAttrs, contentData, style = {}, attrs = {}, datas = {}, matchReplacerOrigin = {}) {
        return this.createElement(tagName, majorAttrs, contentData, style, attrs, datas, matchReplacer ?? matchReplacerOrigin);
    }

    /**
     * solidId 문자열로 엘리먼트를 생성한다. solidId에서 tagName과 majorAttrs를 자동 추출.
     * @param {string|Array} solidId - solidId 문자열 또는 배열.
     * @param {*} [contentData] - 자식 콘텐츠.
     * @param {string|Object} [style={}] - 스타일.
     * @param {Object} [attrs={}] - 일반 속성.
     * @param {Object} [datas={}] - data-* 속성.
     * @param {Object} [matchReplacer={}] - 토큰 치환 맵.
     * @returns {Element}
     */
    static createElementBy(solidId, contentData, style = {}, attrs = {}, datas = {}, matchReplacer = {}) {
        if (solidId instanceof Array) return this.createElementBy(...solidId);

        let [tagName, majorAttrs] = this.extractTagName(this.matchReplace(solidId, matchReplacer));
        return this.createElement(tagName, majorAttrs, contentData, style, attrs, datas, matchReplacer);
    }

    /**
     * matchReplacer를 첫 번째 인자로 받는 createElementBy 변형.
     * @param {Object} matchReplacer - 토큰 치환 맵.
     * @param {string} solidId - solidId 문자열.
     * @param {*} [contentData] - 자식 콘텐츠.
     * @param {string|Object} [style={}] - 스타일.
     * @param {Object} [attrs={}] - 일반 속성.
     * @param {Object} [datas={}] - data-* 속성.
     * @param {Object} [matchReplacerOrigin={}] - 폴백 치환 맵.
     * @returns {Element}
     */
    static createElementReplacedBy(matchReplacer, solidId, contentData, style = {}, attrs = {}, datas = {}, matchReplacerOrigin = {}) {
        return this.createElementBy(solidId, contentData, style, attrs, datas, matchReplacer ?? matchReplacerOrigin);
    }

    /**
     * cold 배열(HCNL)로 DocumentFragment를 생성한다.
     * @param {Array} hcnlArray - HTML Cold Node List 배열.
     * @param {Object} [matchReplacer={}] - 토큰 치환 맵.
     * @returns {DocumentFragment}
     */
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

    /** @type {string} 현재 User-Agent 문자열. */
    static get userAgent() { return navigator?.userAgent ?? ""; }
    /** @type {boolean} Safari/iOS에서 개행·탭 이스케이프가 필요한지 여부. */
    static get isRequiredEscape() {
        const userAgent = this.userAgent;
        return userAgent != "" && (userAgent.includes("iPad") || userAgent.includes("iPhone") || userAgent.includes("iPod") || (userAgent.includes("Macintosh") && !userAgent.includes("Chrome") && !userAgent.includes("Firefox") && !userAgent.includes("Edge") && !userAgent.includes("Opera")));
    }
    /**
     * Safari 호환을 위해 JSON 문자열의 개행·탭을 이스케이프한다.
     * @param {string} jsonContent - JSON 문자열.
     * @returns {string} 이스케이프된 문자열 (Safari 외에서는 그대로 반환).
     */
    static crashBroker(jsonContent) {
        if (this.isRequiredEscape) jsonContent = jsonContent.replace(/\r\n/gm, "\\r\\n").replace(/\n\r/gm, "\\n\\r").replace(/\r/gm, "\\r").replace(/\n/gm, "\\n").replace(/\t/g, "\\t");
        return jsonContent;
    }

    /**
     * 객체에서 원시 타입(primitive) 값만 복사한다. 순환 참조 회피용.
     * @param {Object} obj - 원본 객체.
     * @returns {Object} 원시 값만 포함된 새 객체.
     */
    static copyPrimitives(obj) {
        return Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== Object(v))
        );
    }

    /**
     * 문자열 내 `|key|` 토큰을 matchReplacer의 값으로 치환한다. 객체이면 matchReplaceObject로 위임.
     * @param {string|Object} frostOrString - 치환 대상 문자열 또는 객체.
     * @param {Object} [matchReplacer={}] - `{ key: value }` 치환 맵. 값은 문자열/함수/객체 가능.
     *   - `dataPlaceholder`: 매칭되지 않는 토큰의 기본 치환값.
     *   - `coverReplaceable`: true이면 dataPlaceholder로 모든 미매칭 토큰을 치환.
     * @returns {string|Object} 치환된 결과.
     */
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
                        try {
                            forReplaced = JSON.stringify(replacer);
                        } catch (error) {
                            forReplaced = JSON.stringify(this.copyPrimitives(replacer));
                        }
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
                                try {
                                    forReplaced = JSON.stringify(replacer);
                                } catch (error) {
                                    forReplaced = JSON.stringify(this.copyPrimitives(replacer));
                                }
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

    /**
     * 객체의 키와 값 모두에 matchReplace를 재귀 적용한다.
     * @param {Object} object - 치환 대상 객체.
     * @param {Object} [matchReplacer={}] - 치환 맵.
     * @returns {Object} 치환된 새 객체.
     */
    static matchReplaceObject(object, matchReplacer = {}) {
        const replaced = object.constructor();
        for (const key in object) replaced[this.matchReplace(key, matchReplacer)] = this.matchReplace(object[key], matchReplacer);
        return replaced;
    }

    /**
     * frost(JSON 문자열)를 파싱하여 DocumentFragment로 복원한다.
     * @param {string} frost - frost 포맷 JSON 문자열.
     * @param {Object} [matchReplacer={}] - 토큰 치환 맵.
     * @returns {DocumentFragment}
     */
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

    /**
     * frost(문자열) 또는 cold(배열)를 live DOM(DocumentFragment)으로 복원한다.
     * @param {string|Array} frostOrCold - frost 문자열 또는 cold 배열.
     * @param {Object} [matchReplacer={}] - 토큰 치환 맵.
     * @returns {DocumentFragment}
     */
    static live(frostOrCold, matchReplacer = {}) {
        if (typeof frostOrCold == "string") return this.parse(frostOrCold, matchReplacer);
        else return this.createFragment(frostOrCold);
    }

    /**
     * frost/cold를 template 엘리먼트로 감싸서 반환한다.
     * @param {string|Array} frostOrCold - frost 또는 cold 데이터.
     * @param {Object} [matchReplacer={}] - 토큰 치환 맵.
     * @returns {Element} 콘텐츠를 포함한 template 엘리먼트.
     */
    static takeOut(frostOrCold, matchReplacer = {}) {
        const element = this.createElement();
        element.append(this.live(frostOrCold, matchReplacer));
        return element;
    }


    /**
     * 태그명과 주요 속성으로 solidId 문자열을 조립한다.
     * @param {string} tagName - 태그명.
     * @param {string} [className] - CSS 클래스 (공백 구분).
     * @param {string} [id] - ID.
     * @param {string} [name] - name 속성.
     * @param {string} [type] - type 속성.
     * @returns {string} solidId 문자열 (예: `"div.box.float#app@root$text"`).
     */
    static getSolidId(tagName, className, id, name, type) {
        let solidId = tagName;
        if (className != null) solidId += "." + className.replace(/ /g, ".");
        if (id != null) solidId += "#" + id;
        if (name != null) solidId += "@" + name;
        if (type != null) solidId += "$" + type;
        return solidId;
    }

    /**
     * DOM 엘리먼트에서 태그명과 주요 속성(class, id, name, type)을 추출한다.
     * @param {Element} element - 대상 엘리먼트.
     * @param {boolean} [asSolidId=false] - true이면 solidId 문자열, false이면 객체로 반환.
     * @returns {string|Object} solidId 문자열 또는 `{ tagName, class?, id?, name?, type? }`.
     */
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

    /**
     * CSS style 문자열을 `{ property: value }` 객체로 파싱한다.
     * @param {string} style - 인라인 스타일 문자열.
     * @returns {Object<string, string>}
     */
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

    /**
     * NamedNodeMap에서 id/name/type/class/style/data-*를 제외한 속성을 객체로 추출한다.
     * @param {NamedNodeMap} attrs - 엘리먼트의 attributes.
     * @returns {Object<string, string>}
     */
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

    /**
     * DOMStringMap(dataset)을 일반 객체로 복사한다.
     * @param {DOMStringMap} dataset - 엘리먼트의 dataset.
     * @returns {Object<string, string>}
     */
    static getDataObject(dataset) {
        const datas = {};
        for (const key in dataset) datas[key] = dataset[key];
        return datas;
    }


    /**
     * HECP(cold 요소 배열) 끝에서 빈 항목(null, 빈 문자열, 빈 배열, 빈 객체)을 제거한다.
     * @param {Array} hecp - cold 요소 배열 `[solidId, content, style, attrs, datas]`.
     * @returns {Array} 트리밍된 배열 (원본 수정).
     */
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

    /**
     * DOM 엘리먼트를 cold 배열로 직렬화한다.
     * @param {Element} element - 대상 엘리먼트.
     * @param {boolean} [trimBobbleNode=false] - 공백만 있는 텍스트 노드 제거.
     * @param {boolean} [trimHecp=false] - 끝 빈 항목 트리밍.
     * @param {boolean} [styleToObject=!trimHecp] - 스타일을 객체로 변환.
     * @param {boolean} [trimIndent=trimHecp] - 텍스트 들여쓰기 트리밍.
     * @param {boolean} [elementAsDoctre=!trimHecp] - 자식 엘리먼트를 Doctre 인스턴스로 보존.
     * @returns {Array} cold 배열.
     */
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

    /**
     * 텍스트의 각 행 앞뒤 공백을 정리한다.
     * @param {string} text - 원본 텍스트.
     * @param {boolean} [trimIndent=false] - true이면 들여쓰기 완전 제거, false이면 단일 공백으로 축소.
     * @returns {string}
     */
    static trimTextIndent(text, trimIndent = false) {
        return text.split("\n").map(line => {
            let std = line.trimStart();
            if (!trimIndent && std.length != line.length) std = " " + std;
            let etd = std.trimEnd();
            if (!trimIndent && etd.lenth != std.length) etd += " ";
            return etd;
        }).join("\n");
    }

    /**
     * 단일 노드를 cold 포맷으로 직렬화한다. 노드 타입에 따라 분기.
     * @param {Node|Doctre|Array} node - 대상 노드.
     * @param {boolean} [trimBobbleNode=false] - 공백 텍스트 노드 제거.
     * @param {boolean} [trimHecp=false] - 끝 빈 항목 트리밍.
     * @param {boolean} [styleToObject=!trimHecp] - 스타일을 객체로 변환.
     * @param {boolean} [trimIndent=trimHecp] - 텍스트 들여쓰기 트리밍.
     * @param {boolean} [elementAsDoctre=!trimHecp] - 자식 엘리먼트를 Doctre로 보존.
     * @returns {Array|Doctre|string} cold 배열, Doctre 인스턴스, 또는 텍스트 문자열.
     */
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

    /**
     * 노드 또는 노드 리스트를 cold 배열로 직렬화한다.
     * @param {Node|NodeList|Doctre|string} nodeOrList - 대상 노드/리스트.
     * @param {boolean} [trimBobbleNode=false] - 공백 텍스트 노드 제거.
     * @param {boolean} [trimHecp=false] - 끝 빈 항목 트리밍.
     * @param {boolean} [styleToObject=!trimHecp] - 스타일을 객체로 변환.
     * @param {boolean} [trimIndent=trimHecp] - 텍스트 들여쓰기 트리밍.
     * @param {boolean} [elementAsDoctre=!trimHecp] - 자식 엘리먼트를 Doctre로 보존.
     * @returns {Array} cold 배열.
     */
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

    /**
     * 노드/리스트/cold를 frost(JSON 문자열)로 직렬화한다.
     * @param {Node|NodeList|Array} nodeOrListOrCold - 대상.
     * @param {boolean|number} [prettyJson=false] - true 또는 들여쓰기 수(숫자)이면 정렬된 JSON.
     * @param {boolean} [trimBobbleNode=false] - 공백 텍스트 노드 제거.
     * @param {boolean} [trimHecp=true] - 끝 빈 항목 트리밍.
     * @param {boolean} [styleToObject=!trimHecp] - 스타일을 객체로 변환.
     * @param {boolean} [trimIndent=trimHecp] - 텍스트 들여쓰기 트리밍.
     * @returns {string} frost JSON 문자열.
     */
    static stringify(nodeOrListOrCold, prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        const cold = this.coldify(nodeOrListOrCold, trimBobbleNode, trimHecp, styleToObject, trimIndent, false);

        if (prettyJson == null || prettyJson === false) return JSON.stringify(cold);
        else return JSON.stringify(cold, null, typeof prettyJson == "number" ? prettyJson : 2);
    }


    /**
     * Node, NodeList, Element, jQuery 프로토타입에 Doctre 편의 메서드를 주입한다.
     *
     * **NodeList/Node**: `coldify`, `coldified`, `stringify`, `stringified`
     * **Element**: `cold`, `takeCold`, `frozen`, `takeFrozen`,
     *   `alive`(append), `alone`(replace+append),
     *   `freeze`(→data-frozen), `solid`(freeze+clear),
     *   `hot`(data-frozen→fragment), `worm`(hot+append), `melt`(clear+worm),
     *   `burn`(hot+delete data), `wormOut`(worm+delete), `meltOut`(clear+wormOut)
     * **jQuery**: `coldify`, `coldified`, `stringify`, `stringified` (jQuery가 있을 때만)
     */
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


    /** @type {string} 태그명. */
    tagName;
    /** @type {string[]} CSS 클래스 배열. */
    classes;
    /** @type {string|undefined} ID. */
    id;
    /** @type {string|undefined} name 속성. */
    name;
    /** @type {string|undefined} type 속성. */
    type;
    /** @type {Array} 자식 cold 배열 (Doctre 인스턴스 또는 문자열). */
    childDoctres;
    /** @type {string|Object} 스타일. */
    style;
    /** @type {Object} 일반 속성. */
    attrs;
    /** @type {Object} data-* 속성. */
    datas;
    /** @type {Object} 기본 토큰 치환 맵. */
    matchReplacer;

    /**
     * @param {string|Object|Array} [solidIdOrExtracted] - solidId 문자열, 추출 객체, 또는 cold 배열.
     * @param {*} [contentData] - 자식 콘텐츠.
     * @param {string|Object} [style={}] - 스타일.
     * @param {Object} [attrs={}] - 일반 속성.
     * @param {Object} [datas={}] - data-* 속성.
     * @param {Object} [matchReplacer={}] - 토큰 치환 맵.
     */
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

    /** @type {string} 공백 구분 클래스 문자열. */
    get className() { return this.classes.join(" "); }
    set className(value) { this.classes = value.split(" "); }

    /** @type {Object} 주요 속성 객체 `{ class, id, name, type }`. */
    get majorAttrs() {
        return {
            class: this.className,
            id: this.id,
            name: this.name,
            type: this.type,
        };
    }

    /** @type {string} 이 인스턴스의 solidId 문자열. */
    get solidId() { return Doctre.getSolidId(this.tagName, this.className, this.id, this.name, this.type); }


    /** @type {Element} 이 Doctre를 live DOM 엘리먼트로 생성 (기본 matchReplacer 없이). */
    get live() { return Doctre.createElement(this.tagName, this.majorAttrs, this.childDoctres, this.style, this.attrs, this.datas); }

    /**
     * matchReplacer를 적용하여 live DOM 엘리먼트를 생성한다.
     * @param {Object} [matchReplacer] - 토큰 치환 맵. 생략 시 인스턴스 기본값 사용.
     * @returns {Element}
     */
    fresh(matchReplacer) { return Doctre.createElement(this.tagName, this.majorAttrs, this.childDoctres, this.style, this.attrs, this.datas, matchReplacer ?? this.matchReplacer ?? {}); }

    /**
     * 이 Doctre를 cold 배열로 직렬화한다.
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=false]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @param {boolean} [elementAsDoctre=!trimHecp]
     * @returns {Array} cold 배열.
     */
    frost(trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        const hecp = [[this.solidId, this.cold(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre), this.style, this.attrs, this.datas]];
        return trimHecp ? Doctre.trimHecp(hecp) : hecp;
    }

    /** @type {Array} 간결한(trimmed) frost — `frost(false, true, false, false)`. */
    get icy() { return this.frost(false, true, false, false); }

    /**
     * 이 Doctre를 frost JSON 문자열로 직렬화한다.
     * @param {boolean|number} [prettyJson=false]
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=true]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @returns {string} frost JSON 문자열.
     */
    toString(prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        const hecp = this.frost(trimBobbleNode, trimHecp, styleToObject, trimIndent, false);
        if (prettyJson == null || prettyJson === false) return JSON.stringify(hecp);
        return JSON.stringify(hecp, null, typeof prettyJson == "number" ? prettyJson : 2);
    }



    /** @type {DocumentFragment} 자식 cold를 live DocumentFragment로 복원. */
    get chill() { return Doctre.createFragment(this.childDoctres); }

    /**
     * 자식 콘텐츠를 cold 배열로 직렬화한다.
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=false]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @param {boolean} [elementAsDoctre=!trimHecp]
     * @returns {Array}
     */
    cold(trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        return Doctre.coldify(this.childDoctres, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
    }

    /**
     * 자식 콘텐츠를 frost JSON 문자열로 직렬화한다.
     * @param {boolean|number} [prettyJson=false]
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=true]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @returns {string}
     */
    frozen(prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        return Doctre.stringify(this.childDoctres, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent);
    }
}

/**
 * Array를 상속한 노드 배열. DocumentFragment나 NodeList의 노드를 배열로 보존한다.
 * Fragment는 DOM에 append되면 자식이 빠지므로, 참조를 유지하려면 NodeArray로 감싼다.
 * @class
 * @extends Array
 */
class NodeArray extends Array {

    /**
     * DocumentFragment 또는 NodeList의 노드를 NodeArray로 복사한다.
     * @param {DocumentFragment|NodeList} fragmentOrNodeList - 원본.
     * @param {NodeArray} [into=new NodeArray()] - 결과를 저장할 배열.
     * @returns {NodeArray}
     */
    static box(fragmentOrNodeList, into = new NodeArray()) {
        const nodeList = fragmentOrNodeList instanceof DocumentFragment ? fragmentOrNodeList.childNodes : fragmentOrNodeList;
        for (const node of nodeList) into.push(node);
        return into;
    }

}

if (typeof module !== 'undefined') module.exports = Doctre;
