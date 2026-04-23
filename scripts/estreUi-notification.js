/*
    EstreUI rimwork — Notification Banner
    Part of the split from estreUi.js (roadmap #002 phase 2; roadmap #009).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Notification -- EstreNotificationManager, noti(), push adapters
// ======================================================================

/**
 * iOS-style notification banner queue manager.
 * Mirrors EstreNotationManager (note toast) — one-at-a-time, per-item showTime.
 */
class EstreNotificationManager {

    // static
    static #page = "popNoti";

    static #queue = [];
    static current = null;

    static postHandle = null;

    /** Default auto-dismiss ms for banners (longer than note toast). */
    static defaultShowTime = 4500;

    static get noInteraction() { return (intent) => {}; }

    /**
     * Enqueue a banner.
     * @param {object} options - Normalized banner options (see EstreNotificationManager#data).
     * @returns {Promise<EstreNotificationManager>|undefined}
     */
    static post(options) {
        if (options != null && typeof options === "object") {
            return new Promise((resolve) => {
                const it = new EstreNotificationManager(options, resolve);
                this.#queue.push(it);
                if (window.isDebug) console.log(this.#page + " posted: ", it);
                postQueue(_ => this.postHandler());
            });
        }
    }

    static postHandler() {
        if (window.isDebug) console.log("queue: ", this.#queue);
        if (this.postHandle == null && this.current == null && this.#queue.length > 0) {
            const handle = Date.now();
            this.postHandle = handle;
            const current = this.#queue.splice(0, 1)[0];
            current.data.posted = handle;
            if (window.isDebug) console.log(this.#page + " bring: ", current);
            return pageManager.bringPage("!" + this.#page, current, handle);
        }
    }

    static checkOut(intent) {
        if (intent.data.posted != null && this.postHandle == intent.data.posted) {
            if (this.current == intent) {
                this.current = null;
            }
            this.postHandle = null;
            if (window.isDebug) console.log(this.#page + " checked out: ", intent);
            postQueue(_ => this.postHandler());
        }
        intent.resolver?.(intent);
    }


    // instance property
    data = {
        posted: undefined,
        contentTitle: undefined,
        subtitle: undefined,
        content: undefined,
        showTime: undefined,
        interactive: undefined,

        // icons
        iconSrc: undefined,      // small / sub icon
        largeIconSrc: undefined, // large / main icon (subIconSrc naming kept for template)

        // payload / routing
        buttons: undefined,
        url: undefined,
        payload: undefined,

        // visual tokens
        textSize: undefined,
        textWeight: undefined,
        textColor: undefined,
        bgColor: undefined,
    };

    onTakeInteraction = undefined;
    resolver = undefined;

    /**
     * @param {object} options - Normalized banner options.
     * @param {Function} resolver - Promise resolver injected by post().
     */
    constructor(options, resolver) {
        const d = this.data;
        d.contentTitle = options.title;
        d.content = options.body;
        d.subtitle = options.subtitle;
        d.iconSrc = options.icon;
        d.largeIconSrc = options.largeIcon;
        d.buttons = options.buttons;
        d.url = options.url;
        d.payload = options.data;

        const ui = options.ui ?? {};
        d.showTime = ui.showTime ?? EstreNotificationManager.defaultShowTime;
        d.textSize = ui.textSize;
        d.textWeight = ui.textWeight;
        d.textColor = ui.textColor;
        d.bgColor = ui.bgColor;

        this.onTakeInteraction = options.onTakeInteraction ?? EstreNotificationManager.noInteraction;
        const hasInteraction = this.onTakeInteraction !== EstreNotificationManager.noInteraction
            || options.url != null
            || (Array.isArray(options.buttons) && options.buttons.length > 0);
        d.interactive = (ui.interactive ?? hasInteraction) ? "" : undefined;

        this.resolver = resolver;
    }
}

/**
 * Post an iOS-style notification banner.
 *
 * Positional form (frequency-first, matches the original stub):
 *   noti(title, body, onTakeInteraction, mainIconSrc, subIconSrc)
 *
 * Object overload — passes through to EstreNotificationManager.post():
 *   noti({ title, body, subtitle, icon, largeIcon, data, url, buttons, onTakeInteraction, ui })
 *
 * @param {string|object} title - Title text, or the full options object (overload).
 * @param {string} [body] - Body text (HTML-capable).
 * @param {Function} [onTakeInteraction] - Tap callback. intent is passed.
 * @param {string} [mainIconSrc] - Large/leading icon src (maps to largeIcon).
 * @param {string} [subIconSrc] - Small/trailing icon src (maps to icon).
 * @returns {Promise<EstreNotificationManager>|undefined}
 */
const noti = function (title, body, onTakeInteraction, mainIconSrc, subIconSrc) {
    if (title != null && typeof title === "object") {
        return EstreNotificationManager.post(title);
    }
    return EstreNotificationManager.post({
        title,
        body,
        onTakeInteraction,
        largeIcon: mainIconSrc,
        icon: subIconSrc,
    });
}

/**
 * FCM payload adapter.
 * Accepts either the full message (`{ notification, data }`) or the `notification` object directly.
 * @param {object} payload
 */
noti.fromFcm = function (payload) {
    if (payload == null) return;
    const n = payload.notification ?? payload;
    const data = payload.data ?? (payload !== n ? undefined : undefined);
    return noti({
        title: n.title,
        body: n.body,
        icon: n.icon,
        largeIcon: n.image,
        url: n.click_action ?? payload.fcm_options?.link,
        data,
    });
}

/**
 * APNs payload adapter.
 * Accepts the outer aps-bearing object (`{ aps: { alert: ... }, ...custom }`).
 * `alert` may be a string or object.
 * @param {object} payload
 */
noti.fromApns = function (payload) {
    if (payload == null) return;
    const aps = payload.aps ?? {};
    const alert = typeof aps.alert === "string" ? { body: aps.alert } : (aps.alert ?? {});
    return noti({
        title: alert.title,
        body: alert.body,
        subtitle: alert.subtitle,
        data: payload,
    });
}

/**
 * OneSignal payload adapter.
 * `headings` / `contents` may be locale maps; first value is picked.
 * @param {object} payload
 */
noti.fromOneSignal = function (payload) {
    if (payload == null) return;
    const pick = (v) => (v != null && typeof v === "object") ? Object.values(v)[0] : v;
    return noti({
        title: pick(payload.headings),
        body: pick(payload.contents),
        subtitle: pick(payload.subtitle),
        largeIcon: payload.big_picture ?? payload.chrome_big_picture,
        icon: payload.small_icon ?? payload.chrome_icon,
        url: payload.url,
        data: payload.data ?? payload.additionalData,
    });
}


// ======================================================================
