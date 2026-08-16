import type { Metadata } from "next";
import "./globals.css";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const metadataBase = new URL(configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`);

export const metadata: Metadata = {
  metadataBase,
  title: "秘境｜無聊中寻觅快乐",
  description: "分享喜欢的动画、游戏、音乐与生活碎片。希望快乐成为永恒。",
  icons: {
    icon: "favicon.jpg",
    shortcut: "favicon.jpg",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "秘境｜無聊中寻觅快乐",
    description: "分享喜欢的动画、游戏、音乐与生活碎片。希望快乐成为永恒。",
    images: [{ url: "og-mikyo.png", width: 1792, height: 896, alt: "秘境个人收藏站" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "秘境｜無聊中寻觅快乐",
    description: "分享喜欢的动画、游戏、音乐与生活碎片。希望快乐成为永恒。",
    images: ["og-mikyo.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
