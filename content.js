console.log("-------Content script check!-------");

// Listen for keyboard events
document.addEventListener('keydown', (event) => {
  console.log(`Key pressed: ${event.key}, Alt: ${event.altKey}, Shift: ${event.shiftKey}`);
  // Check if Ctrl+Shift+1 was pressed
  if (event.ctrlKey && event.shiftKey && event.key === '1') {
    handleHotkey('paste_text_1');
  }
  // Check if Ctrl+Shift+2 was pressed
  else if (event.ctrlKey && event.shiftKey && event.key === '2') {
    handleHotkey('paste_text_2');
  }
  // Check if Ctrl+Shift+D was pressed
  else if (event.ctrlKey && event.shiftKey && event.key === 'F') {
    console.log('paste_text_3!')
    handleHotkey('paste_text_3');
  }
  // Add more hotkeys as needed...
});

// Function to handle pasting predefined text
function handleHotkey(command) {
  chrome.storage.sync.get([command], (result) => {
    const textToPaste = result[command];
    
    if (textToPaste) {
      const activeElement = document.activeElement;

      if (activeElement && (activeElement.isContentEditable || activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
        activeElement.focus();
        document.execCommand("insertText", false, textToPaste);
      } else {
        console.warn("No editable field detected.");
      }
    } else {
      console.warn("No text found for", command);
    }
  });
}
