import Alpine from "alpinejs";

export const calendarReminder = () => ({

    title: "Registrazione Aviation Psy 2026, Milano, Italia",
    description: "Evento di registrazione per il III Convegno di Psicologia dell'Aviazione",
    location: "Milano, Italia",
    start: Alpine.store("programStore").registration.start_date,
    end: Alpine.store("programStore").registration.start_date,
    filename: "reminder.ics",

    // All-day: true  → uses DATE format, spans the whole day
    // All-day: false → uses DATETIME format (UTC)
    allDay: true,

    // Alarm offset in minutes before the event
    // 0   = at the time of the event (start of day for all-day)
    // 480 = 8 hours before (e.g. 8am notification for a 4pm event)
    alarmMinutes: 0,

    downloadCalendarICS() {
        if (!this.start || !this.end || !this.title) {
            console.warn("[calendarReminder] title, start and end are required");
            return;
        }

        try {
            const ics = this._buildIcs();
            const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = this.filename;
            a.click();
            this.$nextTick(() => URL.revokeObjectURL(url));
        } catch (e) {
            console.error("[calendarReminder]", e.message);
        }
    },

    _buildIcs() {
        const uid   = `registrazione@aviation-psy.com`;
        const start = this._parseDate(this.start);
        const end   = this._parseDate(this.end);

        // For all-day events the end date must be the *next* day
        // per the iCal spec — otherwise some apps collapse it
        if (this.allDay) {
            end.setDate(end.getDate() + 1);
        }

        const dtStart = this.allDay ? this._fmtDate(start) : this._fmtDateTime(start);
        const dtEnd = this.allDay ? this._fmtDate(end)   : this._fmtDateTime(end);

        // DTSTART;VALUE=DATE:20260915  ← all-day syntax
        // DTSTART:20260915T100000Z     ← datetime syntax
        const dtStartLine = this.allDay
            ? `DTSTART;VALUE=DATE:${dtStart}`
            : `DTSTART:${dtStart}`;

        const dtEndLine = this.allDay
            ? `DTEND;VALUE=DATE:${dtEnd}`
            : `DTEND:${dtEnd}`;

        return [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//AVIATIONPSY//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${this._fmtDateTime(new Date())}`,
            dtStartLine,
            dtEndLine,
            `SUMMARY:${this._escape(this.title)}`,
            `DESCRIPTION:${this._escape(this.description)}`,
            `LOCATION:${this._escape(this.location)}`,
            ...this._buildAlarm(),
            "END:VEVENT",
            "END:VCALENDAR",
        ].join("\r\n");
    },

    _buildAlarm() {
        // Negative duration = before the event
        // -PT0M  = at the event
        // -PT30M = 30 minutes before
        // -PT8H  = 8 hours before
        const trigger = this.alarmMinutes === 0
            ? "-PT0M"
            : `-PT${this.alarmMinutes}M`;

        return [
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            `DESCRIPTION:${this._escape(this.title)}`,
            `TRIGGER:${trigger}`,
            "END:VALARM",
        ];
    },

    // Parse DD/MM/YYYY (with optional time) or ISO strings into a Date
    _parseDate(date) {
        if (date instanceof Date) return new Date(date);

        if (typeof date === "string") {
            const ddmmyyyy = date.match(
                /^(\d{2})\/(\d{2})\/(\d{4})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/
            );
            if (ddmmyyyy) {
                const [, dd, mm, yyyy, hh = "08", min = "00", ss = "00"] = ddmmyyyy;
                return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}Z`);
            }
            return new Date(date);
        }

        return new Date(date);
    },

    // 20260915T100000Z  ← datetime
    _fmtDateTime(date) {
        if (isNaN(date)) throw new Error(`[calendarReminder] invalid date: ${date}`);
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    },

    // 20260915  ← date only (all-day)
    _fmtDate(date) {
        if (isNaN(date)) throw new Error(`[calendarReminder] invalid date: ${date}`);
        return date.toISOString().split("T")[0].replace(/-/g, "");
    },

    _escape(str) {
        return String(str)
            .replace(/\\/g, "\\\\")
            .replace(/;/g,  "\\;")
            .replace(/,/g,  "\\,")
            .replace(/\n/g, "\\n");
    },
});