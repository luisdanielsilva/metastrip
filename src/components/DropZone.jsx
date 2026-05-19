import React, { useCallback, useState } from 'react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/tiff']

export default function DropZone({ onFiles }) {
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback((fileList) => {
    const valid = Array.from(fileList).filter((f) => ACCEPTED.includes(f.type))
    if (valid.length) onFiles(valid)
  }, [onFiles])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onInputChange = (e) => handleFiles(e.target.files)

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-bright)'}`,
        borderRadius: 'var(--radius-lg)',
        background: dragging ? 'var(--accent-glow)' : 'var(--bg-2)',
        padding: '56px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        animation: 'fadeUp 0.4s ease both',
      }}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".jpg,.jpeg,.png,.tif,.tiff"
        multiple
        style={{ display: 'none' }}
        onChange={onInputChange}
      />

      <div style={{ fontSize: 40, marginBottom: 16 }}>
        {dragging ? '📂' : '🖼️'}
      </div>

      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
        {dragging ? 'Drop to upload' : 'Drop images here'}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
        JPEG · PNG · TIFF &nbsp;·&nbsp; single or batch
      </p>
      <button
        style={{
          marginTop: 24,
          padding: '10px 24px',
          borderRadius: 99,
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
          transition: 'opacity var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
        onMouseLeave={e => e.currentTarget.style.opacity = 1}
        onClick={e => { e.stopPropagation(); document.getElementById('file-input').click() }}
      >
        Browse Files
      </button>
    </div>
  )
}
