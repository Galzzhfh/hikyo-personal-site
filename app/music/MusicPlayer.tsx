"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const tracks = [
  { title: "夜桜の余白", roman: "Yozakura no Yohaku", mood: "Piano-like chimes · 68 BPM", duration: 96, notes: [261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66] },
  { title: "風の廊下", roman: "Kaze no Rouka", mood: "Soft ambient loop · 72 BPM", duration: 104, notes: [220, 277.18, 329.63, 369.99, 329.63, 277.18, 246.94, 277.18] },
  { title: "月の庭", roman: "Tsuki no Niwa", mood: "Midnight bells · 64 BPM", duration: 112, notes: [196, 246.94, 293.66, 392, 349.23, 293.66, 246.94, 220] },
];

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MusicPlayer() {
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(0.42);
  const audioContext = useRef<AudioContext | null>(null);
  const phraseTimer = useRef<number | null>(null);
  const volumeRef = useRef(volume);
  const current = tracks[trackIndex];

  useEffect(() => { volumeRef.current = volume; }, [volume]);

  function stopAudio() {
    if (phraseTimer.current !== null) window.clearTimeout(phraseTimer.current);
    phraseTimer.current = null;
    if (audioContext.current) void audioContext.current.close();
    audioContext.current = null;
  }

  function schedulePhrase(index: number) {
    const context = audioContext.current;
    if (!context) return;
    const track = tracks[index];
    const startAt = context.currentTime + 0.08;

    track.notes.forEach((frequency, noteIndex) => {
      const start = startAt + noteIndex * 0.54;
      const oscillator = context.createOscillator();
      const overtone = context.createOscillator();
      const gain = context.createGain();
      const overtoneGain = context.createGain();
      oscillator.type = "sine";
      overtone.type = "triangle";
      oscillator.frequency.value = frequency;
      overtone.frequency.value = frequency * 2;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.008, volumeRef.current * 0.12), start + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.35);
      overtoneGain.gain.setValueAtTime(0.0001, start);
      overtoneGain.gain.exponentialRampToValueAtTime(Math.max(0.004, volumeRef.current * 0.035), start + 0.02);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.82);
      oscillator.connect(gain).connect(context.destination);
      overtone.connect(overtoneGain).connect(context.destination);
      oscillator.start(start);
      overtone.start(start);
      oscillator.stop(start + 1.4);
      overtone.stop(start + 0.9);
    });

    phraseTimer.current = window.setTimeout(() => schedulePhrase(index), 4800);
  }

  function startAudio(index = trackIndex) {
    stopAudio();
    audioContext.current = new AudioContext();
    schedulePhrase(index);
    setPlaying(true);
  }

  function togglePlayback() {
    if (playing) {
      stopAudio();
      setPlaying(false);
      return;
    }
    startAudio();
  }

  function selectTrack(index: number) {
    const shouldResume = playing;
    stopAudio();
    setPlaying(false);
    setTrackIndex(index);
    setElapsed(0);
    if (shouldResume) window.setTimeout(() => startAudio(index), 0);
  }

  function moveTrack(direction: number) {
    selectTrack((trackIndex + direction + tracks.length) % tracks.length);
  }

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => value + 1 >= current.duration ? 0 : value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, current.duration]);

  useEffect(() => () => stopAudio(), []);

  return (
    <div className="player-shell">
      <div className={`turntable ${playing ? "is-playing" : ""}`}>
        <div className="vinyl">
          <div className="vinyl-label"><span>秘境</span><small>DEMO {String(trackIndex + 1).padStart(2, "0")}</small></div>
        </div>
        <div className="tonearm" aria-hidden="true"><span /></div>
      </div>

      <div className="player-panel">
        <div className="track-meta">
          <p>NOW PLAYING · SYNTHESIZED SAMPLE</p>
          <h2>{current.title}</h2>
          <span>{current.roman} / {current.mood}</span>
        </div>

        <div className="progress-row">
          <span>{formatTime(elapsed)}</span>
          <input
            aria-label="播放进度"
            type="range"
            min="0"
            max={current.duration}
            value={elapsed}
            onChange={(event) => setElapsed(Number(event.target.value))}
            style={{ "--progress": `${(elapsed / current.duration) * 100}%` } as CSSProperties}
          />
          <span>{formatTime(current.duration)}</span>
        </div>

        <div className="player-controls">
          <button type="button" onClick={() => moveTrack(-1)} aria-label="上一首">‹</button>
          <button className="play-button" type="button" onClick={togglePlayback} aria-label={playing ? "暂停" : "播放"}>{playing ? "Ⅱ" : "▶"}</button>
          <button type="button" onClick={() => moveTrack(1)} aria-label="下一首">›</button>
          <label className="volume-control">
            <span>VOL</span>
            <input aria-label="音量" type="range" min="0.08" max="0.8" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
          </label>
        </div>

        <ol className="track-list">
          {tracks.map((track, index) => (
            <li key={track.title} className={index === trackIndex ? "active" : ""}>
              <button type="button" onClick={() => selectTrack(index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{track.title}</strong>
                <small>{formatTime(track.duration)}</small>
              </button>
            </li>
          ))}
        </ol>
        <p className="demo-disclaimer">试听样曲由浏览器实时合成，仅用于预览播放器效果。</p>
      </div>
    </div>
  );
}
