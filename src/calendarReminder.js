// calendarReminder.js

export const calendarReminder = () => ({

    title: "Registrazione Aviation Psy 2026, Milano, Italia",
    description: "Evento di registrazione per il III Convegno di Psicologia dell'Aviazione",
    location: "Milano, Italia",
    start: `${Alpine.store("programStore").registration.startDate} 08:00:00`,
    end: `${Alpine.store("programStore").registration.startDate} 09:00:00`,
    filename: "aviation_psy_milano_2026_reminder.ics",
    timezone: "Europe/Rome",

    allDay: false,
    alarmMinutes: 0,

    downloadCalendarICS() {
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
        const uid   = "registrazione@aviation-psy.com";
        const start = this._parseDate(this.start);
        const end   = this._parseDate(this.end);

        if (this.allDay) {
            end.setDate(end.getDate() + 1);
        }

        // Use TZID for local time instead of UTC "Z" suffix
        const dtStartLine = this.allDay
            ? `DTSTART;VALUE=DATE:${this._fmtDate(start)}`
            : `DTSTART;TZID=${this.timezone}:${this._fmtDateTimeLocal(start)}`;

        const dtEndLine = this.allDay
            ? `DTEND;VALUE=DATE:${this._fmtDate(end)}`
            : `DTEND;TZID=${this.timezone}:${this._fmtDateTimeLocal(end)}`;

        const icsLines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//AVIATIONPSY//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            // Embed the timezone definition so all clients handle DST correctly
            ...this._buildTimezone(),
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

        console.log("[calendarReminder] Generated ICS:\n", icsLines);
        return icsLines;
    },

    _buildTimezone() {
        // VTIMEZONE block for Europe/Rome
        // Covers both standard time (CET, UTC+1) and daylight time (CEST, UTC+2)
        return [
            "BEGIN:VTIMEZONE",
            `TZID:${this.timezone}`,
            "BEGIN:STANDARD",
            "DTSTART:19701025T030000",
            "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
            "TZOFFSETFROM:+0200",
            "TZOFFSETTO:+0100",
            "TZNAME:CET",
            "END:STANDARD",
            "BEGIN:DAYLIGHT",
            "DTSTART:19700329T020000",
            "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
            "TZOFFSETFROM:+0100",
            "TZOFFSETTO:+0200",
            "TZNAME:CEST",
            "END:DAYLIGHT",
            "END:VTIMEZONE",
        ];
    },

    _buildAlarm() {
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

    // Parse DD/MM/YYYY (with optional time) — NO Z suffix, keeps local time
    _parseDate(date) {
        if (date instanceof Date) return new Date(date);

        if (typeof date === "string") {
            const ddmmyyyy = date.match(
                /^(\d{2})\/(\d{2})\/(\d{4})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/
            );
            if (ddmmyyyy) {
                const [, dd, mm, yyyy, hh = "08", min = "00", ss = "00"] = ddmmyyyy;
                // No Z → local time, interpreted relative to TZID in the ICS
                return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`);
            }
            return new Date(date);
        }

        return new Date(date);
    },

    // 20261027T080000  ← local datetime, NO Z (paired with TZID)
    _fmtDateTimeLocal(date) {
        if (isNaN(date)) throw new Error(`[calendarReminder] invalid date: ${date}`);
        const pad = n => String(n).padStart(2, "0");
        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate()),
            "T",
            pad(date.getHours()),
            pad(date.getMinutes()),
            pad(date.getSeconds()),
        ].join("");
    },

    // 20261027T060000Z ← UTC, used only for DTSTAMP
    _fmtDateTime(date) {
        if (isNaN(date)) throw new Error(`[calendarReminder] invalid date: ${date}`);
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    },

    // 20261027 ← date only (all-day)
    _fmtDate(date) {
        if (isNaN(date)) throw new Error(`[calendarReminder] invalid date: ${date}`);
        return date.toISOString().split("T")[0].replace(/-/g, "");
    },

    _escape(str) {
        return String(str)
            .replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\n/g, "\\n");
    },
});