# MetaStrip — Project Handoff Document

## What is MetaStrip?
A cross-platform image metadata cleaner that runs as:
- A **web app** in the browser (via Express + React)
- A **native macOS app** (via Electron)
- Planned: Windows and Linux builds

Users upload JPEG, PNG, or TIFF images, inspect their metadata, select what to remove (GPS, timestamps, author/copyright, camera info), and download the cleaned images individually or as a ZIP.

---

## Current Status: ✅ Working

- ✅ Browser version works (`npm run dev` → http://localhost:5173)
- ✅ macOS native app works (`./build-mac.sh`)
- ✅ Metadata reading (GPS, timestamps, author, camera info)
- ✅ Metadata stripping (full clean + selective)
- ✅ Single and batch file upload
- ✅ Presets: Privacy Mode, Full Clean, Custom
- ✅ Download individual files or ZIP
- ✅ Supports JPEG, PNG, TIFF

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Desktop shell | Electron 29 |
| API server | Express 4 |
| Metadata reading | exifr |
| Image processing | sharp |
| ZIP downloads | JSZip |
| Build tool | electron-builder |

---

## Project Structure

```
metastrip/
├── build-mac.sh             # One-click build script for macOS
├── package.json
├── vite.config.js           # base: './' is critical for Electron file:// protocol
├── electron/
│   └── main.js              # Electron entry — spawns server, creates window
├── server/
│   ├── index.js             # Express API (ports 3001)
│   └── metadata.js          # sharp + exifr read/strip logic
└── src/
    ├── index.html
    ├── index.css            # Global design system (CSS variables, fonts)
    ├── main.jsx
    ├── App.jsx              # Main app shell, state management, layout
    ├── components/
    │   ├── DropZone.jsx     # Drag & drop + file picker
    │   ├── CriteriaPanel.jsx # Presets + custom checkboxes
    │   ├── MetadataViewer.jsx # Displays metadata before stripping
    │   └── ResultsPanel.jsx  # Download results (individual + ZIP)
    └── utils/
        └── api.js           # Fetch helpers, blob/download utils
```

---

## Key Config Decisions & Why

### `vite.config.js` — `base: './'`
Without this, built assets use absolute paths (`/assets/...`) which break under
Electron's `file://` protocol, causing a blank white screen.

### `src/utils/api.js` — hardcoded `http://localhost:3001/api`
Vite's proxy did not work in Safari with multipart/form-data requests.
Hardcoding the API URL to port 3001 fixes this for both browser and Electron.

### `electron/main.js` — `ELECTRON_RUN_AS_NODE=1`
When packaged, Electron apps don't have access to the system PATH, so `spawn('node', ...)`
fails with ENOENT. The fix is to use `process.execPath` (Electron's own binary) with
`ELECTRON_RUN_AS_NODE=1` so it runs the Express server as a Node.js process.

---

## How to Run

### Browser (dev)
```bash
cd metastrip
npm install      # first time only
npm run dev      # starts both Vite (5173) and Express (3001)
```
Open http://localhost:5173

### macOS native app
```bash
cd metastrip
./build-mac.sh   # installs, builds, packages — opens dist-electron/ when done
```
Double-click the `.dmg` in `dist-electron/` to install.

### Windows / Linux (not yet tested)
```bash
npm run dist:win    # produces .exe NSIS installer
npm run dist:linux  # produces .AppImage
```

---

## Known Issues & Bugs Fixed

| Issue | Fix Applied |
|-------|-------------|
| 404 on `/api/read` in Safari | Replaced Vite proxy with hardcoded `http://localhost:3001/api` in `api.js` |
| Blank white screen in Electron | Added `base: './'` to `vite.config.js` |
| `spawn node ENOENT` in packaged app | Use `process.execPath` + `ELECTRON_RUN_AS_NODE=1` in `electron/main.js` |
| No permissions to run `build-mac.sh` | Run `chmod +x build-mac.sh` once before `./build-mac.sh` |

---

## Potential Next Steps

- [ ] Image preview thumbnails before/after stripping
- [ ] Show a diff of exactly which metadata fields were removed
- [ ] Drag to reorder files in batch
- [ ] Settings page (default preset, output filename pattern)
- [ ] Windows/Linux testing and verification
- [ ] Code-sign the macOS app (requires Apple Developer account) to remove Gatekeeper warning
- [ ] Server deployment guide (e.g. deploy web version to a VPS or cloud)
- [ ] Dark/light mode toggle
- [ ] Support for RAW formats (HEIC, CR2, ARW)
