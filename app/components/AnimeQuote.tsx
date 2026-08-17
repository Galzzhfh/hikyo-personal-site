"use client";

import { useSyncExternalStore } from "react";

const quotes = [
  "真実はいつもひとつ。",
  "人の夢は、終わらねぇ。",
  "会いたい人がいるなら、もう一人じゃない。",
  "起こらないから、奇跡って言うんですよ。",
  "どんな時でも、笑顔を忘れないで。",
];

let clientQuoteIndex: number | undefined;

function subscribe() {
  return () => undefined;
}

function getClientQuoteIndex() {
  if (clientQuoteIndex === undefined) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    clientQuoteIndex = values[0] % quotes.length;
  }
  return clientQuoteIndex;
}

export default function AnimeQuote() {
  const quoteIndex = useSyncExternalStore(subscribe, getClientQuoteIndex, () => 0);
  const quote = quotes[quoteIndex];

  return (
    <p className="anime-quote">
      <span>「{quote}」</span>
    </p>
  );
}
