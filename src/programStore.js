import programJSON from "./program.json"

export const programStore = () => ({

    ...programJSON,

    _buildStartEndLabel(firstEvent, lastEvent) {
        return `dalle ${firstEvent.time.split(" - ")[0]} alle ${lastEvent.time.split(" - ")[1]}`;
    },

    get day1StartEnd() {
        const events = this.day1.events;
        const firstEvent = events[0];
        const lastEvent = events.slice(-1)[0];
        return this._buildStartEndLabel(firstEvent, lastEvent);
    },

    get day2StartEnd() {
        const events = [
            ...this["day2-first-part"].events, 
            ...this["day2-second-part"].events
        ];
        const firstEvent = events[0];
        const lastEvent = events.slice(-1)[0];
        return this._buildStartEndLabel(firstEvent, lastEvent);
    }

})
