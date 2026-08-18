import type { GamePost } from "../../lib/game";
import ArchiveGallery from "../archive/ArchiveGallery";

export default function GameGallery({ games, basePath }: { games: GamePost[]; basePath: string }) {
  return <ArchiveGallery items={games} basePath={basePath} sectionHash="games" cardLabel="GAME NOTE" emptyLabel="まだありません" />;
}
