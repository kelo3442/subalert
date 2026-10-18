/** Where the panel's display preferences (larger text, light theme) are kept on this device. */
export const DISPLAY_STORAGE_KEY = "oplacik:display";

/** Runs before the panel paints so the chosen text size and theme do not flash. */
export const DISPLAY_BOOT_SCRIPT = `try{var d=JSON.parse(localStorage.getItem("${DISPLAY_STORAGE_KEY}")||"{}");var c=document.documentElement.classList;c.toggle("text-large",!!d.largeText);c.toggle("theme-light",!!d.light)}catch(e){}`;
