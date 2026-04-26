const hotkeyContainer = document.getElementById("hotkey-container");
const addHotkeyButton = document.getElementById("add-hotkey");
const saveButton = document.getElementById("save");
const saveStatus = document.getElementById("save-status");
const emptyState = document.getElementById("empty-state");
const importConfigInput = document.getElementById("import-config");

function createHotkeyInput(index, hotkey = "", text = "", options = {}) {
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
        setStatus("Shortcut captured. Save when you're ready.");
    });

    textarea.addEventListener("input", () => {
        setStatus("Unsaved changes.");
    });

    // Handle removal
    div.querySelector(".remove").addEventListener("click", () => {
        div.remove();
        updateEmptyState();
        setStatus("Snippet removed. Save changes to keep it.");
    });

    hotkeyContainer.appendChild(div);
    updateEmptyState();

    if (options.focusNewEntry) {
        window.requestAnimationFrame(() => {
            div.scrollIntoView({ block: "nearest", behavior: "smooth" });
            hotkeyInput.focus();
        });
    }

    return div;
}

function renderHotkeys(hotkeys) {
    hotkeyContainer.innerHTML = "";
    normalizeHotkeys(hotkeys).forEach((item, index) => {
        createHotkeyInput(index, item.hotkey, item.text);
    });

    updateEmptyState();
}

function updateEmptyState() {
    emptyState.hidden = hotkeyContainer.children.length > 0;
}

function setStatus(message, tone = "") {
    saveStatus.textContent = message;
    saveStatus.dataset.tone = tone;
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
    createHotkeyInput(Date.now(), "", "", { focusNewEntry: true }); // Use timestamp as a unique ID
    setStatus("New snippet added. Capture a shortcut and save it.");
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
        setStatus("Saved to Chrome sync.", "success");
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
    setStatus("Configuration exported.");

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
            setStatus("Configuration imported. Save if you make more changes.", "success");
        } catch (error) {
            setStatus("Import failed. Please use a valid Super Paste config file.", "error");
        }

        importConfigInput.value = "";
    };
    reader.readAsText(file);
});
