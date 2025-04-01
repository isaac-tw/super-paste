chrome.storage.sync.get(["hotkeys", "texts"], (result) => {
  const hotkeys = result.hotkeys || {};
  const texts = result.texts || {};

  document.addEventListener("keydown", (event) => {
    for (let i = 1; i <= 3; i++) {
      if (hotkeys[i] && matchHotkey(event, hotkeys[i])) {
        event.preventDefault();
        pasteText(texts[i]);
      }
    }
  });
});

function matchHotkey(event, hotkeyString) {
  if (!hotkeyString) return false;

  const keys = hotkeyString.toLowerCase().split("+");
  const keyPressed = event.key.toLowerCase();

  // Remove modifier keys from the list
  const requiredKeys = keys.filter(
    (key) => !["alt", "shift", "ctrl", "meta"].includes(key)
  );

  return (
    keys.includes("alt") === event.altKey &&
    keys.includes("shift") === event.shiftKey &&
    keys.includes("ctrl") === event.ctrlKey &&
    keys.includes("meta") === event.metaKey &&
    requiredKeys.includes(keyPressed) // Ensure final key matches
  );
}

function pasteText(text) {
  if (!text) return;

  const activeElement = document.activeElement;
  if (
    activeElement &&
    (activeElement.isContentEditable ||
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA")
  ) {
    activeElement.focus();
    document.execCommand("insertText", false, text);
  } else {
    console.warn(
      "No editable field detected. Text copied to clipboard instead."
    );
    navigator.clipboard.writeText(text);
  }
}
