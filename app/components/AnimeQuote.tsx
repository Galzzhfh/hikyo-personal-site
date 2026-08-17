"use client";

import { useSyncExternalStore } from "react";

const quotes = [
  { text: "真相永远只有一个。", source: "名侦探柯南" },
  { text: "人的梦想，是不会结束的。", source: "海贼王" },
  { text: "只要有想见的人，就不再是孤单一人。", source: "夏目友人帐" },
  { text: "正因为不会发生，所以才叫奇迹。", source: "Kanon" },
  { text: "无论何时，都不要忘记微笑。", source: "二次元语录" },
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
      <span>「{quote.text}」</span>
      <small>—— {quote.source}</small>
    </p>
  );
}
