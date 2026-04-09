import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Music, Radio } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import type { Song } from '@/types';

interface HomeSectionProps {
  onSongSelect: (song: Song) => void;
  recentSongs: { song: Song; playedAt: string }[];
  likedSongs: Song[];
  recommendations: { title: string; artist: string }[];
  currentSong: Song | null;
  isPlaying: boolean;
  onLike: (song: Song) => void;
  isLiked: (song: Song) => boolean;
}

const quickPicks = [
  { title: 'Chill Vibes', icon: Music, color: 'from-purple-500/20 to-blue-500/20' },
  { title: 'Trending Now', icon: TrendingUp, color: 'from-red-500/20 to-orange-500/20' },
  { title: 'Discover Weekly', icon: Sparkles, color: 'from-green-500/20 to-teal-500/20' },
  { title: 'Live Radio', icon: Radio, color: 'from-pink-500/20 to-rose-500/20' },
];

export function HomeSection({
  onSongSelect,
  recentSongs,
  likedSongs,
  recommendations,
  currentSong,
  isPlaying,
  onLike,
  isLiked,
}: HomeSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="p-8 pb-32 space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold text-white mb-2">
          Good <span className="gradient-text">Evening</span>
        </h1>
        <p className="text-white/50">Ready to discover your next favorite song?</p>
      </motion.div>

      {/* Quick Picks */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Picks</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickPicks.map((pick) => {
            const Icon = pick.icon;
            return (
              <motion.div
                key={pick.title}
                className={`p-4 rounded-xl liquid-glass-card cursor-pointer bg-gradient-to-br ${pick.color}`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-8 h-8 text-white mb-3" />
                <p className="text-white font-medium">{pick.title}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recently Played</h2>
            <button className="text-sm text-white/50 hover:text-white transition-colors">
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentSongs.slice(0, 5).map(({ song }) => (
              <SongCard
                key={song.youtubeId}
                song={song}
                isCurrentSong={currentSong?.youtubeId === song.youtubeId}
                isPlaying={isPlaying}
                isLiked={isLiked(song)}
                onPlay={() => onSongSelect(song)}
                onLike={() => onLike(song)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Liked Songs Preview */}
      {likedSongs.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Your Favorites</h2>
            <button className="text-sm text-white/50 hover:text-white transition-colors">
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {likedSongs.slice(0, 5).map((song) => (
              <SongCard
                key={song.youtubeId}
                song={song}
                isCurrentSong={currentSong?.youtubeId === song.youtubeId}
                isPlaying={isPlaying}
                isLiked={true}
                onPlay={() => onSongSelect(song)}
                onLike={() => onLike(song)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Recommended For You
            </h2>
            <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">
              AI Powered
            </span>
          </div>
          <div className="liquid-glass-card p-6">
            <p className="text-white/60 mb-4">
              Based on your listening patterns, you might enjoy these songs:
            </p>
            <div className="flex flex-wrap gap-3">
              {recommendations.map((rec, index) => (
                <motion.button
                  key={index}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Search for this recommendation
                  }}
                >
                  {rec.title} - {rec.artist}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {recentSongs.length === 0 && likedSongs.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Music className="w-12 h-12 text-white/30" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Start Your Journey</h3>
          <p className="text-white/50 max-w-md">
            Search for your favorite songs, artists, or discover new music. Your recently played tracks will appear here.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
