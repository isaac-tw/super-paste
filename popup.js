document.querySelectorAll("input.hotkey").forEach(input => {
  input.addEventListener("keydown", (event) => {
      event.preventDefault(); // Prevent default browser actions

      let keys = [];
      if (event.altKey) keys.push("Alt");
      if (event.shiftKey) keys.push("Shift");
      if (event.ctrlKey) keys.push("Ctrl");
      if (event.metaKey) keys.push("Meta"); // Cmd on Mac

      // Only store the last non-modifier key
      if (!["Alt", "Shift", "Ctrl", "Meta"].includes(event.key)) {
          keys.push(event.key.toUpperCase());
      }

      input.value = keys.join("+"); // Display detected keys
  });
});

document.getElementById("save").addEventListener("click", () => {
  const settings = {
      hotkeys: {
          1: document.getElementById("hotkey1").value,
          2: document.getElementById("hotkey2").value,
          3: document.getElementById("hotkey3").value
      },
      texts: {
          1: document.getElementById("text1").value,
          2: document.getElementById("text2").value,
          3: document.getElementById("text3").value
      }
  };

  chrome.storage.sync.set(settings, () => {
      console.log("Hotkeys and texts saved!", settings);
  });
});

// ✅ Load saved values when popup opens
window.onload = () => {
  chrome.storage.sync.get(["hotkeys", "texts"], (result) => {
      if (result.hotkeys) {
          document.getElementById("hotkey1").value = result.hotkeys[1] || "";
          document.getElementById("hotkey2").value = result.hotkeys[2] || "";
          document.getElementById("hotkey3").value = result.hotkeys[3] || "";
      }
      if (result.texts) {
          document.getElementById("text1").value = result.texts[1] || "";
          document.getElementById("text2").value = result.texts[2] || "";
          document.getElementById("text3").value = result.texts[3] || "";
      }
  });
};
