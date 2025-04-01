chrome.commands.onCommand.addListener(async (command) => {
  console.log("Hotkey triggered:", command);
  const result = await chrome.storage.sync.get([command]);
  const textToPaste = result[command];
  
  if (textToPaste) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      console.error("No active tab found.");
      return;
    }
    const tabId = tabs[0].id;
    console.log("Pasting text into tab:", tabId);
    
    chrome.scripting.executeScript({
      target: { tabId },
      function: insertText,
      args: [textToPaste]
    }).catch(err => console.error("Script execution error:", err));
  } else {
    console.warn("No text found for", command);
  }
});

function insertText(text) {
  const activeElement = document.activeElement;

  if (activeElement && (activeElement.isContentEditable || activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
    activeElement.focus();
    document.execCommand("insertText", false, text);
  } else {
    console.warn("No editable field detected.");
  }
}