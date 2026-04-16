# 식별자 용어집 — alienese.js

> 영문 버전: [alienese.en.md](alienese.en.md)

**alienese.js** 는 EstreUI 코드를 극도로 간결하게 만드는 짧은 별칭(상수·헬퍼·연산자) 모음입니다. "Alienese(외계어)"라는 이름은, 이 별칭을 모르면 처음엔 외계 언어처럼 보이지만, 어휘를 익히면 유창하게 읽을 수 있다는 뜻입니다.

> `modernism.js` 가 먼저 로드되어야 합니다. Modernism 은 JS 프로토타입을 확장합니다(`.let()`, `.also()`, `.it`, `.string`, `.int` 등).

## 원시값·리터럴

| 별칭 | 값 | 비고 |
| --- | --- | --- |
| `t` / `f` | `true` / `false` | |
| `n` / `u` | `null` / `undefined` | |
| `T` / `F` / `N` / `U` | `"true"` / `"false"` / `"null"` / `"undefined"` | 문자열 타입명 상수(modernism 유래). |
| `t1` | `"1"` | `estreU0EEOZ.js` 에서 정의. data 속성의 truthy 값으로 자주 사용. |
| `s` | `" "` (공백) | |
| `es` | `""` (빈 문자열) | |
| `d` | `"."` | 점 — 호스트명·셀렉터 등의 구분자. |
| `i` | `"#"` | 해시 — id 셀렉터 prefix. |
| `l` | `","` | 콤마(`cm`과 동일). |

## 괄호·연산자 문자

| 별칭 | 문자 | 별칭 | 문자 |
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

## 셀렉터 헬퍼 (estreU0EEOZ.js)

EstreUI 코드에서 가장 자주 등장하는 별칭들:

| 별칭 | 값 / 용도 |
| --- | --- |
| `cls` | `"."` — CSS 클래스 셀렉터 prefix. `$(cls + "myClass")` → `$(".myClass")`. |
| `eid` | `"#"` — CSS id 셀렉터 prefix. `$(eid + "myId")` → `$("#myId")`. |
| `c.c` | 자식 결합자 프록시: `c.c + ".foo"` → `" > .foo"`. 자동으로 ` > ` 를 앞에 붙임. |
| `inp` | `"input"` — `<input>` 태그 셀렉터. |
| `btn` | `"button"` — `<button>` 태그 셀렉터. |
| `div` | `"div"` — `<div>` 태그 셀렉터. |
| `img` | `"img"` — `<img>` 태그 셀렉터. |
| `ul` / `li` | `"ul"` / `"li"` — 리스트 태그 셀렉터. |
| `aiv(attr, val)` | 속성값 셀렉터 생성: `[attr="val"]`. |
| `isc(val)` | `:is(val)` 의사 셀렉터 생성. |

## 타입 검사

| 별칭 | 의미 |
| --- | --- |
| `to(x)` | `typeof x` (문자열 반환). |
| `tu(x)` / `tf(x)` / `tb(x)` / `ts(x)` / `tn(x)` / `tj(x)` | undefined / function / boolean / string / number / object 타입 검사. |
| `io(x)` / `ia(x)` / `ios(x)` / `ion(x)` | `instanceof` 검사: Object / Array / String / Number. |
| `en(x)` / `nn(x)` | nully 인가 / nully 가 아닌가. |
| `ee(x)` / `ne(x)` | 비어있는가 / 비어있지 않은가. |
| `noe(x)` / `nne(x)` | null 또는 empty / null 도 아니고 empty 도 아닌가. **`nne()` 는 극히 자주 쓰임.** |
| `fc(x)` / `nfc(x)` | false 케이스인가 / false 케이스가 아닌가. |

## 비교

| 별칭 | 의미 |
| --- | --- |
| `xv(a, b)` / `nxv` / `xnv` | 정확히 같은(`===`) / 정확히 같지 않은 / 정확히 그렇지 않은. |
| `ev(a, b)` / `nev` | 같은(`==`) / 같지 않은. |
| `sm(a, b)` / `df` | same / differ. |
| `gtv` / `ltv` / `gev` / `lev` | 초과 / 미만 / 이상 / 이하. |

## 제어 흐름

