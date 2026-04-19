import Alpine from "alpinejs"
import programJSON from "./program.json"
import { spa } from "./componentSpa.js";
import { program } from "./componentProgram.js";
import { switcher } from "./componentSwitcher.js";
import { header } from "./componentHeader.js";

window.Alpine = Alpine

document.addEventListener("alpine:initialized", () => {
  console.log("Alpine initialized.");
});

Alpine.store("programStore", programJSON)

Alpine.data("spa", spa)
Alpine.data("header", header)
Alpine.data("switcher", switcher)
Alpine.data("program", program)

Alpine.start()