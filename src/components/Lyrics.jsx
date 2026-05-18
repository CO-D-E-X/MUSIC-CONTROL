import React, { useState, useEffect, useRef } from 'react';

export default function Lyrics({ trackId, currentTime }) {
  const [lyrics, setLyrics] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!trackId) return;

    fetch(`/api/lyrics/${trackId}`)
      .then(res => res.json())
      .then(data => {
        if (data.lyrics) {
          const lines = data.lyrics.split('\n').map(line => {
            const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
            if (match) {
              const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
              return { time, text: match[3].trim() };
            }
            return null;
          }).filter(l => l && l.text);
          setLyrics(lines);
        } else {
          setLyrics([]);
        }
      })
      .catch(() => setLyrics([]));
  }, [trackId]);

  useEffect(() => {
    const activeLine = lyrics.findLastIndex(l => l.time <= currentTime);
    if (activeLine !== -1 && containerRef.current) {
      const el = containerRef.current.children[activeLine];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, lyrics]);

  if (lyrics.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 p-8 overflow-y-auto h-full scrollbar-hide" ref={containerRef}>
      {lyrics.map((line, i) => {
        const isActive = i === lyrics.findLastIndex(l => l.time <= currentTime);
        return (
          <p 
            key={i} 
            className={`text-2xl font-bold transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-white/20'}`}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
}
