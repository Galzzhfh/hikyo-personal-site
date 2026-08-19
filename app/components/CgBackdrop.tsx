"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

/* eslint-disable @next/next/no-img-element */

const sequencePreloads = new Map<string, Promise<void>>();

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function preloadRemainingFrames(frames: string[]) {
  const key = frames.join("|");
  const existing = sequencePreloads.get(key);
  if (existing) return existing;

  const preload = (async () => {
    for (const src of frames.slice(1)) await preloadImage(src);
  })();
  sequencePreloads.set(key, preload);
  return preload;
}

export default function CgBackdrop({ basePath, animated = true }: { basePath: string; animated?: boolean }) {
  const frames = useMemo(() => {
    const firstScene = Array.from(
      { length: 6 },
      (_, index) => `${basePath}/cg/scene-01/${String(index + 1).padStart(8, "0")}.webp`,
    );
    const secondScene = ["00000336", "00000338", "00000340", "00000342", "00000344", "00000346", "00000350"]
      .map((frame) => `${basePath}/cg/scene-02/${frame}.webp`);
    return [...firstScene, ...secondScene];
  }, [basePath]);
  const [framesReady, setFramesReady] = useState(false);
  const sequenceDuration = frames.length * 7;

  useEffect(() => {
    if (!animated) return;

    let cancelled = false;
    const startPreloading = () => {
      void preloadRemainingFrames(frames).then(() => {
        if (!cancelled) setFramesReady(true);
      });
    };

    if (document.readyState === "complete") {
      const timer = window.setTimeout(startPreloading, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    window.addEventListener("load", startPreloading, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", startPreloading);
    };
  }, [animated, frames]);

  return (
    <div className={`cg-backdrop${animated && framesReady ? " is-ready" : ""}`} aria-hidden="true">
      {(animated && framesReady ? frames : frames.slice(0, 1)).map((src, index) => (
        <img
          className="cg-frame"
          key={src}
          src={src}
          alt=""
          decoding="async"
          fetchPriority={index === 0 ? "high" : undefined}
          style={{
            "--frame-delay": `${index * 7 - 1.5}s`,
            "--frame-shift-x": `${index % 2 === 0 ? -1.2 : 1.2}%`,
            "--sequence-duration": `${sequenceDuration}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
