import { useEffect, useState } from 'react';
import '../css/SongCard.css';

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+'.split('');

function useDecodeText(text, speed = 55, revealDelay = 28, startDelay = 0) {
  const [chars, setChars] = useState(() =>
    text.split('').map(c => ({
      original: c,
      display: /\w/.test(c) ? POOL[Math.floor(Math.random() * POOL.length)] : c,
    }))
  );

  useEffect(() => {
    let mounted = true;
    const maxIter = 8;

    text.split('').forEach((original, i) => {
      const delay = startDelay + i * revealDelay;

      if (!/\w/.test(original)) {
        setTimeout(() => {
          if (!mounted) return;
          setChars(prev => {
            const next = [...prev];
            next[i] = { ...next[i], display: original };
            return next;
          });
        }, delay);
        return;
      }

      let iteration = 0;
      setTimeout(() => {
        const iv = setInterval(() => {
          if (!mounted) { clearInterval(iv); return; }
          iteration++;
          const done = iteration >= maxIter;
          setChars(prev => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              display: done ? original : POOL[Math.floor(Math.random() * POOL.length)],
            };
            return next;
          });
          if (done) clearInterval(iv);
        }, speed);
      }, delay);
    });

    return () => { mounted = false; };
  }, []); // eslint-disable-line

  return chars;
}

export default function SongCard({ song, index, total, onBack }) {
  const titleChars = useDecodeText(song.title, 55, 28, 0);
  const artistText = song.year > 0 ? `${song.artist} · ${song.year}` : song.artist;
  const artistChars = useDecodeText(artistText, 38, 20, 420);

  return (
    <div className="song-card">
      <div className="song-card-header">
        <span className="song-card-track">
          TRACK {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
        <button className="song-card-back" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="song-card-divider" />

      <div className="song-card-body">
        <div className="song-card-title">
          {titleChars.map((c, i) => <span key={i}>{c.display}</span>)}
        </div>
        <div className="song-card-artist">
          {artistChars.map((c, i) => <span key={i}>{c.display}</span>)}
        </div>
        {song.artist_terms.length > 0 && (
          <div className="song-card-tags">
            {song.artist_terms.slice(0, 5).map(tag => (
              <span key={tag} className="song-tag">[{tag}]</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
