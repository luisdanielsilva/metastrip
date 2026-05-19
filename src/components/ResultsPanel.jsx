import React from 'react'
import JSZip from 'jszip'
import { formatBytes, base64ToBlob, downloadBlob } from '../utils/api'

function prefix(name) {
  const dot = name.lastIndexOf('.')
  return dot > 0 ? name.slice(0, dot) + '_clean' + name.slice(dot) : name + '_clean'
}

export default function ResultsPanel({ results }) {
  if (!results?.length) return null

  const downloadOne = (file) => {
    const blob = base64ToBlob(file.data, file.mimetype)
    downloadBlob(blob, prefix(file.name))
  }

  const downloadAll = async () => {
    if (results.length === 1) { downloadOne(results[0]); return }
    const zip = new JSZip()
    results.forEach((f) => {
      const binary = atob(f.data)
      const arr = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
      zip.file(prefix(f.name), arr)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'metastrip_cleaned.zip')
  }

  const totalOriginal = results.reduce((s, f) => s + f.originalSize, 0)
  const totalProcessed = results.reduce((s, f) => s + f.processedSize, 0)

  return (
    <div style={{
      background: 'var(--green-dim)',
      border: '1px solid rgba(61,220,132,0.25)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      animation: 'fadeUp 0.4s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--green)', fontSize: 16 }}>✓</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              {results.length} image{results.length > 1 ? 's' : ''} cleaned
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            {formatBytes(totalOriginal)} → {formatBytes(totalProcessed)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {results.length > 1 && (
            <button
              onClick={() => results.forEach(downloadOne)}
              style={{
                padding: '8px 16px', borderRadius: 99,
                background: 'var(--bg-3)', color: 'var(--text)',
                fontSize: 12, fontWeight: 600, border: '1px solid var(--border)',
                transition: 'border-color var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              Download Each
            </button>
          )}
          <button
            onClick={downloadAll}
            style={{
              padding: '8px 20px', borderRadius: 99,
              background: 'var(--green)', color: '#0a0a0f',
              fontSize: 12, fontWeight: 700,
              transition: 'opacity var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            {results.length > 1 ? 'Download ZIP' : 'Download'}
          </button>
        </div>
      </div>

      {/* File list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {results.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-2)', borderRadius: 'var(--radius)',
            padding: '10px 14px', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 13 }}>🖼️</span>
            <span style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
              {f.name}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              {formatBytes(f.originalSize)} → {formatBytes(f.processedSize)}
            </span>
            <button
              onClick={() => downloadOne(f)}
              style={{
                padding: '4px 12px', borderRadius: 99,
                background: 'transparent', color: 'var(--accent)',
                fontSize: 11, fontWeight: 600, border: '1px solid var(--accent)',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' }}
            >
              ↓
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
