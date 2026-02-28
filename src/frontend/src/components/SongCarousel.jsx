import { useState } from 'react';
import SongCard from './SongCard';

export default function SongCarousel({ songs, onBack }) {
  const [index, setIndex] = useState(0);

  function prev() { setIndex(i => Math.max(0, i - 1)); }
  function next() { setIndex(i => Math.min(songs.length - 1, i + 1)); }

  return (
    <div className="carousel">
      <SongCard
        key={songs[index].song_id}
        song={songs[index]}
        index={index}
        total={songs.length}
        onBack={onBack}
      />
      <nav className="carousel-nav">
        <button className="carousel-btn" onClick={prev} disabled={index === 0}>
          ◄ PREV
        </button>
        <div className="carousel-pips">
          {songs.map((_, i) => (
            <button
              key={i}
              className={`carousel-pip${i === index ? ' active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Track ${i + 1}`}
            />
          ))}
        </div>
        <button className="carousel-btn" onClick={next} disabled={index === songs.length - 1}>
          NEXT ►
        </button>
      </nav>
    </div>
  );
}
