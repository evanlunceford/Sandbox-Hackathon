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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const DROP_DURATION = 700;

const DESCRIPTION_PHRASES = [
  "The tradition is not the worship of ashes, but the preservation of fire. / Gustav Mahler",
  "I am a new man every morning. Each day I rediscover music. / Pablo Casals",
  "Music is the space between the notes. / Claude Debussy",
  "To achieve great things, two things are needed: a plan and not quite enough time. / Leonard Bernstein",
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
  const [introStep, setIntroStep] = useState(0);
  const inputRef = useRef(null);

  // Intro sequence: title renders → cassette fades up → subtitle + footer fade in
  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 1800); // after title reveal (~1.8s)
    const t2 = setTimeout(() => setIntroStep(2), 2700); // after cassette settles (+ ~0.9s)
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