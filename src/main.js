import Alpine from "alpinejs"
import programJSON from "./program.json"
import { spa } from "./componentSpa.js";
import { header } from "./componentHeader.js";

window.Alpine = Alpine

Alpine.store("programStore", programJSON)

Alpine.data("spa", spa)
Alpine.data("header", header)

Alpine.start()