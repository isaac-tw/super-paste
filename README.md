# Super Paste

A lightweight Chrome extension for saving reusable text and pasting it with custom keyboard shortcuts. Useful for common replies, links, and templates.

## Install

1. Clone this repository, or download and extract its ZIP:

   ```sh
   git clone https://github.com/isaac-tw/super-paste.git
   ```

2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the folder containing `manifest.json`.
4. Pin **Super Paste** from the extensions menu and refresh your open webpages.

## Use

1. Open **Super Paste** and click **Add Snippet**.
2. Click **Shortcut**, press your key combination, and enter the text to paste.
3. Click **Save Changes**. Edits and removals also need saving.
4. Focus a text field on a webpage and press your shortcut.

Text is inserted at the cursor or replaces the selection. If insertion is unavailable, Super Paste attempts to copy the snippet to your clipboard instead.

Use unique shortcuts that don't conflict with your browser or operating system. Command on macOS appears as `Meta`; the literal `+` key is unsupported. Some websites and custom editors may not work.

## Back up and restore

- **Export Config** downloads your saved snippets as `super-paste-config.json`. Save changes first.
- **Import Config** restores an exported file and **immediately replaces your snippet list**. Export your current setup first to keep a backup.

## Storage and privacy

Snippets use Chrome sync storage and may sync when Chrome syncing is enabled. The extension runs on matching webpages to handle shortcuts. It has no backend or analytics and does not read your clipboard.

The entire library shares Chrome's [8 KB per-item storage limit](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync), including serialization overhead. Save errors are not currently shown reliably.

## Development

Plain JavaScript, HTML, and CSS. No dependencies or build step.

Edit the files directly. Reload the extension and test page after changing `manifest.json` or `content.js`; reopen the popup after popup changes. There is no automated test suite.
