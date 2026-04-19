if (navigator.permissions) {
  navigator.permissions.query({ name: "clipboard-write" }).then(result => {
    console.log("Clipboard write permission:", result.state);
  }).catch(err => {
    console.warn("Clipboard permission check failed:", err);
  });
}

let hotkeys = [];

loadHotkeys();
document.addEventListener("keydown", handleKeydown);
chrome.storage.onChanged.addListener(handleStorageChange);

function loadHotkeys() {
  chrome.storage.sync.get("hotkeys", (result) => {
    hotkeys = Array.isArray(result.hotkeys) ? result.hotkeys : [];
  });
}

function handleKeydown(event) {
  hotkeys.forEach(({ hotkey, text }) => {
    if (matchHotkey(event, hotkey)) {
      event.preventDefault();
      pasteText(text);
    }
  });
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "sync" || !changes.hotkeys) {
    return;
  }

  hotkeys = Array.isArray(changes.hotkeys.newValue) ? changes.hotkeys.newValue : [];
}

function matchHotkey(event, hotkeyString) {
  if (!hotkeyString || !event.key) return false;

  const keys = hotkeyString.toLowerCase().split("+");
  const keyPressed = event.key.toLowerCase();

  const requiredKeys = keys.filter(key => !["alt", "shift", "ctrl", "meta"].includes(key));

  return (
      keys.includes("alt") === event.altKey &&
      keys.includes("shift") === event.shiftKey &&
      keys.includes("ctrl") === event.ctrlKey &&
      keys.includes("meta") === event.metaKey &&
      requiredKeys.includes(keyPressed)
  );
}

function pasteText(text) {
  if (!text) return;
  
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.isContentEditable || activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
      activeElement.focus();
      document.execCommand("insertText", false, text);
  } else {
      console.warn("No editable field detected. Text copied to clipboard instead.");
      navigator.clipboard.writeText(text);
  }
}
