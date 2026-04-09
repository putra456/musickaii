import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { Sidebar } from '@/components/Sidebar';
import { MusicPlayer } from '@/components/MusicPlayer';
import { HomeSection } from '@/sections/HomeSection';
import { SearchSection } from '@/sections/SearchSection';
import { LibrarySection } from '@/sections/LibrarySection';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useUser, useRecommendations, useLyrics, useLocalStorage } from '@/hooks/useApi';
import type { Song } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// YouTube Player State Constants
const PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

function App() {
  // State
  const [activeTab, setActiveTab] = useState('home');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useLocalStorage('kaii_volume', 80);
  const [isMuted, setIsMuted] = useState(false);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState<Song | null>(null);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);

  // Hooks
  const {
    containerRef,
    createPlayer,
    playVideo,
    pauseVideo,
    seekTo,
    getCurrentTime,
    getDuration,
    setVolume: setPlayerVolume,
    mute,
    unMute,
  } = useYouTubePlayer();

  const { user, fetchUser, likeSong, addToHistory, createPlaylist, addToPlaylist } = useUser();
  const { recommendations, getRecommendations } = useRecommendations();
  const { lyrics, loading: lyricsLoading, fetchLyrics, clearLyrics } = useLyrics();

  // Refs
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Get AI recommendations when user data is available
  useEffect(() => {
    if (user?.listeningPattern) {
      getRecommendations(user.listeningPattern);
    }
  }, [user, getRecommendations]);

  // Progress tracking
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        const time = getCurrentTime();
        const dur = getDuration();
        setCurrentTime(time);
        setDuration(dur);
      }, 500);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, getCurrentTime, getDuration]);

  // Handle song selection
  const handleSongSelect = useCallback((song: Song) => {
    if (currentSong?.youtubeId === song.youtubeId) {
      // Toggle play/pause for same song
      if (isPlaying) {
        pauseVideo();
        setIsPlaying(false);
      } else {
        playVideo();
        setIsPlaying(true);
      }
      return;
    }

    // New song
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    clearLyrics();

    // Create player or load new video
    createPlayer(song.youtubeId, {
      onReady: (player) => {
        player.playVideo();
        player.setVolume(volume);
        if (isMuted) player.mute();
      },
      onStateChange: (event) => {
        switch (event.data) {
          case PLAYER_STATE.PLAYING:
            setIsPlaying(true);
            break;
          case PLAYER_STATE.PAUSED:
            setIsPlaying(false);
            break;
          case PLAYER_STATE.ENDED:
            handleNext();
            break;
        }
      },
    });

    // Fetch lyrics
    fetchLyrics(song.title, song.artist);

    // Add to history
    addToHistory(song, 0, song.genre, song.artist);

    // Add to playlist if not exists
    setPlaylist((prev) => {
      if (!prev.find((s) => s.youtubeId === song.youtubeId)) {
        return [...prev, song];
      }
      return prev;
    });
  }, [currentSong, isPlaying, volume, isMuted, createPlayer, playVideo, pauseVideo, clearLyrics, fetchLyrics, addToHistory]);

  // Play/Pause toggle
  const handlePlayPause = useCallback(() => {
    if (!currentSong) return;

    if (isPlaying) {
      pauseVideo();
      setIsPlaying(false);
    } else {
      playVideo();
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying, playVideo, pauseVideo]);

  // Seek
  const handleSeek = useCallback((time: number) => {
    seekTo(time);
    setCurrentTime(time);
  }, [seekTo]);

  // Volume change
  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    setPlayerVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
      unMute?.();
    }
  }, [setVolume, setPlayerVolume, isMuted, unMute]);

  // Mute toggle
  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      unMute?.();
      setIsMuted(false);
    } else {
      mute?.();
      setIsMuted(true);
    }
  }, [isMuted, mute, unMute]);

  // Next song
  const handleNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (playlistIndex + 1) % playlist.length;
    setPlaylistIndex(nextIndex);
    handleSongSelect(playlist[nextIndex]);
  }, [playlist, playlistIndex, handleSongSelect]);

  // Previous song
  const handlePrevious = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = playlistIndex === 0 ? playlist.length - 1 : playlistIndex - 1;
    setPlaylistIndex(prevIndex);
    handleSongSelect(playlist[prevIndex]);
  }, [playlist, playlistIndex, handleSongSelect]);

  // Like song
  const handleLike = useCallback(async (song: Song) => {
    const liked = await likeSong(song);
    toast(liked ? 'Added to Liked Songs' : 'Removed from Liked Songs', {
      description: song.title,
    });
  }, [likeSong]);

  // Check if song is liked
  const isLiked = useCallback((song: Song) => {
    return user?.likedSongs?.some((s) => s.youtubeId === song.youtubeId) || false;
  }, [user]);

  // Create playlist
  const handleCreatePlaylist = useCallback(async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setIsCreatePlaylistOpen(false);
    toast('Playlist created', { description: newPlaylistName });
  }, [newPlaylistName, createPlaylist]);

  // Add to playlist
  const handleAddToPlaylist = useCallback(async (playlistId: string) => {
    if (!selectedSongForPlaylist) return;
    await addToPlaylist(playlistId, selectedSongForPlaylist);
    setIsAddToPlaylistOpen(false);
    setSelectedSongForPlaylist(null);
    toast('Added to playlist', { description: selectedSongForPlaylist.title });
  }, [selectedSongForPlaylist, addToPlaylist]);

  // Open add to playlist dialog
  const openAddToPlaylist = useCallback((song: Song) => {
    setSelectedSongForPlaylist(song);
    setIsAddToPlaylistOpen(true);
  }, []);

  // Render content based on active tab
  const renderContent = () => {
    const [tabType, tabId] = activeTab.split(':');

    switch (tabType) {
      case 'home':
        return (
          <HomeSection
            onSongSelect={handleSongSelect}
            recentSongs={user?.listeningHistory || []}
            likedSongs={user?.likedSongs || []}
            recommendations={recommendations}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onLike={handleLike}
            isLiked={isLiked}
          />
        );
      case 'search':
        return (
          <SearchSection
            onSongSelect={handleSongSelect}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onLike={handleLike}
            isLiked={isLiked}
            onAddToPlaylist={openAddToPlaylist}
          />
        );
      case 'liked':
        return (
          <LibrarySection
            type="liked"
            likedSongs={user?.likedSongs || []}
            recentSongs={[]}
            playlists={[]}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSongSelect={handleSongSelect}
            onLike={handleLike}
            isLiked={isLiked}
          />
        );
      case 'recent':
        return (
          <LibrarySection
            type="recent"
            likedSongs={[]}
            recentSongs={user?.listeningHistory || []}
            playlists={[]}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSongSelect={handleSongSelect}
            onLike={handleLike}
            isLiked={isLiked}
          />
        );
      case 'playlist':
        return (
          <LibrarySection
            type="playlists"
            playlistId={tabId}
            likedSongs={[]}
            recentSongs={[]}
            playlists={user?.playlists || []}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSongSelect={handleSongSelect}
            onLike={handleLike}
            isLiked={isLiked}
          />
        );
      default:
        return (
          <HomeSection
            onSongSelect={handleSongSelect}
            recentSongs={user?.listeningHistory || []}
            likedSongs={user?.likedSongs || []}
            recommendations={recommendations}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onLike={handleLike}
            isLiked={isLiked}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 20, 0.9)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />

      {/* Hidden YouTube Player Container */}
      <div ref={containerRef} className="youtube-hidden" />

      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          playlists={user?.playlists?.map((p) => ({ _id: p._id, name: p.name })) || []}
          onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      </main>

      {/* Music Player */}
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isLiked={currentSong ? isLiked(currentSong) : false}
        lyrics={lyrics}
        lyricsLoading={lyricsLoading}
        playlist={playlist}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onLike={() => currentSong && handleLike(currentSong)}
        onSongSelect={handleSongSelect}
        playerContainerRef={containerRef}
      />

      {/* Create Playlist Dialog */}
      <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
        <DialogContent className="liquid-glass-strong border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsCreatePlaylistOpen(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                className="bg-white text-black hover:bg-white/90"
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add to Playlist Dialog */}
      <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
        <DialogContent className="liquid-glass-strong border-white/10 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add to Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            {user?.playlists?.length === 0 ? (
              <p className="text-white/50 text-center py-4">No playlists yet. Create one first!</p>
            ) : (
              user?.playlists?.map((playlist) => (
                <button
                  key={playlist._id}
                  onClick={() => handleAddToPlaylist(playlist._id)}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-xl">🎵</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{playlist.name}</p>
                    <p className="text-white/50 text-sm">{playlist.songs?.length || 0} songs</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
