# 🔗 X & Instagram Link Converter

A lightweight browser extension to automatically convert links from **X.com** (formerly Twitter) or **Instagram** to alternative frontends when sharing or copying.

## Features

- **X/Twitter Support**: Convert links to `fixvx.com`, `fixupx.com`, or `vxtwitter.com`
- **Instagram Support**: Convert links to `kkinstagram.com`
- **Multiple Methods**: 
  - In-page buttons on X/Twitter and Instagram posts
  - Popup interface
  - Automatic interception on Instagram copy button
- **Dual Manifest Support**: Works with both Manifest V2 (Firefox) and Manifest V3 (Chrome)

## Supported Platforms

### X / Twitter
- `x.com`
- `twitter.com`

### Instagram
- `www.instagram.com`
- `instagram.com`

## Alternative Frontends

### X / Twitter Alternatives
- **fixvx.com** - Privacy-focused X frontend
- **fixupx.com** - Alternative X frontend
- **vxtwitter.com** - Enhanced X experience

### Instagram Alternatives
- **kkinstagram.com** - Privacy-focused Instagram frontend

## Installation

### For Firefox (Manifest V2)

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this directory

### For Chrome/Edge (Manifest V3)

**Option 1: Using preparation scripts (Recommended)**

1. Run the preparation script:
   - **Windows**: Double-click `scripts\prepare-chrome.bat`
   - **Linux/Mac**: Run `./scripts/prepare-chrome.sh` (make it executable first: `chmod +x scripts/prepare-chrome.sh`)
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the project directory
6. The extension will load with Manifest V3

**Option 2: Manual method**

1. Rename `manifest.json` to `manifest-v2.json.backup`
2. Rename `manifest-v3.json` to `manifest.json`
3. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the project directory

**To switch back to Firefox:**
- **Windows**: Run `scripts\prepare-firefox.bat`
- **Linux/Mac**: Run `./scripts/prepare-firefox.sh`

**Note**: Chrome requires Manifest V3. The preparation scripts automatically switch between V2 and V3 manifests.

## Usage

### Method 1: In-Page Buttons (X/Twitter only)

When viewing a post on X.com or Twitter.com, you'll see buttons below the post actions:
- Click any button to copy the converted link to your clipboard
- A toast notification will confirm the copy

### Method 2: Popup Interface

1. Click the extension icon in your browser toolbar
2. Select the desired conversion option
3. The converted link is copied to your clipboard
4. A status message confirms the action

### Method 3: Automatic Interception (Instagram only)

When you click the "Copy Link" button on Instagram:
- The extension automatically intercepts the action
- Converts the link to `kkinstagram.com`
- Copies the converted link instead of the original

## File Structure

```
X-Instagram-Link-Converter/
├── manifest.json            # Active manifest (switched by scripts)
├── manifest-v2.json        # Manifest V2 (Firefox)
├── manifest-v3.json        # Manifest V3 (Chrome)
├── background.js            # Background script for V2
├── background-v3.js         # Background service worker for V3
├── content-x.js            # Content script for X/Twitter
├── content-instagram.js    # Content script for Instagram
├── popup.html              # Popup interface
├── popup.js                # Popup script
├── config.js               # Centralized configuration
├── utils.js                # Shared utility functions
├── storage.js              # Storage utilities
├── icons/
│   └── icon128.png
├── scripts/                # Build and preparation scripts
│   ├── prepare-chrome.sh/.bat
│   ├── prepare-firefox.sh/.bat
│   ├── package-chrome.sh/.bat
│   └── package-firefox.sh/.bat
├── docs/                   # Documentation files
│   ├── INSTAGRAM_FEATURES_REVIEW.md
│   ├── INSTAGRAM_TEST_LINKS.md
│   ├── STORE_DESCRIPTIONS.md
│   ├── CHROME_PRIVACY_JUSTIFICATIONS.txt
│   └── CHROME_STORE_DESCRIPTION.txt
├── packages/               # Generated packages
│   ├── x-instagram-link-converter-chrome.zip
│   └── x-instagram-link-converter-firefox.zip
└── README.md
```

