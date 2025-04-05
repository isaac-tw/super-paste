if (navigator.permissions) {
  navigator.permissions.query({ name: "clipboard-write" }).then(result => {
    console.log("Clipboard write permission:", result.state);
  }).catch(err => {
    console.warn("Clipboard permission check failed:", err);
  });
}

chrome.storage.sync.get("hotkeys", (result) => {
  const hotkeys = result.hotkeys || [];

  document.addEventListener("keydown", (event) => {
      hotkeys.forEach(({ hotkey, text }) => {
          if (matchHotkey(event, hotkey)) {
              event.preventDefault();
              pasteText(text);
          }
      });
  });
});

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
