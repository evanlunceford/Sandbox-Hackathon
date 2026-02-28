import { useRef, useState } from 'react'
import './css/App.css'
import './css/CRTScreen.css'
import './css/SongCard.css'
import './css/DropZone.css'
import './css/SubmitButton.css'
import CassettePlayer from './components/CassettePlayer'
import TitleEffect from './components/TitleEffect'

const API_URL = 'http://localhost:8000'
const DROP_DURATION = 700 // ms — must match CSS transition duration

export default function App() {
  const [file, setFile]       = useState(null)
  const [phase, setPhase]     = useState('idle') // 'idle' | 'ready' | 'dropping' | 'results'
  const [results, setResults] = useState(null)
  const [error, setError]     = useState(null)
  const inputRef = useRef(null)

  function handleFile(f) {
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setPhase('ready')
      setResults(null)
      setError(null)
    } else {
      setError('Please select a PDF file.')
    }
  }

  function onInputChange(e) { handleFile(e.target.files[0]) }

  function onDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  async function onSubmit() {
    if (!file) return
    setPhase('dropping')
    setError(null)

    try {
      const body = new FormData()
      body.append('file', file)

      // Run the API call and the drop animation in parallel.
      // Results only appear after both finish.
      const [res] = await Promise.all([
        fetch(`${API_URL}/recommend/`, { method: 'POST', body }),
        new Promise(resolve => setTimeout(resolve, DROP_DURATION)),
      ])

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail.detail || `Server error ${res.status}`)
      }

      setResults(await res.json())
      setPhase('results')
    } catch (err) {
      setError(err.message)
      setPhase('ready')
    }
  }

  const isDropping = phase === 'dropping'
  const isResults  = phase === 'results'

  return (
    <div className="tv-wrapper">
      <div className="tv-screen">
        <div className="container">
          <div className="fuzzy-overlay" />
          <div className="app">
            <header className="header">
              <h1 className="site-title">
                <TitleEffect text="Mr. Cassette" speed={100} revealDelay={60} />
              </h1>
            </header>

            <main className="main">
              {error && <p className="error">{error}</p>}

              {/* Cassette + submit button — drop off screen on submit */}
              {!isResults && (
                <div className={`cassette-area${isDropping ? ' dropping' : ''}`}>
                  <CassettePlayer
                    title={file ? file.name : 'Upload any file'}
                    onDrop={onDrop}
                    inputRef={inputRef}
                    onInputChange={onInputChange}
                    loading={isDropping}
                  />
                  <button
                    className={`submit-btn cassette-submit${file ? ' visible' : ''}`}
                    onClick={onSubmit}
                    disabled={!file || isDropping}
                  >
                    {isDropping ? <span className="spinner" /> : 'Find My Songs'}
                  </button>
                </div>
              )}

              {/* Results — fade in after cassette drops */}
              {isResults && results && (
                <section className="results results-enter">
                  <h2 className="results-title">Top Matches</h2>
                  <div className="cards">
                    {results.map((song, i) => (
                      <div key={song.song_id} className="card">
                        <div className="card-rank">#{i + 1}</div>
                        <div className="card-body">
                          <div className="card-title">{song.title}</div>
                          <div className="card-artist">
                            {song.artist}
                            {song.year > 0 && <span className="card-year"> · {song.year}</span>}
                          </div>
                          {song.artist_terms.length > 0 && (
                            <div className="card-tags">
                              {song.artist_terms.slice(0, 5).map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="card-score">
                          {Math.round(song.score * 100)}%
                          <div className="score-label">match</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
