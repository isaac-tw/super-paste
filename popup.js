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
