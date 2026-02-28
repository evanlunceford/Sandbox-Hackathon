import { useEffect, useState } from 'react';
import './TypingEffect.css';

export default function TypingEffect({ text, speed = 28, className = '' }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={`typing-effect ${className}`}>
      {displayed}
      {!done && <span className="typing-cursor" />}
    </span>
  );
}
