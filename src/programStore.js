import programJSON from "./program.json"

// ── Pure helpers ─────────────────────────────────────────────────
const _formatAuthor = ({ title = "", name = "", role = "", affiliation = "" }) =>
    [title, name, role && `(${role})`, affiliation && `· ${affiliation}`]
        .filter(Boolean)
        .join(" ")
        .trim();

const _extractAuthors = (events = []) =>
    events.flatMap(event => [
        ...(event.authors ?? []),
        ...(event.talks ?? []).flatMap(talk => talk.authors ?? [])
    ]);

const _timeRange = (events) => {
    return `dalle ${events.at(0).time.split(" - ")[0]} `
        + `alle ${events.at(-1).time.split(" - ")[1]}`;
};

const _parseDate = (ddmmyyyy) => {
    const [d, m, y] = ddmmyyyy.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    const fmt = (opts) => new Intl.DateTimeFormat("it-IT", opts).format(date);
    return {
        day: fmt({ day: "numeric" }),
        month: fmt({ month: "short" }).replace(".", "").toUpperCase(),
        weekday: fmt({ weekday: "short" }).replace(".", "").toLowerCase(),
    };
};


// ── Store factory ────────────────────────────────────────────────
export const programStore = () => ({

    ...programJSON,

    // ── Private helpers ──────────────────────────────────────────

    _dayEvents(...keys) {
        return keys.flatMap(key => this[key].events);
    },

    // Parses "DD/MM/YYYY" → { day, month, weekday } display strings

    // ── Getters ──────────────────────────────────────────────────
    get day1StartEnd() {
        return _timeRange(this._dayEvents("day1"));
    },

    get day1Events() {
        return this._dayEvents("day1");
    },

    get day1Parsed() {
        return _parseDate(this.day1.date);
    },

    get day2StartEnd() {
        return _timeRange(this._dayEvents("day2-first-part", "day2-second-part"));
    },

    get day2Events() {
        return this._dayEvents("day2-first-part", "day2-second-part");
    },

    get day2Parsed() {
        return _parseDate(this["day2-first-part"].date);
    },

    get allAuthors() {
        const all = this._dayEvents("day1", "day2-first-part", "day2-second-part");
        const unique = [...new Set(_extractAuthors(all).map(_formatAuthor))];
        return unique.sort((a, b) => a.localeCompare(b));
    },

})