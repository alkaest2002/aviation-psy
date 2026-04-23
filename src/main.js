import Alpine from "alpinejs"
import { programStore } from "./programStore.js";
import { spa } from "./componentSpa.js";
import { header } from "./componentHeader.js";
import { map } from "./componentMap.js";
import { calendarReminder } from "./calendarReminder.js";

window.Alpine = Alpine

Alpine.store("programStore", programStore())

Alpine.data("spa", spa)
Alpine.data("header", header)
Alpine.data("map", map)
Alpine.data("calendarReminder", calendarReminder)

Alpine.start()