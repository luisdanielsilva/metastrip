const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const { readMetadata, stripMetadata } = require('./metadata')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Serve built frontend in production
app.use(express.static(path.join(__dirname, '../dist')))

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per file
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/tiff', 'image/tif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported format: ${file.mimetype}`))
    }
  },
})

// POST /api/read — read metadata from uploaded images
app.post('/api/read', upload.array('images', 100), async (req, res) => {
  try {
    const results = await Promise.all(
      req.files.map(async (file) => {
        const meta = await readMetadata(file.buffer, file.mimetype)
        return {
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          metadata: meta,
        }
      })
    )
    res.json({ success: true, files: results })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/strip — strip metadata and return processed images
app.post('/api/strip', upload.array('images', 100), async (req, res) => {
  let criteria
  try {
    criteria = JSON.parse(req.body.criteria)
  } catch {
    criteria = { all: true }
  }

  try {
    const results = await Promise.all(
      req.files.map(async (file) => {
        const processed = await stripMetadata(file.buffer, file.mimetype, criteria)
        const b64 = processed.toString('base64')
        return {
          name: file.originalname,
          mimetype: file.mimetype,
          originalSize: file.size,
          processedSize: processed.length,
          data: b64,
        }
      })
    )
    res.json({ success: true, files: results })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`MetaStrip server running on http://localhost:${PORT}`)
})
