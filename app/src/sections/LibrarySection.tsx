import { motion } from 'framer-motion';
import { Heart, Clock, Music, Trash2 } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import type { Song, Playlist } from '@/types';

interface LibrarySectionProps {
  type: 'liked' | 'recent' | 'playlists';
  playlistId?: string;
  likedSongs: Song[];
  recentSongs: { song: Song; playedAt: string }[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSongSelect: (song: Song) => void;
  onLike: (song: Song) => void;
  isLiked: (song: Song) => boolean;
  onDeletePlaylist?: (playlistId: string) => void;
}

export function LibrarySection({
  type,
  playlistId,
  likedSongs,
  recentSongs,
  playlists,
  currentSong,
  isPlaying,
  onSongSelect,
  onLike,
  isLiked,
  onDeletePlaylist,
}: LibrarySectionProps) {
  const getContent = () => {
    switch (type) {
      case 'liked':
        return {
          title: 'Liked Songs',
          icon: Heart,
          subtitle: `${likedSongs.length} songs`,
          songs: likedSongs,
          emptyMessage: 'Songs you like will appear here',
          emptyIcon: Heart,
        };
      case 'recent':
        return {
          title: 'Recently Played',
          icon: Clock,
          subtitle: `${recentSongs.length} songs`,
          songs: recentSongs.map((r) => r.song),
          emptyMessage: 'Your recently played songs will appear here',
          emptyIcon: Clock,
        };
      case 'playlists':
        const playlist = playlists.find((p) => p._id === playlistId);
        return {
          title: playlist?.name || 'Playlist',
          icon: Music,
          subtitle: `${playlist?.songs?.length || 0} songs`,
          songs: playlist?.songs || [],
          emptyMessage: 'Add songs to this playlist',
          emptyIcon: Music,
          showDelete: true,
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <div className="p-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end gap-6 mb-8"
      >
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center liquid-glass-card">
          <Icon className="w-20 h-20 md:w-28 md:h-28 text-white/80" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-white/50 uppercase tracking-wider mb-2">Playlist</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{content.title}</h1>
          <p className="text-white/60">{content.subtitle}</p>
        </div>
        {content.showDelete && playlistId && onDeletePlaylist && (
          <motion.button
            onClick={() => onDeletePlaylist(playlistId)}
            className="p-3 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        )}
      </motion.div>

      {/* Songs List */}
      {content.songs.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {content.songs.map((song, index) => (
            <motion.div
              key={song.youtubeId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <SongCard
                song={song}
                variant="list"
                index={index + 1}
                isCurrentSong={currentSong?.youtubeId === song.youtubeId}
                isPlaying={isPlaying}
                isLiked={isLiked(song)}
                onPlay={() => onSongSelect(song)}
                onLike={() => onLike(song)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Icon className="w-12 h-12 text-white/30" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{content.emptyMessage}</h3>
          <p className="text-white/50 text-center max-w-md">
            Start exploring and building your music collection
          </p>
        </motion.div>
      )}
    </div>
  );
}
