import programJSON from "./program.json"

// delete invitations
delete programJSON.invitations;

const _timeRangeFromEvents = (events) => {
    return `${events.at(0).timeWindow.split(" - ")[0]} - ${events.at(-1).timeWindow.split(" - ")[1]}`;
};

const _addMinutes = (hhmm, minutes) => {
    const [h, m] = hhmm.split(":").map(Number);
    const total = h * 60 + m + minutes;
    const hh = String(Math.floor(total / 60)).padStart(2, "0");
    const mm = String(total % 60).padStart(2, "0");
    return `${hh}:${mm}`;
};

const _makeTimeWindow = (start, duration) =>
    `${start} - ${_addMinutes(start, duration)}`;

const _assertTimeWindow = (entity, computed) => {
    if (entity.timeWindow !== null && entity.timeWindow !== computed) {
        console.warn(
            `[programStore] timeWindow mismatch:\n` +
            `  found:    "${entity.timeWindow}"\n` +
            `  computed: "${computed}"\n`,
            entity
        );
    }
};

// ── Store factory ────────────────────────────────────────────────
export const programStore = () => ({

    ...programJSON,

    init() {
        Object.values(this.days).forEach(day => {

            let cursor = day.startTime;

            day.events.forEach(event => {
                if (event.talks?.length) {

                    let talkCursor = cursor;

                    event.talks.forEach(talk => {
                        const computed = _makeTimeWindow(talkCursor, talk.duration);
                        _assertTimeWindow(talk, computed);
                        talk.timeWindow = computed;
                        talkCursor = _addMinutes(talkCursor, talk.duration);
                    });

                    const computed = `${cursor} - ${talkCursor}`;
                    _assertTimeWindow(event, computed);
                    event.timeWindow = computed;
                    cursor = talkCursor;

                } else {
                    const computed = _makeTimeWindow(cursor, event.duration);
                    _assertTimeWindow(event, computed);
                    event.timeWindow = computed;
                    cursor = _addMinutes(cursor, event.duration);
                }
            });

            const computedDayWindow = `${day.startTime} - ${cursor}`;
            _assertTimeWindow(day, computedDayWindow);
            day.timeWindow = computedDayWindow;
        });
    },

    getDateDay: (ddmmyyyy) => {
        const [d, m, y] = ddmmyyyy.split("/").map(Number);
        const date = new Date(y, m - 1, d);
        const fmt = (opts) => new Intl.DateTimeFormat("it-IT", opts).format(date);
        return fmt({ day: "numeric" });
    },

    getDateMonth: (ddmmyyyy) => {
        const [d, m, y] = ddmmyyyy.split("/").map(Number);
        const date = new Date(y, m - 1, d);
        const fmt = (opts) => new Intl.DateTimeFormat("it-IT", opts).format(date);
        return fmt({ month: "short" }).replace(".", "").toUpperCase();
    },

    getDateWeekday: (ddmmyyyy) => {
        const [d, m, y] = ddmmyyyy.split("/").map(Number);
        const date = new Date(y, m - 1, d);
        const fmt = (opts) => new Intl.DateTimeFormat("it-IT", opts).format(date);
        return fmt({ weekday: "short" }).replace(".", "").toLowerCase();
    },
})