| 별칭 | 의미 |
| --- | --- |
| `ifx(cond, fn, args, elseFn)` | `cond` 이 true 면 `fn` 실행. |
| `itx(cond, fn, args, elseFn)` | 조건 충족 시 실행. |
| `ifr(cond, val)` | 조건이면 값 반환. |
| `mc(val, ...cases)` | 매치 케이스(패턴 매칭). |
| `ec` / `xc` / `tc` / `cc` / `kc` | equal-case / exact-case / type-case / class-case / kind-case. |
| `inne(val, fn)` / `inoe(val, fn)` | not-null-and-not-empty 면 실행 / null-or-empty 면 실행. |

## 반복

| 별칭 | 의미 |
| --- | --- |
| `f02b(n, fn)` | `for (let i = 0; i < n; i++)`. |
| `f02r(n, fn)` | `for (let i = 0; i <= n; i++)`. |
| `ff(arr, fn)` / `fb(arr, fn)` | 정방향 / 역방향 순회. |
| `fi(obj, fn)` / `fiv(obj, fn)` | `for…in` / inner 변형. |
| `fo(iter, fn)` / `fkv(obj, fn)` | `for…of` / 키-값 순회. |
| `w(cond, fn)` / `dw(cond, fn)` | `while` / `do…while`. |

## 비동기·큐 헬퍼

| 별칭 | 시그니처 | 용도 |
| --- | --- | --- |
| `pq(fn)` | `postQueue` | 다음 마이크로태스크에 `fn` 큐잉. |
| `pd(fn, ms)` | `postDelayed` | `setTimeout` 래퍼. |
| `pp(fn)` | `postPromise` | Promise 반환; `fn` 이 `resolve` 를 받음. |
| `paq(fn)` | `postAsyncQueue` | async 함수를 큐잉. |
| `ppq(fn)` | `postPromiseQueue` | Promise + 큐 조합. |
| `pfq(fn)` | `postFrameQueue` | `requestAnimationFrame` 래퍼. |

## 대기 토큰 (stedy / go)

`stedy()` 와 `go()` 는 EstreUI 의 경량 "잠시 대기" 메커니즘 — `go()` 가 호출될 때까지 로딩 인디케이터를 표시:

```js
const waiter = stedy();       // 로딩 스피너 표시
await doSomethingAsync();
go(waiter);                   // 로딩 스피너 해제
```

`stedy(options, delay)` 는 인스턴스 오리진 토큰을 반환. `go(token)` 이 해제. 여러 `stedy()` 가 중첩되면 전부 `go()` 될 때까지 스피너 유지.

## 토스트 알림 (note)

```js
note("저장되었습니다");
note("오류가 발생했습니다", 5000);    // 5초간 표시
```

`note(message, showTime, onInteraction, options)` 는 비차단 토스트 알림을 표시.

## 데이터 속성 레지스트리 (eds)

`eds` 는 친숙한 이름 → `data-*` 속성 문자열 매핑 사전:

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

앱 코드에서 자체 항목을 추가 가능 (예: `eds["schoolGrade"] = "data-school-grade"`).

## UI 셀렉터 레지스트리 (uis)

`uis` 는 논리 핸들/위젯 이름 → CSS 셀렉터 매핑:

```js
uis.container       // → ".container"
uis.rootTabContent  // → "root_tab_content"
uis.toggle          // → ".toggle"
uis.placeholder     // → ".placeholder"
```

`EstreHandle.registerCustomHandle(name, ...)` 로 등록한 핸들 이름도 `uis` 의 키가 되고, `EstreHandle.activeHandle[uis.name]` 의 조회 키로 사용.

## 객체 복사 / 병합

| 별칭 | 의미 |
| --- | --- |
| `cp(obj)` | 딥 카피. |
| `mk(obj)` / `mm(obj)` / `tw(obj)` / `cn(obj)` | mock / mimic / twin / clone (깊이 다양). |
| `pc(target, from)` | patch — `from` 을 `target` 에 병합. |
| `ow(target, from)` | 덮어쓰기. |
| `tk(target, from)` | 인수인계. |
| `ih(target, from)` | 상속. |
| `rv(target, from)` | 되돌리기 — `from` 으로 `target` 복원. |

## 변환 유틸 (cvt)

`cvt` 는 일반 변환을 위한 유틸 객체(`estreU0EEOZ.js` 에서 정의):

```js
cvt.t2ms("3s")    // 시간 문자열 → 밀리초
```

## DOM 헬퍼 (doc)

`doc` (`estreU0EEOZ.js` 에서 정의)는 DOM 생성 단축:

```js
const el = doc.ce("div", "my-class", "inner text");
// → <div class="my-class">inner text</div> 생성
```
