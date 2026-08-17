"use client";

import { useEffect, useState } from "react";

type ThemeMode = "auto" | "day" | "night";

const labels: Record<ThemeMode, string> = { auto: "自动", day: "昼", night: "夜" };

function resolvedTheme(mode: ThemeMode) {
  if (mode !== "auto") return mode;
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

export default function ThemeControl() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const stored = window.localStorage.getItem("hikyo-theme-mode");
    if (stored === "auto" || stored === "day" || stored === "night") {
      queueMicrotask(() => setMode(stored));
    }
  }, []);

  useEffect(() => {
    function applyTheme() {
      document.documentElement.dataset.timeTheme = resolvedTheme(mode);
      document.documentElement.dataset.themeMode = mode;
    }
    applyTheme();
    const timer = window.setInterval(applyTheme, 60_000);
    return () => window.clearInterval(timer);
  }, [mode]);

  function selectMode(nextMode: ThemeMode) {
    setMode(nextMode);
    window.localStorage.setItem("hikyo-theme-mode", nextMode);
  }

  return (
    <>
      <div className="time-theme-veil" aria-hidden="true" />
      <div className="theme-control" aria-label="昼夜主题">
        {(Object.keys(labels) as ThemeMode[]).map((item) => (
          <button className={mode === item ? "is-active" : ""} type="button" key={item} onClick={() => selectMode(item)}>{labels[item]}</button>
        ))}
      </div>
    </>
  );
}
