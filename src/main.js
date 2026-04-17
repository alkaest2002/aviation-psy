import Alpine from "alpinejs"

window.Alpine = Alpine

// Listen for the Alpine initialization event to set up the navigation system
document.addEventListener("alpine:initialized", () => {
  console.log("Alpine initialized.");
});


Alpine.start()