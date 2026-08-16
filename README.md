# 花隙 · 个人收藏站

> 無聊中寻觅快乐，希望快乐成为永恒。

一个用来分享动画、游戏、音乐、摄影与生活碎片的个人网站。视觉取自逆光花枝照片，以旧纸白、冷雾蓝和低饱和樱粉为主色。

## 修改内容

- 首页文字与卡片：`app/page.tsx`
- 颜色、排版与动画：`app/globals.css`
- 网站标题与分享信息：`app/layout.tsx`
- 首页照片：`public/sakura-memory.jpg`
- 社交分享封面：`public/og.png`

现有文章和收藏文字是内容样刊，替换为自己的真实分享即可。

## 本地预览

需要 Node.js 22 与 pnpm。

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`。

## 发布到 GitHub Pages

1. 在 GitHub 新建仓库，并把此项目推送到 `main` 分支。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中把 Source 设为 **GitHub Actions**。
4. 工作流会自动构建并发布；之后每次推送到 `main` 都会更新网站。

仓库已经包含 `.github/workflows/pages.yml`，同时支持 `用户名.github.io` 仓库和普通项目仓库的子路径。

> 建议使用 Node.js 22。当前 vinext 在 Windows + Node.js 24 上可能会在静态文件已经生成后出现退出阶段的 libuv 提示；GitHub Pages 工作流使用 Node.js 22，不受影响。
