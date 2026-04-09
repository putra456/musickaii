export interface Song {
  youtubeId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: number;
  genre?: string;
}

export interface Lyrics {
  source: string | null;
  title: string;
  artist: string;
  synced: string | null;
  plain: string | null;
  message?: string;
}

export interface Playlist {
  _id: string;
  name: string;
  songs: Song[];
  createdAt: string;
}

export interface User {
  userId: string;
  likedSongs: Song[];
  playlists: Playlist[];
  listeningHistory: {
    song: Song;
    playedAt: string;
    duration: number;
  }[];
  listeningPattern: {
    genres: Record<string, number>;
    artists: Record<string, number>;
    moods: Record<string, number>;
  };
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isVideoMode: boolean;
  isMinimized: boolean;
}

export interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string };
      high?: { url: string };
    };
  };
}
