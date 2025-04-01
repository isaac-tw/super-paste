document.getElementById("save").addEventListener("click", () => {
  const text1 = document.getElementById("text1").value;
  const text2 = document.getElementById("text2").value;
  chrome.storage.sync.set({ paste_text_1: text1, paste_text_2: text2 });
});

window.onload = () => {
  chrome.storage.sync.get(["paste_text_1", "paste_text_2"], (result) => {
      document.getElementById("text1").value = result.paste_text_1 || "";
      document.getElementById("text2").value = result.paste_text_2 || "";
  });
};
