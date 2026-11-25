# Super Paste

A Chrome extension for pasting saved replies, links, and templates with custom keyboard shortcuts.

## Install

1. Clone this repo or download and extract its ZIP:

   ```sh
   git clone https://github.com/isaac-tw/super-paste.git
   ```

2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the folder containing `manifest.json`.
4. Pin **Super Paste** and refresh your open webpages.

## Use

1. Open **Super Paste** and click **Add Snippet**.
2. Record a **Shortcut**, enter your text, and click **Save Changes**.
3. Save again after editing or removing snippets.
4. Focus a text field on a webpage and press your shortcut.

If insertion fails, Super Paste attempts to copy the snippet to your clipboard.

Use unique shortcuts that don't conflict with your browser. Some editors may not work.

## Back up and restore

- **Export Config** downloads saved snippets as JSON. Save changes first.
- **Import Config** immediately replaces your snippet list with the backup's contents.

## Storage and privacy

Snippets may sync through Chrome. No backend or analytics.

The whole library shares an [8 KB storage limit](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync). Save errors aren't currently reported reliably.