## Configuration

All configuration is centralized in `config.js`. You can modify:
- Alternative frontend domains
- Supported original domains
- User messages

## Troubleshooting

### Buttons don't appear on X/Twitter

- Make sure you're on `x.com` or `twitter.com`
- Refresh the page
- Check browser console for errors (F12)

### Instagram conversion doesn't work

- Make sure you're on `instagram.com` or `www.instagram.com`
- Try clicking the "Copy Link" button again
- The extension polls the clipboard for up to 1 second after clicking

### Popup doesn't work

- Make sure you're on a supported page (X/Twitter or Instagram)
- Check browser console for errors
- Verify the extension has clipboard permissions

### Clipboard errors

- Make sure the extension has clipboard permissions
- Some browsers require user interaction before clipboard access
- Try using the context menu or popup instead of in-page buttons

## Development

### Building for Firefox

Use `manifest.json` (Manifest V2)

### Building for Chrome

Use `manifest-v3.json` (Manifest V3)
- Rename to `manifest.json` before loading
- Or modify the extension loader to use the V3 manifest

### Testing

1. Load the extension in developer mode
2. Navigate to X.com, Twitter.com, or Instagram.com
3. Test all conversion methods
4. Check browser console for errors

## Browser Compatibility

- **Firefox**: Uses Manifest V2 (`manifest.json`)
- **Chrome/Edge**: Uses Manifest V3 (`manifest-v3.json`)
- **Other Chromium browsers**: Should work with Manifest V3

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Publishing to Stores

### Creating Packages

Before publishing, create the packages using the provided scripts:

**For Chrome Web Store:**
```bash
# Linux/Mac
./scripts/package-chrome.sh

# Windows
scripts\package-chrome.bat
```

This creates `packages/x-instagram-link-converter-chrome.zip` with Manifest V3.

**For Firefox Add-ons:**
```bash
# Linux/Mac
./scripts/package-firefox.sh

# Windows
scripts\package-firefox.bat
```

This creates `packages/x-instagram-link-converter-firefox.zip` with Manifest V2.

### Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Click "New Item" → Upload `x-instagram-link-converter-chrome.zip`
4. Fill in the store listing:
   - Name, description, screenshots
   - Category, language
   - Privacy practices
5. Submit for review (can take a few days)

**Requirements:**
- One-time $5 registration fee
- Manifest V3 (already included in package)
- Privacy policy URL (if you collect data)

### Firefox Add-ons

1. Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in with your Firefox account
3. Click "Submit a New Add-on" → Upload `x-instagram-link-converter-firefox.zip`
4. Fill in the store listing:
   - Name, description, screenshots
   - Category, tags
   - Source code (optional but recommended)
5. Submit for review (usually faster than Chrome)

**Requirements:**
- Free registration
- Manifest V2 (already included in package)
- Source code review (they check your code)

### Package Contents

Each package includes:
- `manifest.json` (V2 for Firefox, V3 for Chrome)
- All JavaScript files (`background.js`/`background-v3.js`, `content-*.js`, `popup.js`, `config.js`, `utils.js`)
- `popup.html`
- `icons/` directory

**Excluded from packages:**
- Scripts (`prepare-*.sh`, `package-*.sh`, etc.)
- README.md
- Development files

## Changelog

### Version 1.0.3
- Improved button visibility on all posts (X/Twitter and Instagram)
- Buttons now appear on every post in the feed, not just the first one
- Enhanced Instagram button design with gradient and animations
- Better post URL extraction for accurate link conversion
- Improved dynamic content detection for infinite scroll
- Fixed button positioning and styling

### Version 1.0.2
- Added Manifest V3 support
- Added Twitter.com support (in addition to X.com)
- Improved Instagram button detection (more robust)
- Added popup interface
- Refactored code for better maintainability
- Added centralized configuration
- Improved error handling
- Added all X alternatives (fixvx, fixupx, vxtwitter)
