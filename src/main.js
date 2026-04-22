import Alpine from "alpinejs"
import { programStore } from "./programStore.js";
import { spa } from "./componentSpa.js";
import { header } from "./componentHeader.js";
import { map } from "./componentMap.js";

window.Alpine = Alpine

Alpine.store("programStore", programStore())

Alpine.data("spa", spa)
Alpine.data("header", header)
Alpine.data("map", map)

Alpine.start()