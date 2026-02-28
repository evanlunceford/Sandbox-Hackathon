import { useRef, useState, useEffect } from 'react';
import './css/App.css';
import './css/CRTScreen.css';
import './css/SongCard.css';
import './css/DropZone.css';
import './css/SubmitButton.css';
import CassettePlayer from './components/CassettePlayer';
import TitleEffect from './components/TitleEffect';
import TypingEffect from './components/TypingEffect';

const API_URL = 'http://localhost:8000';
const DROP_DURATION = 700;

const DESCRIPTION_PHRASES = [
  "The tradition is not the worship of ashes, but the preservation of fire. / Gustav Mahler",
  "I am a new man every morning. Each day I rediscover music. / Pablo Casals",
  "Music is the space between the notes. / Claude Debussy",
  "To achieve great things, two things are needed: a plan and not quite enough time. / Leonard Bernstein",
  "If something is boring after two minutes, try it for four. If still boring, then eight. Then sixteen. Eventually one discovers that it is not boring at all. / John Cage",
  "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes. / Marcel Proust",
  "We shall not cease from exploration And the end of all our exploring Will be to arrive where we started And know the place for the first time. / T.S. Eliot",
  "Without music, life would be a mistake. / Friedrich Nietzsche",
  "Repetition is a form of change. / Brian Eno",
  "No man ever steps in the same river twice. / Heraclitus",
  "Live the questions now. / Rainer Maria Rilke"
];

export default function App() {
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [randomQuote, setRandomQuote] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    function pickQuote() {
      const q =
        DESCRIPTION_PHRASES[
          Math.floor(Math.random() * DESCRIPTION_PHRASES.length)
        ];
      setRandomQuote(q.replace(' / ', '\n'));
    }

    pickQuote();

    const interval = setInterval(pickQuote, 20000);
    return () => clearInterval(interval);
  }, []);

  function handleFile(f) {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setPhase('ready');
      setResults(null);
      setError(null);
    } else {
      setError('Please select a PDF file.');
    }
  }

  function onInputChange(e) {
    handleFile(e.target.files[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  async function onSubmit() {
    if (!file) return;
    setPhase('dropping');
    setError(null);

    try {
      const body = new FormData();
      body.append('file', file);

      const [res] = await Promise.all([
        fetch(`${API_URL}/recommend/`, { method: 'POST', body }),
        new Promise(resolve => setTimeout(resolve, DROP_DURATION)),
      ]);

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `Server error ${res.status}`);
      }

      setResults(await res.json());
      setPhase('results');
    } catch (err) {
      setError(err.message);
      setPhase('ready');
    }
  }

  const isDropping = phase === 'dropping';
  const isResults = phase === 'results';

  return (
    <div className="tv-wrapper">
      <div className="tv-screen">
        <div className="container crt">
          <div className={`fuzzy-overlay${isResults ? ' hidden' : ''}`} />
          <div className="app">
            <header className="header">
              {!isResults && (
                <>
                  <h1 className="site-title">
                    <TitleEffect text="Mr. Cassette" speed={100} revealDelay={60} />
                  </h1>
                  <p className="subtitle">Not an LLM</p>
                </>
              )}
            </header>

            <main className="main">
              {error && <p className="error">{error}</p>}

              {!isResults && (
                <div className={`cassette-area${isDropping ? ' dropping' : ''}`}>
                  <CassettePlayer
                    title={file ? file.name : 'Upload any file'}
                    hasFile={!!file}
                    onDrop={onDrop}
                    inputRef={inputRef}
                    onInputChange={onInputChange}
                    loading={isDropping}
                  />
                </div>
              )}

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
                            {song.year > 0 && (
                              <span className="card-year"> · {song.year}</span>
                            )}
                          </div>
                          {song.artist_terms.length > 0 && (
                            <div className="card-tags">
                              {song.artist_terms.slice(0, 5).map(tag => (
                                <span key={tag} className="tag">
                                  {tag}
                                </span>
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

            {!isResults && (
              <footer className="page-footer">
                {file ? (
                  <button
                    className={`submit-btn cassette-submit${file ? ' visible' : ''}`}
                    onClick={onSubmit}
                    disabled={!file || isDropping}
                  >
                    {isDropping ? <span className="spinner" /> : 'Find Songs'}
                  </button>
                ) : (
                  <p className="subtitle">
                    <TypingEffect text={randomQuote} speed={25} />
                  </p>
                )}
              </footer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}