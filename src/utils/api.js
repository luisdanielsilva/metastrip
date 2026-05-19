// Works in browser (dev), Electron (packaged), and server deployments
const BASE = 'http://localhost:3001/api'

export async function readMetadata(files) {
  const form = new FormData()
  files.forEach((f) => form.append('images', f))
  const res = await fetch(`${BASE}/read`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}

export async function stripMetadata(files, criteria) {
  const form = new FormData()
  files.forEach((f) => form.append('images', f))
  form.append('criteria', JSON.stringify(criteria))
  const res = await fetch(`${BASE}/strip`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`Server error ${res.status}`)
  return res.json()
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function base64ToBlob(b64, mime) {
  const binary = atob(b64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
