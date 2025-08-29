// utils/useAudio.ts
import { useRef } from "react";

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio(src);
  }

  const play = () => {
    audioRef.current?.play().catch((err) => {
      console.warn("Audio play failed:", err);
    });
  };

  return play;
}
