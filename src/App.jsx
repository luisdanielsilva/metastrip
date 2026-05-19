import React, { useState, useCallback } from 'react'
import DropZone from './components/DropZone'
import CriteriaPanel from './components/CriteriaPanel'
import MetadataViewer from './components/MetadataViewer'
import ResultsPanel from './components/ResultsPanel'
import { readMetadata, stripMetadata } from './utils/api'

const DEFAULT_CUSTOM = { gps: false, timestamps: false, author: false, camera: false, all: false }

export default function App() {
  const [files, setFiles] = useState([])         // raw File objects
  const [metaFiles, setMetaFiles] = useState([]) // enriched with metadata
  const [preset, setPreset] = useState('privacy')
  const [custom, setCustom] = useState({ gps: true, timestamps: true, author: true, camera: false, all: false })
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('metadata') // 'metadata' | 'results'

  const handleFiles = useCallback(async (newFiles) => {
    setFiles(newFiles)
    setResults(null)
    setError(null)
    setTab('metadata')
    setLoading(true)
    setLoadingMsg('Reading metadata…')
    try {
      const data = await readMetadata(newFiles)
      setMetaFiles(data.files)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleStrip = async () => {
    if (!files.length) return
    setLoading(true)
    setLoadingMsg('Stripping metadata…')
    setError(null)
    try {
      const data = await stripMetadata(files, custom)
      setResults(data.files)
      setTab('results')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFiles([])
    setMetaFiles([])
    setResults(null)
    setError(null)
    setTab('metadata')
    setCustom({ gps: true, timestamps: true, author: true, camera: false, all: false })
    setPreset('privacy')
  }

  const hasAnySelected = Object.values(custom).some(Boolean)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-2)',
        WebkitAppRegion: 'drag',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>✂️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>MetaStrip</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: -2 }}>
              image metadata cleaner
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <button
            onClick={reset}
            style={{
              padding: '6px 16px', borderRadius: 99,
              background: 'transparent', color: 'var(--text-2)',
              fontSize: 12, border: '1px solid var(--border)',
              WebkitAppRegion: 'no-drag',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
          >
            ← New Session
          </button>
        )}
      </header>

      {/* Main */}
      <main style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: files.length ? '340px 1fr' : '1fr',
        gap: 0,
        maxWidth: files.length ? '100%' : 640,
        margin: files.length ? 0 : '0 auto',
        width: '100%',
      }}>

        {/* Left panel */}
        <div style={{
          padding: 24,
          borderRight: files.length ? '1px solid var(--border)' : 'none',
          display: 'flex', flexDirection: 'column', gap: 20,
          overflowY: 'auto',
        }}>
          {!files.length ? (
            <div style={{ paddingTop: 48 }}>
              <div style={{ textAlign: 'center', marginBottom: 32, animation: 'fadeUp 0.5s ease both' }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
                  Clean your image metadata
                </h1>
                <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
                  Remove GPS, timestamps, author info & more from JPEG, PNG & TIFF files.
                </p>
              </div>
              <DropZone onFiles={handleFiles} />
            </div>
          ) : (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 'var(--radius)',
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                animation: 'fadeUp 0.3s ease both',
              }}>
                <span style={{ fontSize: 14 }}>🖼️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {files.length} image{files.length > 1 ? 's' : ''} loaded
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>
                    {files.map(f => f.name).join(', ').slice(0, 60)}{files.map(f => f.name).join(', ').length > 60 ? '…' : ''}
                  </div>
                </div>
                <button
                  onClick={() => document.getElementById('file-input-more').click()}
                  style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                    background: 'var(--bg-4)', color: 'var(--text-2)', border: '1px solid var(--border)',
                    transition: 'all var(--transition)',
                  }}
                >
                  + Add
                </button>
                <input id="file-input-more" type="file" accept=".jpg,.jpeg,.png,.tif,.tiff" multiple style={{ display: 'none' }}
                  onChange={e => {
                    const combined = [...files, ...Array.from(e.target.files)]
                    handleFiles(combined)
                  }} />
              </div>

              <CriteriaPanel preset={preset} setPreset={setPreset} custom={custom} setCustom={setCustom} />

              {error && (
                <div style={{
                  padding: '12px 16px', borderRadius: 'var(--radius)',
                  background: 'var(--red-dim)', border: '1px solid rgba(255,92,92,0.3)',
                  color: 'var(--red)', fontSize: 12, fontFamily: 'var(--font-mono)',
                }}>
                  ⚠ {error}
                </div>
              )}

              <button
                onClick={handleStrip}
                disabled={loading || !hasAnySelected}
                style={{
                  padding: '14px 24px',
                  borderRadius: 'var(--radius)',
                  background: hasAnySelected && !loading ? 'var(--accent)' : 'var(--bg-4)',
                  color: hasAnySelected && !loading ? '#fff' : 'var(--text-3)',
                  fontWeight: 700, fontSize: 14,
                  width: '100%',
                  transition: 'all var(--transition)',
                  cursor: hasAnySelected && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading && loadingMsg.includes('Strip') ? (
                  <>
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Processing…
                  </>
                ) : '✂️  Strip Metadata'}
              </button>
            </>
          )}
        </div>

        {/* Right panel */}
        {files.length > 0 && (
          <div style={{ padding: 24, overflowY: 'auto' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
              {['metadata', 'results'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  disabled={t === 'results' && !results}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px 6px 0 0',
                    background: tab === t ? 'var(--bg-3)' : 'transparent',
                    color: tab === t ? 'var(--text)' : 'var(--text-3)',
                    fontWeight: tab === t ? 700 : 400,
                    fontSize: 13,
                    borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all var(--transition)',
                    cursor: t === 'results' && !results ? 'not-allowed' : 'pointer',
                    textTransform: 'capitalize',
                    letterSpacing: '0.02em',
                  }}
                >
                  {t === 'results' && results && <span style={{ color: 'var(--green)', marginRight: 6 }}>✓</span>}
                  {t}
                </button>
              ))}
            </div>

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-2)', fontSize: 13 }}>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--border-bright)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                {loadingMsg}
              </div>
            )}

            {!loading && tab === 'metadata' && (
              <MetadataViewer files={metaFiles} criteria={custom} />
            )}

            {!loading && tab === 'results' && results && (
              <ResultsPanel results={results} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
