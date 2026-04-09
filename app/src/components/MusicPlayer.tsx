import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  ChevronUp,
  ChevronDown,
  Video,
  Mic2,
  Maximize2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { Song, Lyrics } from '@/types';
import { LyricsDisplay } from './LyricsDisplay';

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLiked: boolean;
  lyrics: Lyrics | null;
  lyricsLoading: boolean;
  playlist: Song[];
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onLike: () => void;
  onSongSelect: (song: Song) => void;
  playerContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function MusicPlayer({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isLiked,
  lyrics,
  lyricsLoading,
  playlist,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onNext,
  onPrevious,
  onLike,
  onSongSelect,
  playerContainerRef,
}: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 liquid-glass-strong flex items-center justify-center text-white/40">
        <p>Search and play a song to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Expanded Player Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronDown className="w-6 h-6 text-white" />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowVideo(!showVideo);
                      setShowLyrics(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      showVideo ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'
                    }`}
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowLyrics(!showLyrics);
                      setShowVideo(false);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      showLyrics ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'
                    }`}
                  >
                    <Mic2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className={`p-2 rounded-full transition-colors ${
                      showPlaylist ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60'
                    }`}
                  >
                    <ListMusic className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Album Art / Video / Lyrics */}
                <div className="flex-1 flex items-center justify-center p-8">
                  {showVideo ? (
                    <div 
                      ref={playerContainerRef}
                      className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden"
                    />
                  ) : showLyrics ? (
                    <div className="w-full max-w-lg h-full">
                      {lyricsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      ) : (
                        <LyricsDisplay 
                          lyrics={lyrics} 
                          currentTime={currentTime}
                        />
                      )}
                    </div>
                  ) : (
                    <motion.div
                      className="relative"
                      animate={{ 
                        scale: isPlaying ? 1 : 0.95,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl animate-pulse-glow">
                        <img
                          src={currentSong.thumbnail}
                          alt={currentSong.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right: Playlist */}
                <AnimatePresence>
                  {showPlaylist && (
                    <motion.div
                      initial={{ x: 300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 300, opacity: 0 }}
                      className="w-80 liquid-glass-strong border-l border-white/10 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <h3 className="text-white font-semibold">Queue</h3>
                        <p className="text-white/50 text-sm">{playlist.length} songs</p>
                      </div>
                      <div className="overflow-y-auto h-full pb-32">
                        {playlist.map((song, index) => (
                          <div
                            key={song.youtubeId}
                            onClick={() => onSongSelect(song)}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                              song.youtubeId === currentSong.youtubeId ? 'bg-white/10' : ''
                            }`}
                          >
                            <span className="text-white/40 text-sm w-6">{index + 1}</span>
                            <img
                              src={song.thumbnail}
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${
                                song.youtubeId === currentSong.youtubeId ? 'text-white' : 'text-white/80'
                              }`}>
                                {song.title}
                              </p>
                              <p className="text-xs text-white/50 truncate">{song.artist}</p>
                            </div>
                            {song.youtubeId === currentSong.youtubeId && isPlaying && (
                              <div className="playing-indicator">
                                <span />
                                <span />
                                <span />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Controls */}
              <div className="p-6 pb-8">
                {/* Song Info */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{currentSong.title}</h2>
                    <p className="text-white/60">{currentSong.artist}</p>
                  </div>
                  <button
                    onClick={onLike}
                    className={`p-3 rounded-full hover:bg-white/10 transition-colors ${
                      isLiked ? 'text-red-500' : 'text-white/60'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="h-2 bg-white/10 rounded-full cursor-pointer group"
                  >
                    <motion.div
                      className="h-full bg-white rounded-full relative"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-white/50">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={onPrevious}
                    className="p-3 rounded-full hover:bg-white/10 text-white transition-colors"
                  >
                    <SkipBack className="w-6 h-6" fill="white" />
                  </button>

                  <motion.button
                    onClick={onPlayPause}
                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 text-black" fill="black" />
                    ) : (
                      <Play className="w-7 h-7 text-black ml-1" fill="black" />
                    )}
                  </motion.button>

                  <button
                    onClick={onNext}
                    className="p-3 rounded-full hover:bg-white/10 text-white transition-colors"
                  >
                    <SkipForward className="w-6 h-6" fill="white" />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={onMuteToggle}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => onVolumeChange(value[0])}
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Player Bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-20 liquid-glass-strong z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div className="h-full flex items-center px-4 gap-4">
          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronUp className="w-5 h-5 text-white/60" />
          </button>

          {/* Thumbnail */}
          <div 
            onClick={() => setIsExpanded(true)}
            className="relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer group"
          >
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Song Info */}
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex-1 min-w-0 cursor-pointer"
          >
            <p className="text-white font-medium truncate">{currentSong.title}</p>
            <p className="text-white/50 text-sm truncate">{currentSong.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors"
            >
              <SkipBack className="w-5 h-5" fill="white" />
            </button>

            <motion.button
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" fill="black" />
              ) : (
                <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
              )}
            </motion.button>

            <button
              onClick={onNext}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 transition-colors"
            >
              <SkipForward className="w-5 h-5" fill="white" />
            </button>
          </div>

          {/* Like & Volume */}
          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={onLike}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                isLiked ? 'text-red-500' : 'text-white/60'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onMuteToggle}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress Bar (thin line at top) */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
            <motion.div
              className="h-full bg-white"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
