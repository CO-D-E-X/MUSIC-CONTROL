import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); 
  
  const audioRef = useRef(new Audio());
  const analyzerRef = useRef(null);
  const contextRef = useRef(null);
  const sourceRef = useRef(null);

  const initVisualizer = useCallback(() => {
    if (!contextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      contextRef.current = new AudioContext();
      analyzerRef.current = contextRef.current.createAnalyser();
      sourceRef.current = contextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyzerRef.current);
      analyzerRef.current.connect(contextRef.current.destination);
      analyzerRef.current.fftSize = 256;
    }
    if (contextRef.current.state === 'suspended') {
      contextRef.current.resume();
    }
  }, []);

  const playTrackInternal = useCallback((track, index) => {
    initVisualizer();
    if (!track) return;

    if (audioRef.current.src.includes(`/api/stream/${track.id}`)) {
       audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.src = `/api/stream/${track.id}`;
      audioRef.current.load();
      audioRef.current.play().catch(err => console.error("Playback failed:", err));
    }
    
    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPlaying(true);
  }, [initVisualizer]);

  const togglePlay = useCallback(() => {
    initVisualizer();
    if (audioRef.current.src) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [initVisualizer]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx = currentIndex + 1;
    
    if (nextIdx < queue.length) {
      playTrackInternal(queue[nextIdx], nextIdx);
    } else if (repeatMode === 'all') {
      playTrackInternal(queue[0], 0);
    } else {
      setIsPlaying(false);
      audioRef.current.pause();
      setProgress(0);
    }
  }, [queue, currentIndex, repeatMode, playTrackInternal]);

  const prevTrack = useCallback(() => {
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      playTrackInternal(queue[prevIdx], prevIdx);
    }
  }, [currentIndex, queue, playTrackInternal]);

  const playTrack = useCallback((track, newQueue = null) => {
    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex(t => t.id === track.id);
      playTrackInternal(track, index);
    } else {
      const index = queue.findIndex(t => t.id === track.id);
      if (index !== -1) {
        playTrackInternal(track, index);
      } else {
        const q = [track];
        setQueue(q);
        playTrackInternal(track, 0);
      }
    }
  }, [queue, playTrackInternal]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.crossOrigin = "anonymous";

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextTrack, repeatMode]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const addToQueue = (track) => {
    setQueue(prev => [...prev, track]);
    if (currentIndex === -1) {
      playTrack(track, [track]);
    }
  };

  const playNext = (track) => {
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    setQueue(newQueue);
    if (currentIndex === -1) {
      playTrack(track, newQueue);
    }
  };

  const reorderQueue = (fromIndex, toIndex) => {
    const newQueue = [...queue];
    const [removed] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, removed);
    setQueue(newQueue);
    
    if (currentIndex === fromIndex) {
      setCurrentIndex(toIndex);
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const removeFromQueue = (index) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);

    if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    } else if (index === currentIndex) {
      if (newQueue.length > 0) {
        const nextIdx = Math.min(index, newQueue.length - 1);
        playTrackInternal(newQueue[nextIdx], nextIdx);
      } else {
        audioRef.current.pause();
        setCurrentTrack(null);
        setIsPlaying(false);
        setCurrentIndex(-1);
      }
    }
  };

  const toggleShuffle = () => {
    if (!isShuffle) {
      const remaining = queue.slice(currentIndex + 1);
      const shuffled = [...remaining].sort(() => Math.random() - 0.5);
      const newQueue = [...queue.slice(0, currentIndex + 1), ...shuffled];
      setQueue(newQueue);
    }
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const seek = (percent) => {
    const time = (percent / 100) * audioRef.current.duration;
    if (!isNaN(time)) {
      audioRef.current.currentTime = time;
      setProgress(percent);
    }
  };

  return {
    isPlaying, currentTrack, queue, currentIndex, progress, currentTime, duration,
    volume, setVolume, isShuffle, repeatMode,
    playTrack, addToQueue, playNext, reorderQueue, removeFromQueue, toggleShuffle, toggleRepeat, togglePlay, nextTrack, prevTrack, seek,
    analyzer: analyzerRef.current
  };
}
