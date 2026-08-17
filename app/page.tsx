import PublicApp from "./components/PublicApp";
import postsData from "../content/doujin-posts.json";
import type { DoujinPost } from "../lib/doujin";

export default function Home() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return <PublicApp basePath={basePath} posts={postsData as DoujinPost[]} />;
}
