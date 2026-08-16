# 秘境（ひきょう）· 个人二次元收藏站

> 無聊中寻觅快乐，希望快乐成为永恒。

一个用来分享动画、游戏、同人誌与纯音乐的个人网站。首页使用 `cg` 文件夹中的 6 张差分图缓慢交替，并叠加白色樱花下落效果。

## 内容位置

- 首页内容与推荐卡片：`app/page.tsx`
- CG 差分序列：`app/components/CgBackdrop.tsx`
- 白色樱花特效：`app/components/SakuraFall.tsx`
- 音乐页：`app/music/page.tsx`
- 播放器与合成试听：`app/music/MusicPlayer.tsx`
- 颜色、排版与动画：`app/globals.css`
- 网站标题与分享信息：`app/layout.tsx`
- CG 素材：`public/cg/scene-01/`
- 社交分享封面：`public/og-mikyo.png`

现在的推荐卡片与三首纯音乐都是效果样稿。以后加入新的差分图时，把图片复制到 `public/cg/scene-01/`，并同步修改 `CgBackdrop.tsx` 中的帧数即可。

## 本地预览

需要 Node.js 22 与 pnpm。

```bash
pnpm install
pnpm dev
```

首页：`http://localhost:3000/`

音乐页：`http://localhost:3000/music/`

## 发布到 GitHub Pages

1. 在 GitHub 新建仓库，并把此项目推送到 `main` 分支。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment** 中把 Source 设为 **GitHub Actions**。
4. 工作流会自动构建并发布；之后每次推送到 `main` 都会更新网站。

仓库已经包含 `.github/workflows/pages.yml`，同时支持 `用户名.github.io` 仓库和普通项目仓库的子路径。

> 建议使用 Node.js 22。当前 vinext 在 Windows + Node.js 24 上可能会在静态文件已经生成后出现退出阶段的 libuv 提示；GitHub Pages 工作流使用 Node.js 22，不受影响。
