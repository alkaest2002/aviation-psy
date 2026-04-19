import Alpine from "alpinejs"
import programJSON from "./program.json"
import { spa } from "./spa.js";
import { program } from "./program.js";
import { switcher } from "./switcher.js";
import { header } from "./header.js";

window.Alpine = Alpine

document.addEventListener("alpine:initialized", () => {
  console.log("Alpine initialized.");
});

Alpine.store("programStore", programJSON)

Alpine.data("spa", spa)
Alpine.data("program", program)
Alpine.data("switcher", switcher)
Alpine.data("header", header)

Alpine.start()