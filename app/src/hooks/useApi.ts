import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Song, Lyrics, User, YouTubeVideo } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Generate a unique user ID
const getUserId = () => {
  let userId = localStorage.getItem('kaii_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('kaii_user_id', userId);
  }
  return userId;
};

export function useSearch() {
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/search', { params: { q: query } });
      setResults(response.data.items || []);
    } catch (err) {
      setError('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

export function useLyrics() {
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLyrics = useCallback(async (title: string, artist: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/lyrics', { 
        params: { title, artist } 
      });
      setLyrics(response.data);
    } catch (err) {
      setError('Failed to fetch lyrics');
      setLyrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLyrics = useCallback(() => {
    setLyrics(null);
  }, []);

  return { lyrics, loading, error, fetchLyrics, clearLyrics };
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<{ title: string; artist: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (listeningPattern: User['listeningPattern']) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/recommendations', {
        userId: getUserId(),
        listeningPattern,
      });
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError('Failed to get recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { recommendations, loading, error, getRecommendations };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get(`/user/${getUserId()}`);
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user');
    }
  }, []);

  const likeSong = useCallback(async (song: Song) => {
    try {
      const response = await api.post(`/user/${getUserId()}/like`, { song });
      await fetchUser();
      return response.data.liked;
    } catch (err) {
      console.error('Failed to like song');
      return false;
    }
  }, [fetchUser]);

  const addToHistory = useCallback(async (song: Song, duration: number = 0, genre?: string, artist?: string) => {
    try {
      await api.post(`/user/${getUserId()}/history`, { song, duration, genre, artist });
      await fetchUser();
    } catch (err) {
      console.error('Failed to add to history');
    }
  }, [fetchUser]);

  const createPlaylist = useCallback(async (name: string) => {
    try {
      const response = await api.post(`/user/${getUserId()}/playlists`, { name });
      await fetchUser();
      return response.data;
    } catch (err) {
      console.error('Failed to create playlist');
      return null;
    }
  }, [fetchUser]);

  const addToPlaylist = useCallback(async (playlistId: string, song: Song) => {
    try {
      await api.post(`/user/${getUserId()}/playlists/${playlistId}/songs`, { song });
      await fetchUser();
    } catch (err) {
      console.error('Failed to add to playlist');
    }
  }, [fetchUser]);

  const getLikedSongs = useCallback(async (): Promise<Song[]> => {
    try {
      const response = await api.get(`/user/${getUserId()}/liked`);
      return response.data;
    } catch (err) {
      return [];
    }
  }, []);

  const getRecentSongs = useCallback(async (): Promise<{ song: Song; playedAt: string }[]> => {
    try {
      const response = await api.get(`/user/${getUserId()}/recent`);
      return response.data;
    } catch (err) {
      return [];
    }
  }, []);

  return {
    user,
    fetchUser,
    likeSong,
    addToHistory,
    createPlaylist,
    addToPlaylist,
    getLikedSongs,
    getRecentSongs,
  };
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}
