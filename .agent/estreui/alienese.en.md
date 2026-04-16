# Glossary of Identifiers — alienese.js

> Parallel: [alienese.ko.md](alienese.ko.md)

**alienese.js** defines a comprehensive set of short aliases (constants, helpers, operators) that make EstreUI code dramatically more compact. The name "Alienese" reflects the idea that code using these aliases looks like an alien language at first glance — but once you learn the vocabulary, it reads fluently.

> Requires `modernism.js` to be loaded first. Modernism extends JS prototypes (`.let()`, `.also()`, `.it`, `.string`, `.int`, etc.).

## Primitives & Literals

| Alias | Value | Notes |
| --- | --- | --- |
| `t` / `f` | `true` / `false` | |
| `n` / `u` | `null` / `undefined` | |
| `T` / `F` / `N` / `U` | `"true"` / `"false"` / `"null"` / `"undefined"` | String type-name constants (from modernism). |
| `t1` | `"1"` | Defined in `estreU0EEOZ.js`. Frequently used as a truthy data-attribute value. |
| `s` | `" "` (space) | |
| `es` | `""` (empty string) | |
| `d` | `"."` | Dot — used as separator in hostnames, selectors, etc. |
| `i` | `"#"` | Hash — id selector prefix. |
| `l` | `","` | Comma (same as `cm`). |

## Bracket & Operator Characters

| Alias | Char | Alias | Char |
| --- | --- | --- | --- |
| `lr` / `rr` | `(` / `)` | `lc` / `rc` | `{` / `}` |
| `ls` / `rs` | `[` / `]` | `lt` / `gt` | `<` / `>` |
| `ep` / `em` | `!` | `at` | `@` |
| `ds` | `$` | `ms` | `&` |
| `ps` | `%` | `cf` | `^` |
| `ak` / `mp` | `*` | `ad` | `+` |
| `hp` / `sr` | `-` | `us` | `_` |
| `eq` | `=` | `vl` | `\|` |
| `bs` | `\` | `ss` / `dv` | `/` |
| `qm` | `?` | `sq` / `dq` / `gv` | `'` / `"` / `` ` `` |
| `cl` | `:` | `sc` | `;` |
| `cm` | `,` | `nl` | `!=` |

## Selector Helpers (estreU0EEOZ.js)

These are the aliases most frequently seen in EstreUI application code:

| Alias | Value / Purpose |
| --- | --- |
| `cls` | `"."` — CSS class selector prefix. `$(cls + "myClass")` → `$(".myClass")`. |
| `eid` | `"#"` — CSS id selector prefix. `$(eid + "myId")` → `$("#myId")`. |
| `c.c` | Child combinator proxy: `c.c + ".foo"` → `" > .foo"`. Auto-prepends ` > `. |
| `inp` | `"input"` — `<input>` tag selector. |
| `btn` | `"button"` — `<button>` tag selector. |
| `div` | `"div"` — `<div>` tag selector. |
| `img` | `"img"` — `<img>` tag selector. |
| `ul` / `li` | `"ul"` / `"li"` — list tag selectors. |
| `aiv(attr, val)` | Builds an attribute-value selector: `[attr="val"]`. |
| `isc(val)` | Builds an `:is(val)` pseudo-selector. |

## Type Checking

| Alias | Meaning |
| --- | --- |
| `to(x)` | `typeof x` (returns string). |
| `tu(x)` / `tf(x)` / `tb(x)` / `ts(x)` / `tn(x)` / `tj(x)` | Type check for undefined / function / boolean / string / number / object. |
| `io(x)` / `ia(x)` / `ios(x)` / `ion(x)` | `instanceof` checks: Object / Array / String / Number. |
| `en(x)` / `nn(x)` | Is nully / is not nully. |
| `ee(x)` / `ne(x)` | Is empty / is not empty. |
| `noe(x)` / `nne(x)` | Is null or empty / is not null and not empty. **`nne()` is extremely common.** |
| `fc(x)` / `nfc(x)` | Is false-case / is not false-case. |

## Comparison

| Alias | Meaning |
| --- | --- |
| `xv(a, b)` / `nxv` / `xnv` | Exact (`===`) / not exact / exactly not. |
| `ev(a, b)` / `nev` | Equals (`==`) / not equals. |
| `sm(a, b)` / `df` | Same / differ. |
| `gtv` / `ltv` / `gev` / `lev` | Greater than / less than / greater-or-equal / less-or-equal. |

## Control Flow

