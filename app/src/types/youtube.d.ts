declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    loadVideoById(videoId: string, startSeconds?: number): void;
    cueVideoById(videoId: string, startSeconds?: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    setVolume(volume: number): void;
    getVolume(): number;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    destroy(): void;
  }

  interface PlayerOptions {
    videoId?: string;
    playerVars?: {
      autoplay?: number;
      controls?: number;
      disablekb?: number;
      enablejsapi?: number;
      fs?: number;
      iv_load_policy?: number;
      modestbranding?: number;
      playsinline?: number;
      rel?: number;
      showinfo?: number;
      start?: number;
    };
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: OnErrorEvent) => void;
    };
  }

  interface OnStateChangeEvent {
    data: number;
    target: Player;
  }

  interface OnErrorEvent {
    data: number;
    target: Player;
  }

  interface PlayerConstructor {
    new (elementId: string | HTMLElement, options: PlayerOptions): Player;
  }
}

interface Window {
  YT: {
    Player: YT.PlayerConstructor;
    PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  };
  onYouTubeIframeAPIReady: (() => void) | null;
}
