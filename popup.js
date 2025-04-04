const hotkeyContainer = document.getElementById("hotkey-container");
const addHotkeyButton = document.getElementById("add-hotkey");

function createHotkeyInput(index, hotkey = "", text = "") {
    const div = document.createElement("div");
    div.classList.add("hotkey-entry");
    div.dataset.index = index;

    div.innerHTML = `
        <label>Hotkey: <input class="hotkey" type="text" placeholder="Press keys..." readonly value="${hotkey}"></label>
        <textarea class="textarea" placeholder="Text to paste" rows="1">${text}</textarea>
        <button class="remove">&times;</button>
    `;

    // Handle key detection
    const hotkeyInput = div.querySelector(".hotkey");
    hotkeyInput.addEventListener("keydown", (event) => {
        event.preventDefault();
        let keys = [];
        if (event.altKey) keys.push("Alt");
        if (event.shiftKey) keys.push("Shift");
        if (event.ctrlKey) keys.push("Ctrl");
        if (event.metaKey) keys.push("Meta");

        if (!["Alt", "Shift", "Ctrl", "Meta"].includes(event.key)) {
            keys.push(event.key.toUpperCase());
        }

        hotkeyInput.value = keys.join("+");
    });

    // Handle removal
    div.querySelector(".remove").addEventListener("click", () => {
        div.remove();
    });

    hotkeyContainer.appendChild(div);
}

// Load saved hotkeys
window.onload = () => {
    chrome.storage.sync.get("hotkeys", (result) => {
        const hotkeys = result.hotkeys || [];
        hotkeys.forEach((item, index) => {
            createHotkeyInput(index, item.hotkey, item.text);
        });
    });
};

// Add new hotkey
addHotkeyButton.addEventListener("click", () => {
    createHotkeyInput(Date.now()); // Use timestamp as a unique ID
});

// Save hotkeys
document.getElementById("save").addEventListener("click", () => {
    const hotkeyEntries = document.querySelectorAll(".hotkey-entry");
    const hotkeys = Array.from(hotkeyEntries).map(entry => ({
        hotkey: entry.querySelector(".hotkey").value,
        text: entry.querySelector(".textarea").value
    }));

    chrome.storage.sync.set({ hotkeys }, () => {
        console.log("Hotkeys saved!", hotkeys);
    });
});
