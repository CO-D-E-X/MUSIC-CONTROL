import React, { useEffect, useRef } from 'react';

export default function Visualizer({ analyzer, isPlaying }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!analyzer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const r = 79;
        const g = 70;
        const b = 229;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${isPlaying ? 0.8 : 0.2})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [analyzer, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-12 opacity-50 pointer-events-none"
      width={300}
      height={50}
    />
  );
}
