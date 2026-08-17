"use client";

/* eslint-disable @next/next/no-img-element */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const songId = "1367154014";
const songUrl = `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;

type MusicContextValue = {
  isPlaying: boolean;
  hasStarted: boolean;
  toggle: () => Promise<void>;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}

export default function MusicProvider({ children, basePath }: { children: ReactNode; basePath: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    setHasStarted(true);
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setHasStarted(false);
        setIsPlaying(false);
      }
    } else {
      audio.pause();
    }
  }

  return (
    <MusicContext.Provider value={{ isPlaying, hasStarted, toggle }}>
      {children}
      {/* Instrumental audio has no spoken content to caption. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={songUrl} preload="metadata" loop />
      <aside className={`global-player ${hasStarted ? "is-visible" : ""}`} aria-label="持续音乐播放器" aria-hidden={!hasStarted}>
        <button className={`global-vinyl ${isPlaying ? "is-playing" : ""}`} type="button" onClick={toggle} aria-label={isPlaying ? "暂停" : "播放"}>
          <img src={`${basePath}/song-cover.jpg`} alt="" />
        </button>
        <div><strong>光ある場所へ</strong><span>忍</span></div>
        <button className="global-toggle" type="button" onClick={toggle} aria-label={isPlaying ? "暂停" : "播放"}>{isPlaying ? "Ⅱ" : "▶"}</button>
      </aside>
    </MusicContext.Provider>
  );
}
