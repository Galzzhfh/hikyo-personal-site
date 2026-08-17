import type { Metadata } from "next";
import PublicViewRedirect from "../components/PublicViewRedirect";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "同人誌推荐｜秘境",
  description: "同人誌推荐与资源收藏。",
};

export default function DoujinPage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";
  return <PublicViewRedirect basePath={basePath} view="doujin" />;
}
