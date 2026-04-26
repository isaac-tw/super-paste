const hotkeyContainer = document.getElementById("hotkey-container");
const addHotkeyButton = document.getElementById("add-hotkey");
const saveButton = document.getElementById("save");
const importConfigInput = document.getElementById("import-config");

function createHotkeyInput(index, hotkey = "", text = "") {
    const div = document.createElement("div");
    div.classList.add("hotkey-entry");
    div.dataset.index = index;

    div.innerHTML = `
        <label>Hotkey: <input class="hotkey" type="text" placeholder="Press keys..." readonly></label>
        <textarea class="textarea" placeholder="Text to paste" rows="1"></textarea>
        <button class="remove">&times;</button>
    `;

    // Handle key detection
    const hotkeyInput = div.querySelector(".hotkey");
    const textarea = div.querySelector(".textarea");
    hotkeyInput.value = hotkey;
    textarea.value = text;

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

    return div;
}

function renderHotkeys(hotkeys) {
    hotkeyContainer.innerHTML = "";
    normalizeHotkeys(hotkeys).forEach((item, index) => {
        createHotkeyInput(index, item.hotkey, item.text);
    });

}

function normalizeHotkeys(hotkeys) {
    if (!Array.isArray(hotkeys)) {
        return [];
    }

    return hotkeys.map((item) => ({
        hotkey: typeof item?.hotkey === "string" ? item.hotkey : "",
        text: typeof item?.text === "string" ? item.text : ""
    }));
}

// Load saved hotkeys
window.onload = () => {
    chrome.storage.sync.get("hotkeys", (result) => {
        renderHotkeys(result.hotkeys);
    });
};

// Add new hotkey
addHotkeyButton.addEventListener("click", () => {
    createHotkeyInput(Date.now()); // Use timestamp as a unique ID
});

// Save hotkeys
saveButton.addEventListener("click", () => {
    const hotkeyEntries = document.querySelectorAll(".hotkey-entry");
    const hotkeys = Array.from(hotkeyEntries).map(entry => ({
        hotkey: entry.querySelector(".hotkey").value,
        text: entry.querySelector(".textarea").value
    })).filter(item => item.hotkey || item.text);

    chrome.storage.sync.set({ hotkeys }, () => {
        console.log("Hotkeys saved!", hotkeys);
    });
});

document.getElementById('export-config').addEventListener('click', async () => {
    const config = await chrome.storage.sync.get(null); // Get all stored data
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'super-paste-config.json';
    a.click();

    URL.revokeObjectURL(url);
});

document.getElementById('import-config-btn').addEventListener('click', () => {
    importConfigInput.click();
});

importConfigInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedConfig = JSON.parse(e.target.result);
            await chrome.storage.sync.set(importedConfig); // Overwrite current config
            renderHotkeys(importedConfig.hotkeys);
            alert('Configuration imported successfully!');
        } catch (error) {
            alert('Failed to import configuration. Please ensure the file is valid.');
        }

        importConfigInput.value = "";
    };
    reader.readAsText(file);
});
