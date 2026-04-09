import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Lyrics } from '@/types';

interface LyricsDisplayProps {
  lyrics: Lyrics | null;
  currentTime: number;
}

interface LyricLine {
  time: number;
  text: string;
}

function parseSyncedLyrics(syncedLyrics: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
  let match;

  while ((match = regex.exec(syncedLyrics)) !== null) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const milliseconds = parseInt(match[3], 10);
    const text = match[4].trim();

    if (text) {
      lines.push({
        time: minutes * 60 + seconds + milliseconds / 1000,
        text,
      });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function LyricsDisplay({ lyrics, currentTime }: LyricsDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parsedLines, setParsedLines] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  useEffect(() => {
    if (lyrics?.synced) {
      setParsedLines(parseSyncedLyrics(lyrics.synced));
    } else {
      setParsedLines([]);
    }
  }, [lyrics]);

  useEffect(() => {
    if (!parsedLines.length) return;

    const index = parsedLines.findIndex((line, i) => {
      const nextLine = parsedLines[i + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    setCurrentLineIndex(index);
  }, [currentTime, parsedLines]);

  useEffect(() => {
    if (currentLineIndex >= 0 && containerRef.current) {
      const activeLine = containerRef.current.children[currentLineIndex] as HTMLElement;
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  if (!lyrics) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <p>Search and play a song to see lyrics</p>
      </div>
    );
  }

  if (lyrics.message === 'Lyrics not available') {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        <div className="text-center">
          <p className="text-lg mb-2">Lyrics not available</p>
          <p className="text-sm text-white/30">{lyrics.title} - {lyrics.artist}</p>
        </div>
      </div>
    );
  }

  // Synced lyrics (karaoke style)
  if (parsedLines.length > 0) {
    return (
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto px-4 py-8 space-y-6 scrollbar-hide"
      >
        {parsedLines.map((line, index) => (
          <motion.p
            key={index}
            className={`text-center transition-all duration-300 ${
              index === currentLineIndex
                ? 'text-2xl font-semibold text-white'
                : index < currentLineIndex
                ? 'text-white/30 text-lg'
                : 'text-white/50 text-lg'
            }`}
            animate={{
              scale: index === currentLineIndex ? 1.05 : 1,
              opacity: index === currentLineIndex ? 1 : index < currentLineIndex ? 0.4 : 0.6,
            }}
            transition={{ duration: 0.3 }}
          >
            {line.text}
          </motion.p>
        ))}
      </div>
    );
  }

  // Plain lyrics (static)
  if (lyrics.plain) {
    return (
      <div className="h-full overflow-y-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">{lyrics.title}</h3>
          <p className="text-white/60 text-center mb-6">{lyrics.artist}</p>
          <div className="whitespace-pre-line text-white/80 leading-relaxed text-center">
            {lyrics.plain}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-white/40">
      <p>No lyrics found</p>
    </div>
  );
}
