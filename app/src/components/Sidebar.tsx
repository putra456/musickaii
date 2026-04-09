import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Library,
  Heart,
  Clock,
  Plus,
  Music,
  Disc,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  playlists: { _id: string; name: string }[];
  onCreatePlaylist: () => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Your Library', icon: Library },
];

const libraryItems = [
  { id: 'liked', label: 'Liked Songs', icon: Heart },
  { id: 'recent', label: 'Recently Played', icon: Clock },
];

export function Sidebar({ activeTab, onTabChange, playlists, onCreatePlaylist }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      className="h-full liquid-glass-strong flex flex-col"
      initial={{ width: 260 }}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
          <Disc className="w-6 h-6 text-black animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        {!isCollapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-white"
          >
            Kaii
          </motion.h1>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 h-px bg-white/10" />

      {/* Library Section */}
      <div className="px-3 space-y-1">
        {!isCollapsed && (
          <p className="px-4 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
            Your Library
          </p>
        )}
        {libraryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Playlists */}
      <div className="flex-1 overflow-hidden mt-4">
        {!isCollapsed && (
          <div className="px-6 flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Playlists
            </p>
            <motion.button
              onClick={onCreatePlaylist}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        )}
        <div className="overflow-y-auto h-full pb-24 px-3">
          {playlists.map((playlist) => (
            <motion.button
              key={playlist._id}
              onClick={() => onTabChange(`playlist:${playlist._id}`)}
              className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all text-left ${
                activeTab === `playlist:${playlist._id}`
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 4 }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Music className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <span className="truncate">{playlist.name}</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </motion.button>
      </div>
    </motion.aside>
  );
}