| Alias | Meaning |
| --- | --- |
| `ifx(cond, fn, args, elseFn)` | Execute `fn` if `cond` is true. |
| `itx(cond, fn, args, elseFn)` | Execute when condition met. |
| `ifr(cond, val)` | Return value if condition. |
| `mc(val, ...cases)` | Match-case (pattern matching). |
| `ec` / `xc` / `tc` / `cc` / `kc` | Equal-case / exact-case / type-case / class-case / kind-case. |
| `inne(val, fn)` / `inoe(val, fn)` | If not-null-and-not-empty, execute / if null-or-empty, execute. |

## Loops

| Alias | Meaning |
| --- | --- |
| `f02b(n, fn)` | `for (let i = 0; i < n; i++)`. |
| `f02r(n, fn)` | `for (let i = 0; i <= n; i++)`. |
| `ff(arr, fn)` / `fb(arr, fn)` | Iterate forward / backward. |
| `fi(obj, fn)` / `fiv(obj, fn)` | `for…in` / inner variant. |
| `fo(iter, fn)` / `fkv(obj, fn)` | `for…of` / key-value iteration. |
| `w(cond, fn)` / `dw(cond, fn)` | `while` / `do…while`. |

## Async & Queue Helpers

| Alias | Signature | Purpose |
| --- | --- | --- |
| `pq(fn)` | `postQueue` | Enqueue `fn` for next microtask. |
| `pd(fn, ms)` | `postDelayed` | `setTimeout` wrapper. |
| `pp(fn)` | `postPromise` | Returns a Promise; `fn` receives `resolve`. |
| `paq(fn)` | `postAsyncQueue` | Enqueues an async function. |
| `ppq(fn)` | `postPromiseQueue` | Promise + queue combo. |
| `pfq(fn)` | `postFrameQueue` | `requestAnimationFrame` wrapper. |

## Wait Token (stedy / go)

`stedy()` and `go()` are EstreUI's lightweight "please wait" mechanism — they show a loading indicator until the paired `go()` call:

```js
const waiter = stedy();       // show loading spinner
await doSomethingAsync();
go(waiter);                   // hide loading spinner
```

`stedy(options, delay)` returns an instance-origin token. `go(token)` releases it. Multiple outstanding `stedy()` calls stack — the spinner stays until all are `go()`-ed.

## Toast Notification (note)

```js
note("Saved successfully");
note("Error occurred", 5000);    // show for 5 seconds
```

`note(message, showTime, onInteraction, options)` displays a non-blocking toast notification.

## Data Attribute Registry (eds)

`eds` is a dictionary mapping friendly names to `data-*` attribute strings:

```js
eds.static      // → "data-static"
eds.exported    // → "data-exported"
eds.tabId       // → "data-tab-id"
eds.onTop       // → "data-on-top"
eds.bind        // → "data-bind"
eds.bindValue   // → "data-bind-value"
eds.containerId // → "data-container-id"
eds.articleId   // → "data-article-id"
```

Application code extends `eds` with its own entries (e.g. `eds["schoolGrade"] = "data-school-grade"`).

## UI Selector Registry (uis)

`uis` maps logical handle/widget names to CSS selectors:

```js
uis.container       // → ".container"
uis.rootTabContent  // → "root_tab_content"
uis.toggle          // → ".toggle"
uis.placeholder     // → ".placeholder"
```

Handle names registered via `EstreHandle.registerCustomHandle(name, ...)` also become keys in `uis` and serve as the lookup key for `EstreHandle.activeHandle[uis.name]`.

## Object Copy / Merge

| Alias | Meaning |
| --- | --- |
| `cp(obj)` | Deep copy. |
| `mk(obj)` / `mm(obj)` / `tw(obj)` / `cn(obj)` | Mock / mimic / twin / clone (varying depth). |
| `pc(target, from)` | Patch — merge `from` into `target`. |
| `ow(target, from)` | Overwrite. |
| `tk(target, from)` | Takeover. |
| `ih(target, from)` | Inherit. |
| `rv(target, from)` | Revert — restore `target` from `from`. |

## Converter Utility (cvt)

`cvt` is a utility object for common conversions (defined in `estreU0EEOZ.js`):

```js
cvt.t2ms("3s")    // time string → milliseconds
```

## DOM Helper (doc)

`doc` (from `estreU0EEOZ.js`) provides shorthand DOM creation:

```js
const el = doc.ce("div", "my-class", "inner text");
// → creates <div class="my-class">inner text</div>
```
