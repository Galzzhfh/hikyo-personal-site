"use client";

/* eslint-disable @next/next/no-img-element */

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { MusicTrack } from "../../lib/music";

type MusicContextValue = {
  isPlaying: boolean;
  hasStarted: boolean;
  playbackError: string;
  tracks: MusicTrack[];
  currentTrack: MusicTrack | null;
  toggle: () => Promise<void>;
  playTrack: (trackId: string) => Promise<void>;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}

export default function MusicProvider({ children, basePath, tracks }: { children: ReactNode; basePath: string; tracks: MusicTrack[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingPlayRef = useRef(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(tracks[0]?.id ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const currentTrack = tracks.find((track) => track.id === currentTrackId) ?? tracks[0] ?? null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => {
      setIsPlaying(true);
      setPlaybackError("");
    };
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("music-is-playing", isPlaying);
    return () => document.documentElement.classList.remove("music-is-playing");
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !pendingPlayRef.current) return;
    pendingPlayRef.current = false;
    audio.load();
    audio.play().catch(() => {
      setIsPlaying(false);
      setHasStarted(true);
      setPlaybackError("当前曲目暂时无法播放，请选择其他曲目。");
    });
  }, [currentTrack]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    setHasStarted(true);
    setPlaybackError("");
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setHasStarted(true);
        setIsPlaying(false);
        setPlaybackError("当前曲目暂时无法播放，请选择其他曲目。");
      }
    } else {
      audio.pause();
    }
  }

  async function playTrack(trackId: string) {
    if (!tracks.some((track) => track.id === trackId)) return;
    if (currentTrack?.id === trackId) {
      await toggle();
      return;
    }
    pendingPlayRef.current = true;
    setHasStarted(true);
    setPlaybackError("");
    setCurrentTrackId(trackId);
  }

  return (
    <MusicContext.Provider value={{ isPlaying, hasStarted, playbackError, tracks, currentTrack, toggle, playTrack }}>
      {children}
      {/* Instrumental audio has no spoken content to caption. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={currentTrack ? `https://music.163.com/song/media/outer/url?id=${currentTrack.songId}.mp3` : undefined} preload="metadata" loop />
      <aside className={`global-player ${hasStarted ? "is-visible" : ""}`} aria-label="持续音乐播放器" aria-hidden={!hasStarted}>
        <button className={`global-vinyl ${isPlaying ? "is-playing" : ""}`} type="button" onClick={toggle} aria-label={isPlaying ? "暂停" : "播放"}>
          {currentTrack ? <img src={`${basePath}/${currentTrack.cover}`} alt="" /> : null}
        </button>
        <div><strong>{currentTrack?.title ?? ""}</strong><span>{playbackError || currentTrack?.artist || ""}</span></div>
        <button className="global-toggle" type="button" onClick={toggle} aria-label={isPlaying ? "暂停" : "播放"}>{isPlaying ? "Ⅱ" : "▶"}</button>
      </aside>
    </MusicContext.Provider>
  );
}
