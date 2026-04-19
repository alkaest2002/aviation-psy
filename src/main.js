import Alpine from "alpinejs"
import programJSON from "./program.json"
import { program } from "./program.js";
import { switcher } from "./switcher.js";

window.Alpine = Alpine

document.addEventListener("alpine:initialized", () => {
  console.log("Alpine initialized.");
});

Alpine.store("programStore", programJSON)


Alpine.data("program", program)
Alpine.data("switcher", switcher)

Alpine.start()