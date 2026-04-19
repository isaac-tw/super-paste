if (navigator.permissions) {
  navigator.permissions.query({ name: "clipboard-write" }).then(result => {
    console.log("Clipboard write permission:", result.state);
  }).catch(err => {
    console.warn("Clipboard permission check failed:", err);
  });
}

let hotkeys = [];
let statusToastTimeoutId = null;

loadHotkeys();
document.addEventListener("keydown", handleKeydown);
chrome.storage.onChanged.addListener(handleStorageChange);

function loadHotkeys() {
  chrome.storage.sync.get("hotkeys", (result) => {
    hotkeys = Array.isArray(result.hotkeys) ? result.hotkeys : [];
  });
}

function handleKeydown(event) {
  if (event.defaultPrevented) {
    return;
  }

  const matchedHotkey = hotkeys.find(({ hotkey }) => matchHotkey(event, hotkey));
  if (!matchedHotkey) {
    return;
  }

  event.preventDefault();
  pasteText(matchedHotkey.text);
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

  if (insertTextIntoActiveElement(text) || insertTextIntoSelectedEditable(text)) {
    return;
  }

  console.warn("No editable field detected. Copying snippet to clipboard instead.");
  copyTextToClipboard(text);
}

function insertTextIntoActiveElement(text) {
  const activeElement = document.activeElement;

  if (!activeElement) {
    return false;
  }

  if (isTextField(activeElement)) {
    return insertTextIntoField(activeElement, text);
  }

  if (activeElement.isContentEditable) {
    return insertTextIntoContentEditable(activeElement, text);
  }

  return false;
}

function insertTextIntoSelectedEditable(text) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  const editableRoot = getContentEditableRoot(selection.anchorNode);
  if (!editableRoot) {
    return false;
  }

  return insertTextIntoContentEditable(editableRoot, text);
}

function isTextField(element) {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    return false;
  }

  return !element.disabled && !element.readOnly;
}

function insertTextIntoField(field, text) {
  field.focus();

  const start = typeof field.selectionStart === "number" ? field.selectionStart : field.value.length;
  const end = typeof field.selectionEnd === "number" ? field.selectionEnd : start;

  try {
    field.setRangeText(text, start, end, "end");
  } catch (error) {
    console.warn("Text insertion failed for the active field:", error);
    return false;
  }

  dispatchInputEvent(field, text);
  return true;
}

function insertTextIntoContentEditable(editableRoot, text) {
  const selection = window.getSelection();
  if (!selection) {
    return false;
  }

  editableRoot.focus();

  let range;
  if (selection.rangeCount > 0) {
    range = selection.getRangeAt(0);
  } else {
    range = document.createRange();
    range.selectNodeContents(editableRoot);
    range.collapse(false);
  }

  if (!editableRoot.contains(range.commonAncestorContainer)) {
    range = document.createRange();
    range.selectNodeContents(editableRoot);
    range.collapse(false);
  }

  const { fragment, lastNode } = createEditableFragment(text);
  range.deleteContents();
  range.insertNode(fragment);

  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  dispatchInputEvent(editableRoot, text);
  return true;
}

function createEditableFragment(text) {
  const normalizedText = text.replace(/\r\n?/g, "\n");
  const fragment = document.createDocumentFragment();
  const parts = normalizedText.split("\n");
  let lastNode = null;

  parts.forEach((part, index) => {
    if (index > 0) {
      lastNode = document.createElement("br");
      fragment.appendChild(lastNode);
    }

    if (part) {
      lastNode = document.createTextNode(part);
      fragment.appendChild(lastNode);
    }
  });

  return { fragment, lastNode };
}

function getContentEditableRoot(node) {
  let currentNode = node instanceof Element ? node : node?.parentElement;

  while (currentNode) {
    if (currentNode.isContentEditable) {
      return currentNode;
    }

    currentNode = currentNode.parentElement;
  }

  return null;
}

function dispatchInputEvent(element, text) {
  try {
    element.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: text
    }));
  } catch (error) {
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard?.writeText) {
    showStatusToast("Clipboard access is unavailable. Focus a text field and try again.", "error");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showStatusToast("Snippet copied to clipboard.");
  }).catch((error) => {
    console.warn("Clipboard write failed:", error);
    showStatusToast("Clipboard copy failed. Focus a text field and try again.", "error");
  });
}

function showStatusToast(message, tone = "info") {
  const root = document.body || document.documentElement;
  if (!root) {
    return;
  }

  let toast = document.getElementById("super-paste-status-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "super-paste-status-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    root.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.cssText = [
    "position: fixed",
    "right: 16px",
    "bottom: 16px",
    "z-index: 2147483647",
    "max-width: min(320px, calc(100vw - 32px))",
    "padding: 10px 14px",
    "border-radius: 10px",
    "background: #1f2937",
    "color: #ffffff",
    "box-shadow: 0 10px 30px rgba(15, 23, 42, 0.28)",
    "font: 13px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "pointer-events: none",
    "display: block"
  ].join("; ");

  if (tone === "error") {
    toast.style.background = "#7f1d1d";
  }

  if (statusToastTimeoutId !== null) {
    window.clearTimeout(statusToastTimeoutId);
  }

  statusToastTimeoutId = window.setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}
