import { motion } from 'framer-motion';
import { Play, Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Song } from '@/types';

interface SongCardProps {
  song: Song;
  isPlaying?: boolean;
  isCurrentSong?: boolean;
  isLiked?: boolean;
  onPlay: () => void;
  onLike?: () => void;
  onAddToPlaylist?: () => void;
  variant?: 'default' | 'compact' | 'list';
  index?: number;
}

export function SongCard({
  song,
  isPlaying,
  isCurrentSong,
  isLiked,
  onPlay,
  onLike,
  onAddToPlaylist,
  variant = 'default',
  index,
}: SongCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (variant === 'list') {
    return (
      <motion.div
        className={`group flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer ${
          isCurrentSong ? 'bg-white/10' : 'hover:bg-white/5'
        }`}
        onClick={onPlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ x: 4 }}
      >
        <div className="w-8 text-center text-white/40 text-sm">
          {isCurrentSong && isPlaying ? (
            <div className="playing-indicator justify-center">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <span className="group-hover:hidden">{index}</span>
          )}
          <Play className="w-4 h-4 mx-auto hidden group-hover:block text-white" />
        </div>

        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-12 h-12 rounded object-cover"
        />

        <div className="flex-1 min-w-0">
          <p className={`truncate ${isCurrentSong ? 'text-white' : 'text-white/90'}`}>
            {song.title}
          </p>
          <p className="text-sm text-white/50 truncate">{song.artist}</p>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onLike && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                isLiked ? 'text-red-500' : 'text-white/60'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          )}
          {onAddToPlaylist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
        onClick={onPlay}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <img
            src={song.thumbnail}
            alt={song.title}
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm truncate">{song.title}</p>
          <p className="text-white/50 text-xs truncate">{song.artist}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="song-card group"
      onClick={onPlay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 text-black ml-1" fill="black" />
          </motion.button>
        </motion.div>
        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-2 right-2 equalizer bg-black/60 rounded px-2 py-1">
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
          </div>
        )}
      </div>

      <h3 className="text-white font-medium truncate mb-1">{song.title}</h3>
      <p className="text-white/50 text-sm truncate">{song.artist}</p>

      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {onLike && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              isLiked ? 'text-red-500' : 'text-white/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        )}
        {onAddToPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
