import type { AnimePost } from "../../lib/anime";
import ArchiveGallery from "../archive/ArchiveGallery";

export default function AnimeGallery({ anime, basePath }: { anime: AnimePost[]; basePath: string }) {
  return <ArchiveGallery items={anime} basePath={basePath} sectionHash="anime" cardLabel="ANIME NOTE" emptyLabel="まだありません" />;
}
