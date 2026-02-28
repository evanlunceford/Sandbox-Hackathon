import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import './TitleEffect.css';

const DECRYPT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';

export default function TitleEffect({
  text,
  speed = 50,
  revealDelay = 80,
  className = '',
}) {
  const [chars, setChars] = useState(() =>
    text.split('').map(c => ({ original: c, display: c === ' ' ? ' ' : '?', revealed: false }))
  );
  const [glitchActive, setGlitchActive] = useState(false);

  const containerRef = useRef(null);
  const hasRevealedRef = useRef(false);

  // ── Decrypt on view ──────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !hasRevealedRef.current) {
          hasRevealedRef.current = true;
          runReveal();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function runReveal() {
    const pool = DECRYPT_CHARS.split('');
    const maxIter = 10;

    text.split('').forEach((original, i) => {
      if (original === ' ') {
        setTimeout(() => {
          setChars(prev => {
            const next = [...prev];
            next[i] = { ...next[i], display: ' ', revealed: true };
            return next;
          });
        }, i * revealDelay);
        return;
      }

      let iteration = 0;

      setTimeout(() => {
        const interval = setInterval(() => {
          iteration++;
          const done = iteration >= maxIter;
          setChars(prev => {
            const next = [...prev];
            next[i] = {
              ...next[i],
              display: done ? original : pool[Math.floor(Math.random() * pool.length)],
              revealed: done,
            };
            return next;
          });
          if (done) clearInterval(interval);
        }, speed);
      }, i * revealDelay);
    });

    // Activate glitch once last character has fully revealed
    const totalMs = (text.length - 1) * revealDelay + maxIter * speed + 150;
    setTimeout(() => setGlitchActive(true), totalMs);
  }

  return (
    <motion.span
      ref={containerRef}
      data-text={text}
      className={`${className} ${glitchActive ? 'glitch' : ''}`.trim()}
      style={{ display: 'inline-block', whiteSpace: 'pre-wrap', position: 'relative' }}
    >
      {chars.map((c, i) => (
        <span key={i} style={{ display: 'inline-block' }}>
          {c.display}
        </span>
      ))}
    </motion.span>
  );
}
