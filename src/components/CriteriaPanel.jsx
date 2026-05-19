import React from 'react'

const PRESETS = [
  {
    id: 'privacy',
    label: 'Privacy Mode',
    icon: '🔒',
    desc: 'Strips location, timestamps & author',
    criteria: { gps: true, timestamps: true, author: true, camera: false, all: false },
  },
  {
    id: 'full',
    label: 'Full Clean',
    icon: '🧹',
    desc: 'Removes all metadata completely',
    criteria: { gps: true, timestamps: true, author: true, camera: true, all: true },
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: '⚙️',
    desc: 'Choose exactly what to remove',
    criteria: null,
  },
]

const FIELDS = [
  { key: 'gps', label: 'GPS / Location', icon: '📍', desc: 'Latitude, longitude, altitude' },
  { key: 'timestamps', label: 'Timestamps', icon: '🕐', desc: 'Capture date, modify date' },
  { key: 'author', label: 'Author & Copyright', icon: '©️', desc: 'Artist, copyright, description' },
  { key: 'camera', label: 'Camera & Lens', icon: '📷', desc: 'Make, model, ISO, aperture' },
]

export default function CriteriaPanel({ preset, setPreset, custom, setCustom }) {
  const handlePreset = (p) => {
    setPreset(p.id)
    if (p.criteria) setCustom(p.criteria)
  }

  const toggleCustom = (key) => {
    const next = { ...custom, [key]: !custom[key], all: false }
    next.all = Object.values(next).filter((v, i) => Object.keys(next)[i] !== 'all').every(Boolean)
    setCustom(next)
    setPreset('custom')
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s 0.1s ease both' }}>
      <h3 style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 14 }}>
        Removal Mode
      </h3>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePreset(p)}
            style={{
              flex: 1,
              padding: '12px 10px',
              borderRadius: 'var(--radius)',
              border: `1.5px solid ${preset === p.id ? 'var(--accent)' : 'var(--border)'}`,
              background: preset === p.id ? 'var(--accent-glow)' : 'var(--bg-3)',
              color: preset === p.id ? 'var(--accent)' : 'var(--text-2)',
              fontSize: 12,
              fontWeight: 600,
              textAlign: 'center',
              transition: 'all var(--transition)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)' }}>{p.label}</div>
            <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7, fontFamily: 'var(--font-mono)', fontWeight: 400 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Custom checkboxes */}
      <div style={{
        background: 'var(--bg-3)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        opacity: preset === 'custom' ? 1 : 0.6,
        transition: 'opacity var(--transition)',
      }}>
        {FIELDS.map((f, i) => (
          <label
            key={f.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '13px 16px',
              borderBottom: i < FIELDS.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <input
              type="checkbox"
              checked={!!custom[f.key]}
              onChange={() => toggleCustom(f.key)}
              style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 16 }}>{f.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{f.desc}</div>
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: custom[f.key] ? 'var(--red)' : 'var(--border-bright)',
              transition: 'background var(--transition)',
            }} />
          </label>
        ))}
      </div>
    </div>
  )
}
