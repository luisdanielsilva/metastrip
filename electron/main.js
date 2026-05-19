const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

let serverProcess = null

function getNodePath() {
  if (app.isPackaged) {
    return process.execPath
  }
  const candidates = [
    '/opt/homebrew/bin/node',
    '/usr/local/bin/node',
    '/usr/bin/node',
    '/opt/local/bin/node',
  ]
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c } catch (_) {}
  }
  return 'node'
}

function startServer() {
  const nodePath = getNodePath()
  const serverScript = app.isPackaged
    ? path.join(process.resourcesPath, 'app', 'server', 'index.js')
    : path.join(__dirname, '../server/index.js')

  serverProcess = spawn(nodePath, [serverScript], {
    env: { ...process.env, PORT: '3001', ELECTRON_RUN_AS_NODE: '1' },
    stdio: 'inherit',
  })

  serverProcess.on('error', (err) => {
    console.error('Failed to start server process:', err)
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (app.isPackaged) {
    // Load the built index.html using absolute path
    const indexPath = path.join(__dirname, '../dist/index.html')
    win.loadFile(indexPath)
    // Uncomment to debug packaged app:
    // win.webContents.openDevTools()
  } else {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  startServer()
  setTimeout(createWindow, 1500)
})

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
