import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Search, Music, Library, 
  ListMusic, Mic2, Maximize2, Settings, Plus, MoreVertical, X, Trash2, 
  Shuffle, Repeat, Repeat1, Clock, LayoutGrid, List, ChevronLeft, ChevronRight,
  ListPlus, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import Visualizer from './components/Visualizer';
import Lyrics from './components/Lyrics';

function App() {
  const [library, setLibrary] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [search, setSearch] = useState('');
  const [showLyrics, setShowLyrics] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [notification, setNotification] = useState(null);

  const { 
    isPlaying, currentTrack, queue, currentIndex, progress, currentTime, duration,
    volume, setVolume, isShuffle, repeatMode,
    playTrack, addToQueue, playNext, reorderQueue, removeFromQueue, 
    toggleShuffle, toggleRepeat, togglePlay, nextTrack, prevTrack, seek, analyzer
  } = useAudioPlayer();

  useEffect(() => {
    fetch('/api/library').then(res => res.json()).then(setLibrary);
    fetch('/api/playlists').then(res => res.json()).then(setPlaylists);
  }, []);

  const filteredTracks = useMemo(() => 
    library.filter(track => 
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.artist.toLowerCase().includes(search.toLowerCase())
    ), [library, search]
  );

  const notify = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2000);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-[#020202] text-white font-sans overflow-hidden select-none">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col bg-black border-r border-white/5 p-6 gap-8 z-20">
        <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => setActiveTab('library')}>
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Music size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic">CODEX</h1>
        </div>
        
        <nav className="space-y-1">
          <SidebarItem active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<Library size={20}/>} label="Home" />
          <SidebarItem active={activeTab === 'queue'} onClick={() => setActiveTab('queue')} icon={<ListMusic size={20}/>} label="Queue" count={queue.length} />
        </nav>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Playlists</span>
            <button className="hover:text-indigo-400 transition-colors p-1"><Plus size={16}/></button>
          </div>
          <div className="space-y-1">
            {playlists.map(p => (
              <button 
                key={p.id} 
                onClick={() => { setActiveTab('playlists'); setSelectedPlaylist(p); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${activeTab === 'playlists' && selectedPlaylist?.id === p.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'playlists' && selectedPlaylist?.id === p.id ? 'bg-indigo-500 scale-125' : 'bg-white/10 group-hover:bg-white/30'}`} />
                <span className="truncate font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {currentTrack && (
          <div className="mt-auto p-2 bg-white/5 rounded-2xl border border-white/5 shadow-2xl cursor-pointer" onClick={() => setShowLyrics(true)}>
            <div className="aspect-square rounded-xl overflow-hidden mb-3 relative group">
              <img src={currentTrack.artUrl || 'https://via.placeholder.com/300?text=No+Art'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="px-1">
              <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
              <p className="text-[10px] text-white/40 truncate font-semibold uppercase tracking-wider">{currentTrack.artist}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-b from-indigo-950/10 to-black">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 text-white/20">
              <ChevronLeft size={20}/>
              <ChevronRight size={20}/>
            </div>
            <div className="relative ml-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                placeholder="Search tracks..."
                className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-6 w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 transition-all text-sm font-medium placeholder:text-white/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-2.5 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all hover:bg-white/10">
              {viewMode === 'grid' ? <List size={20}/> : <LayoutGrid size={20}/>}
            </button>
          </div>
        </header>

        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-32 left-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[100] flex items-center gap-3 pointer-events-none"
            >
              <CheckCircle2 size={18}/>
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-20 pb-32 px-8">
          {activeTab === 'library' && (
            <div className="animate-in fade-in duration-700">
              <div className="relative h-64 rounded-[2rem] overflow-hidden mb-12 bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 flex flex-col justify-end shadow-2xl shadow-indigo-900/20">
                <h2 className="text-7xl font-black tracking-tighter mb-2 italic">CODEX</h2>
                <p className="text-lg font-bold text-white/40 tracking-widest uppercase">Slide to Manage Queue</p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {filteredTracks.map(t => (
                    <TrackCard key={t.id} track={t} isPlaying={currentTrack?.id === t.id && isPlaying} onPlay={() => playTrack(t, filteredTracks)} onAddQueue={() => { addToQueue(t); notify('Added to Queue'); }} />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-4 px-6 py-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border-b border-white/5 mb-6">
                    <span className="w-10 text-center">#</span>
                    <span className="flex-1">Track</span>
                    <span className="w-24 text-right">Time</span>
                  </div>
                  {filteredTracks.map((t, i) => (
                    <SwipeableTrack 
                      key={t.id} 
                      track={t} 
                      index={i}
                      isCurrent={currentTrack?.id === t.id}
                      isPlaying={isPlaying}
                      onPlay={() => playTrack(t, filteredTracks)}
                      onSwipeRight={() => { addToQueue(t); notify('Added to Queue'); }}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="animate-in fade-in duration-700 max-w-4xl mx-auto">
              <h2 className="text-6xl font-black tracking-tighter mb-12 italic uppercase">Queue</h2>
              
              <div className="space-y-12">
                <section>
                  <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-6 px-4">Now Playing</h3>
                  {currentTrack && <SwipeableTrack track={currentTrack} isCurrent isPlaying={isPlaying} formatTime={formatTime} hideSwipe hideNumber />}
                </section>

                <section>
                  <h3 className="text-xs font-black text-white/20 uppercase tracking-widest mb-6 px-4">Next Up</h3>
                  <div className="space-y-1">
                    <AnimatePresence initial={false}>
                      {queue.slice(currentIndex + 1).map((t, i) => (
                        <SwipeableTrack 
                          key={`${t.id}-${i + currentIndex + 1}`} 
                          track={t} 
                          index={i + currentIndex + 1}
                          onSwipeLeft={() => { removeFromQueue(i + currentIndex + 1); notify('Removed from Queue'); }}
                          formatTime={formatTime}
                          isQueue
                          hideNumber
                        />
                      ))}
                    </AnimatePresence>
                    {queue.length <= currentIndex + 1 && (
                      <div className="p-12 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center gap-4 text-white/10">
                        <ListPlus size={48}/>
                        <p className="font-bold uppercase tracking-widest text-xs">Nothing in Queue</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Player Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-28 bg-black/95 backdrop-blur-2xl border-t border-white/5 px-8 flex items-center z-50">
        <div className="w-[30%] flex items-center gap-6">
          {currentTrack && (
            <>
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl">
                <img src={currentTrack.artUrl} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-base truncate mb-1">{currentTrack.title}</h4>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate">{currentTrack.artist}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-4 max-w-3xl">
          <div className="flex items-center gap-10">
            <button onClick={toggleShuffle} className={`transition-all ${isShuffle ? 'text-indigo-400 scale-110' : 'text-white/20 hover:text-white'}`}><Shuffle size={20}/></button>
            <button onClick={prevTrack} className="text-white/40 hover:text-white transition-all transform active:scale-75"><SkipBack size={32} fill="currentColor"/></button>
            <button onClick={togglePlay} className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-all">
              {isPlaying ? <Pause size={28} fill="black"/> : <Play size={28} className="ml-1" fill="black"/>}
            </button>
            <button onClick={nextTrack} className="text-white/40 hover:text-white transition-all transform active:scale-75"><SkipForward size={32} fill="currentColor"/></button>
            <button onClick={toggleRepeat} className={`relative transition-all ${repeatMode !== 'none' ? 'text-indigo-400 scale-110' : 'text-white/20 hover:text-white'}`}>
              {repeatMode === 'one' ? <Repeat1 size={20}/> : <Repeat size={20}/>}
            </button>
          </div>
          <div className="w-full flex items-center gap-4 group/progress px-4">
            <span className="text-[10px] font-black text-white/20 w-12 text-right tabular-nums tracking-tighter">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full cursor-pointer relative overflow-hidden" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const p = (e.clientX - rect.left) / rect.width;
                seek(p * 100);
            }}>
              <div className="absolute inset-y-0 left-0 bg-white rounded-full group-hover/progress:bg-indigo-400" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] font-black text-white/20 w-12 tabular-nums tracking-tighter">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="w-[30%] flex justify-end items-center gap-6">
          <Visualizer analyzer={analyzer} isPlaying={isPlaying} />
          <div className="flex items-center gap-4 ml-4 group">
            <Volume2 size={20} className="text-white/20 group-hover:text-white" />
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 accent-white h-1 bg-white/10 rounded-full appearance-none cursor-pointer" />
          </div>
        </div>
      </footer>

      {/* Full-screen Lyrics */}
      <AnimatePresence>
        {showLyrics && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-black p-12 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl">
                  <img src={currentTrack?.artUrl} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-4xl font-black italic">{currentTrack?.title}</h3>
                  <p className="text-lg font-bold text-white/30 uppercase tracking-[0.2em]">{currentTrack?.artist}</p>
                </div>
              </div>
              <button onClick={() => setShowLyrics(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all"><X size={32}/></button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Lyrics trackId={currentTrack?.id} currentTime={currentTime} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwipeableTrack({ track, index, isCurrent, isPlaying, onPlay, onSwipeRight, onSwipeLeft, formatTime, hideSwipe, hideNumber }) {
  const x = useMotionValue(0);
  const rightOpacity = useTransform(x, [20, 100], [0, 1]);
  const leftOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 80 && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -80 && onSwipeLeft) {
      onSwipeLeft();
    }
    animate(x, 0, { type: 'spring', bounce: 0, duration: 0.3 });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-1 bg-white/[0.02]">
      {onSwipeRight && (
        <motion.div 
          style={{ opacity: rightOpacity }}
          className="absolute inset-0 bg-indigo-600 flex items-center justify-end px-8 z-0"
        >
          <div className="flex items-center gap-3">
            <span className="font-black text-xs uppercase italic">Add to Queue</span>
            <ListPlus size={24}/>
          </div>
        </motion.div>
      )}
      {onSwipeLeft && (
        <motion.div 
          style={{ opacity: leftOpacity }}
          className="absolute inset-0 bg-red-600 flex items-center justify-start px-8 z-0"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={24}/>
            <span className="font-black text-xs uppercase italic">Remove</span>
          </div>
        </motion.div>
      )}
      <motion.div
        drag={hideSwipe ? false : "x"}
        dragConstraints={{ left: onSwipeLeft ? -100 : 0, right: onSwipeRight ? 100 : 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={onPlay}
        className={`relative z-10 flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer ${isCurrent ? 'bg-white/10' : 'bg-[#020202] hover:bg-white/[0.04]'}`}
      >
        <span className="w-10 text-center font-black text-xs text-white/10">
          {isCurrent && isPlaying ? (
            <div className="flex gap-0.5 justify-center items-end h-3">
              <div className="w-1 bg-indigo-500 animate-[bounce_0.6s_infinite]" style={{height: '60%'}}></div>
              <div className="w-1 bg-indigo-500 animate-[bounce_0.8s_infinite]" style={{height: '100%'}}></div>
              <div className="w-1 bg-indigo-500 animate-[bounce_1s_infinite]" style={{height: '40%'}}></div>
            </div>
          ) : !hideNumber && index !== undefined ? index + 1 : <Music size={14}/>}
        </span>
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
          <img src={track.artUrl} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-black text-sm truncate uppercase tracking-tight ${isCurrent ? 'text-indigo-400' : 'text-white'}`}>{track.title}</h4>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{track.artist}</p>
        </div>
        <div className="text-right font-black text-xs text-white/20 tabular-nums">
          {formatTime(track.duration)}
        </div>
      </motion.div>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick, count }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
      <div className={active ? 'scale-110' : ''}>{icon}</div>
      <span className="font-black text-sm uppercase tracking-widest">{label}</span>
      {count > 0 && <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-black/20 text-white' : 'bg-indigo-600 text-white'}`}>{count}</span>}
    </button>
  );
}

function TrackCard({ track, isPlaying, onPlay, onAddQueue }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="group bg-white/[0.03] p-5 rounded-[2rem] hover:bg-white/[0.07] transition-all duration-500 cursor-pointer border border-white/5 relative">
      <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-5 relative shadow-2xl">
        <img src={track.artUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div onClick={(e) => { e.stopPropagation(); onPlay(); }} className="w-16 h-16 bg-white text-black rounded-3xl flex items-center justify-center shadow-2xl">
            {isPlaying ? <Pause size={32} fill="black"/> : <Play size={32} fill="black" className="ml-1"/>}
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); onAddQueue(); }} className="p-3 bg-black/80 backdrop-blur-md rounded-2xl text-white/60 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"><ListPlus size={18}/></button>
      </div>
      <h4 className="font-black truncate text-base mb-1 uppercase tracking-tight">{track.title}</h4>
      <p className="text-xs text-white/30 font-bold truncate uppercase tracking-widest">{track.artist}</p>
    </motion.div>
  );
}

export default App;
