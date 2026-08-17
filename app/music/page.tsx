import type { Metadata } from "next";
import PublicViewRedirect from "../components/PublicViewRedirect";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "音乐室｜秘境",
  description: "光ある場所へ · 忍",
  openGraph: { title: "音乐室｜秘境", description: "光ある場所へ · 忍" },
  twitter: { card: "summary", title: "音乐室｜秘境", description: "光ある場所へ · 忍" },
};

export default function MusicPage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";
  return <PublicViewRedirect basePath={basePath} view="music" />;
}
