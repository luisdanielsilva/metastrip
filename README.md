# MetaStrip

A cross-platform image metadata cleaner. Runs as a desktop app (macOS, Windows, Linux) and as a web app on any server.

## Features

- **Upload** JPEG, PNG, and TIFF images — single or batch
- **Inspect** all metadata before stripping (GPS, timestamps, author, camera info)
- **Presets**: Privacy Mode, Full Clean, or Custom selection
- **Download** cleaned images individually or as a `.zip`
- Runs as a native **Electron desktop app** or a **web server**

---

## Project Structure

```
metastrip/
├── electron/
│   └── main.js          # Electron entry (desktop shell)
├── server/
│   ├── index.js         # Express API server
│   └── metadata.js      # Image metadata read/strip logic (sharp + exifr)
├── src/
│   ├── components/
│   │   ├── DropZone.jsx       # Drag & drop upload
│   │   ├── CriteriaPanel.jsx  # Presets + custom checkboxes
│   │   ├── MetadataViewer.jsx # Before-strip metadata display
│   │   └── ResultsPanel.jsx   # Download results
│   ├── utils/
│   │   └── api.js             # Fetch helpers, download utils
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── index.html
├── package.json
└── vite.config.js
```

---

## Quick Start

### Prerequisites

- **Node.js** v18+
- **npm** v9+

### Install dependencies

```bash
cd metastrip
npm install
```

---

## Running as a Web App

### Development

```bash
npm run dev
```

This starts:
- **Vite dev server** on `http://localhost:5173` (React frontend)
- **Express API** on `http://localhost:3001`

Open `http://localhost:5173` in your browser.

### Production (server deployment)

```bash
npm run build       # builds React → dist/
npm run server      # serves the app on port 3001
```

Set the `PORT` environment variable to change the port:

```bash
PORT=8080 npm run server
```

The server serves both the API and the built frontend.

---

## Running as a Desktop App (Electron)

### Development

```bash
npm run electron
```

Starts the API server and opens the Electron window pointing at the Vite dev server.

### Build distributables

| Platform | Command |
|----------|---------|
| macOS (`.dmg`) | `npm run dist:mac` |
| Windows (`.exe` NSIS) | `npm run dist:win` |
| Linux (`.AppImage`) | `npm run dist:linux` |

Output goes to `dist-electron/`.

---

## API Reference

### `POST /api/read`

Read metadata from uploaded images.

**Body**: `multipart/form-data`, field `images` (multiple files)

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "name": "photo.jpg",
      "size": 2048000,
      "mimetype": "image/jpeg",
      "metadata": {
        "gps": { "latitude": 48.8566, "longitude": 2.3522 },
        "camera": { "make": "Apple", "model": "iPhone 15 Pro" },
        "timestamps": { "dateTimeOriginal": "2024-03-01T12:00:00" },
        "author": { "artist": "Jane Doe", "copyright": "© 2024" },
        "image": { "width": 4032, "height": 3024, "format": "jpeg" }
      }
    }
  ]
}
```

### `POST /api/strip`

Strip metadata and return cleaned images.

**Body**: `multipart/form-data`
- `images`: image files
- `criteria`: JSON string, e.g. `{"gps":true,"timestamps":true,"author":false,"camera":false,"all":false}`

**Response**:
```json
{
  "success": true,
  "files": [
    {
      "name": "photo.jpg",
      "mimetype": "image/jpeg",
      "originalSize": 2048000,
      "processedSize": 1900000,
      "data": "<base64-encoded image>"
    }
  ]
}
```

---

## Metadata Categories

| Category | Fields |
|----------|--------|
| **GPS / Location** | Latitude, longitude, altitude |
| **Timestamps** | DateTimeOriginal, DateTime, ModifyDate, DateTimeDigitized |
| **Author & Copyright** | Artist, Copyright, Creator, ImageDescription, UserComment |
| **Camera & Lens** | Make, Model, LensModel, FocalLength, FNumber, ISO, ExposureTime, Software |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Desktop shell | Electron 29 |
| API server | Express 4 |
| Metadata read | exifr |
| Image processing | sharp |
| ZIP downloads | JSZip |

---

## Notes

- **ICC color profiles** are always preserved to maintain color accuracy
- **Image orientation** is preserved to avoid unintended rotation
- Files up to **100 MB** each are supported
- Batch uploads up to **100 files** at once
