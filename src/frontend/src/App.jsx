import { useRef, useState, useEffect } from 'react';
import './css/App.css';
import './css/CRTScreen.css';
import './css/SongCard.css';
import './css/DropZone.css';
import './css/SubmitButton.css';
import CassettePlayer from './components/CassettePlayer';
import TitleEffect from './components/TitleEffect';
import TypingEffect from './components/TypingEffect';
import SongCarousel from './components/SongCarousel';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const DROP_DURATION = 700;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const SESSION_LIMIT = 10;

const DESCRIPTION_PHRASES = [
  "Music can change the world because it can change people. / Bono",
  "Without music, life would be a mistake. / Friedrich Nietzsche",
  "Music expresses that which cannot be put into words and that which cannot remain silent. / Victor Hugo",
  "One good thing about music, when it hits you, you feel no pain. / Bob Marley",
  "Where words fail, music speaks. / Hans Christian Andersen",
  "Music is the strongest form of magic. / Marilyn Manson",
  "If I cannot fly, let me sing. / Stephen Sondheim",
  "The only truth is music. / Jack Kerouac",
  "Music acts like a magic key, to which the most tightly closed heart opens. / Maria von Trapp"
];

export default function App() {
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [randomQuote, setRandomQuote] = useState('');
  const [introStep, setIntroStep] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 1800);
    const t2 = setTimeout(() => setIntroStep(2), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setError(`PDF must be under ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
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

    const sessionCount = parseInt(sessionStorage.getItem('submitCount') || '0', 10);
    if (sessionCount >= SESSION_LIMIT) {
      setError('Session upload limit reached. Please open a new tab to continue.');
      return;
    }

    setPhase('dropping');
    setError(null);
    sessionStorage.setItem('submitCount', String(sessionCount + 1));

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

  const onBack = () => {
    setPhase('idle');
    setFile(null);
    setResults(null);
    setError(null);
    setIntroStep(2);
  };

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
                  {introStep >= 1 && <p className="subtitle subtitle-intro">Not an LLM</p>}
                </>
              )}
            </header>

            <main className="main">
              {error && <p className="error">{error}</p>}

              {!isResults && (
                <div className={`cassette-area${introStep >= 2 ? ' cassette-entered' : ''}${isDropping ? ' dropping' : ''}`}>
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
                <SongCarousel songs={results} onBack={onBack}/>
              )}
            </main>

            {!isResults && introStep >= 1 && (
              <footer className="page-footer footer-intro">
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