"use client";

import { useEffect } from "react";

export default function PublicViewRedirect({ basePath, view }: { basePath: string; view: "doujin" | "music" }) {
  useEffect(() => {
    window.location.replace(`${basePath}/#${view}`);
  }, [basePath, view]);

  return <main className="public-view-redirect" aria-label="正在返回秘境" />;
}
