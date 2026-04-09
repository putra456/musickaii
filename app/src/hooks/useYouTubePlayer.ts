import { useEffect, useRef, useCallback, useState } from 'react';

interface YouTubePlayerOptions {
  videoId?: string;
  onReady?: (player: YT.Player) => void;
  onStateChange?: (event: YT.OnStateChangeEvent) => void;
  onError?: (event: YT.OnErrorEvent) => void;
}

export function useYouTubePlayer() {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.YT && window.YT.Player) {
      setIsReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  const createPlayer = useCallback((videoId: string, options?: Omit<YouTubePlayerOptions, 'videoId'>) => {
    if (!isReady || !containerRef.current) return null;

    // Destroy existing player
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    const player = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: { target: YT.Player }) => {
          options?.onReady?.(event.target);
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          options?.onStateChange?.(event);
        },
        onError: (event: YT.OnErrorEvent) => {
          options?.onError?.(event);
        },
      },
    });

    playerRef.current = player;
    return player;
  }, [isReady]);

  const playVideo = useCallback(() => {
    playerRef.current?.playVideo?.();
  }, []);

  const pauseVideo = useCallback(() => {
    playerRef.current?.pauseVideo?.();
  }, []);

  const seekTo = useCallback((seconds: number, allowSeekAhead: boolean = true) => {
    playerRef.current?.seekTo?.(seconds, allowSeekAhead);
  }, []);

  const getCurrentTime = useCallback(() => {
    return playerRef.current?.getCurrentTime?.() || 0;
  }, []);

  const getDuration = useCallback(() => {
    return playerRef.current?.getDuration?.() || 0;
  }, []);

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume?.(volume);
  }, []);

  const mute = useCallback(() => {
    playerRef.current?.mute?.();
  }, []);

  const unMute = useCallback(() => {
    playerRef.current?.unMute?.();
  }, []);

  const isMuted = useCallback(() => {
    return playerRef.current?.isMuted?.() || false;
  }, []);

  const getPlayerState = useCallback(() => {
    return playerRef.current?.getPlayerState?.();
  }, []);

  const loadVideoById = useCallback((videoId: string, startSeconds?: number) => {
    playerRef.current?.loadVideoById?.(videoId, startSeconds);
  }, []);

  const destroyPlayer = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
  }, []);

  return {
    containerRef,
    playerRef,
    isReady,
    createPlayer,
    playVideo,
    pauseVideo,
    seekTo,
    getCurrentTime,
    getDuration,
    setVolume,
    mute,
    unMute,
    isMuted,
    getPlayerState,
    loadVideoById,
    destroyPlayer,
  };
}
