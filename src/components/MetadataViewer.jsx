import React, { useState } from 'react'
import { formatBytes } from '../utils/api'

const Section = ({ title, icon, data, willStrip }) => {
  const entries = Object.entries(data || {}).filter(([, v]) => v != null && v !== '')
  if (!entries.length) return null
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{title}</span>
        {willStrip && (
          <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--red)', background: 'var(--red-dim)', padding: '2px 8px', borderRadius: 99 }}>
            will strip
          </span>
        )}
      </div>
      <div style={{ background: 'var(--bg-3)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {entries.map(([k, v], i) => (
          <div key={k} style={{
            display: 'flex', gap: 12, padding: '8px 12px',
            borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', minWidth: 130, flexShrink: 0 }}>{k}</span>
            <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {typeof v === 'number' ? v.toFixed(6) : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MetadataViewer({ files, criteria }) {
  const [selected, setSelected] = useState(0)
  if (!files.length) return null

  const f = files[selected]
  const m = f.metadata

  return (
    <div style={{ animation: 'fadeUp 0.35s ease both' }}>
      {/* File tabs */}
      {files.length > 1 && (
        <div style={{
          display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4,
        }}>
          {files.map((file, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 99,
                background: selected === i ? 'var(--accent)' : 'var(--bg-3)',
                color: selected === i ? '#fff' : 'var(--text-2)',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                border: '1px solid ' + (selected === i ? 'transparent' : 'var(--border)'),
                transition: 'all var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name.length > 22 ? '…' + file.name.slice(-18) : file.name}
            </button>
          ))}
        </div>
      )}

      {/* Image info bar */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20,
      }}>
        {[
          ['Format', m.image?.format?.toUpperCase()],
          ['Size', formatBytes(f.size)],
          ['Dimensions', m.image ? `${m.image.width} × ${m.image.height}` : '—'],
          ['EXIF', m.image?.hasExif ? '✓' : '✗'],
          ['IPTC', m.image?.hasIptc ? '✓' : '✗'],
          ['XMP', m.image?.hasXmp ? '✓' : '✗'],
        ].map(([label, val]) => (
          <div key={label} style={{
            padding: '6px 12px', borderRadius: 8,
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            fontSize: 11, fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ color: 'var(--text-3)' }}>{label}: </span>
            <span style={{ color: 'var(--text)' }}>{val ?? '—'}</span>
          </div>
        ))}
      </div>

      {m.error ? (
        <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Failed to read metadata: {m.error}
        </div>
      ) : (
        <>
          <Section title="GPS / Location" icon="📍" data={m.gps} willStrip={criteria?.gps || criteria?.all} />
          <Section title="Timestamps" icon="🕐" data={m.timestamps} willStrip={criteria?.timestamps || criteria?.all} />
          <Section title="Author & Copyright" icon="©️" data={m.author} willStrip={criteria?.author || criteria?.all} />
          <Section title="Camera & Lens" icon="📷" data={m.camera} willStrip={criteria?.camera || criteria?.all} />
        </>
      )}
    </div>
  )
}
