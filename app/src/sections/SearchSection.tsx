import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from '@/components/SearchBar';
import { SongCard } from '@/components/SongCard';
import { useSearch } from '@/hooks/useApi';
import type { Song, YouTubeVideo } from '@/types';

interface SearchSectionProps {
  onSongSelect: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onLike: (song: Song) => void;
  isLiked: (song: Song) => boolean;
  onAddToPlaylist: (song: Song) => void;
}

const popularSearches = [
  'Pop Hits 2024',
  'Lo-Fi Beats',
  'Rock Classics',
  'Electronic Dance',
  'Hip Hop',
  'Jazz Vibes',
  'K-Pop',
  'Indie Folk',
];

function convertYouTubeToSong(video: YouTubeVideo): Song {
  return {
    youtubeId: video.id.videoId,
    title: video.snippet.title,
    artist: video.snippet.channelTitle,
    thumbnail: video.snippet.thumbnails.medium.url,
  };
}

export function SearchSection({
  onSongSelect,
  currentSong,
  isPlaying,
  onLike,
  isLiked,
  onAddToPlaylist,
}: SearchSectionProps) {
  const { results, loading, error, search } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    setHasSearched(!!query);
    search(query);
  };

  return (
    <div className="p-8 pb-32">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </motion.div>

      <AnimatePresence mode="wait">
        {!hasSearched ? (
          /* Initial State - Popular Searches */
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Popular Searches</h2>
            <div className="flex flex-wrap gap-3">
              {popularSearches.map((term, index) => (
                <motion.button
                  key={term}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSearch(term)}
                  className="px-5 py-2.5 rounded-full liquid-glass text-white text-sm font-medium hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {term}
                </motion.button>
              ))}
            </div>

            {/* Browse by Genre */}
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-white mb-4">Browse by Genre</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Pop', color: 'from-pink-500/30 to-rose-500/30' },
                  { name: 'Rock', color: 'from-red-500/30 to-orange-500/30' },
                  { name: 'Hip Hop', color: 'from-purple-500/30 to-violet-500/30' },
                  { name: 'Electronic', color: 'from-cyan-500/30 to-blue-500/30' },
                  { name: 'Jazz', color: 'from-amber-500/30 to-yellow-500/30' },
                  { name: 'Classical', color: 'from-emerald-500/30 to-teal-500/30' },
                  { name: 'R&B', color: 'from-indigo-500/30 to-purple-500/30' },
                  { name: 'Country', color: 'from-green-500/30 to-lime-500/30' },
                ].map((genre) => (
                  <motion.div
                    key={genre.name}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${genre.color} liquid-glass-card flex items-center justify-center cursor-pointer`}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSearch(genre.name + ' music')}
                  >
                    <span className="text-xl font-bold text-white">{genre.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Search Results */
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-white/60">Something went wrong. Please try again.</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/60">No results found. Try a different search.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Search Results
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {results.map((video, index) => {
                    const song = convertYouTubeToSong(video);
                    return (
                      <motion.div
                        key={song.youtubeId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SongCard
                          song={song}
                          isCurrentSong={currentSong?.youtubeId === song.youtubeId}
                          isPlaying={isPlaying}
                          isLiked={isLiked(song)}
                          onPlay={() => onSongSelect(song)}
                          onLike={() => onLike(song)}
                          onAddToPlaylist={() => onAddToPlaylist(song)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
