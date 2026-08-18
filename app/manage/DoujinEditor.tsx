"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { doujinImageSource, isRemoteDoujinImage, type DoujinPost } from "../../lib/doujin";
import {
  commitRepositoryFiles,
  readRepositoryJson,
  safeImageExtension,
  verifyOwner as verifyGitHubOwner,
  type RepositoryMutation,
} from "../../lib/github-owner";

type EditorProps = {
  initialPosts: DoujinPost[];
  basePath: string;
};

type EditorStatus = "idle" | "checking" | "ready" | "publishing" | "success" | "error";

const initialForm = {
  title: "",
  japaneseTitle: "",
  excerpt: "",
  tags: "同人誌",
  sourceUrl: "",
  remoteImages: "",
};

function parseRemoteImages(value: string) {
  return value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
}

function isSupportedRemoteImage(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && (parsed.hostname === "1drv.ms" || parsed.hostname === "onedrive.live.com" || parsed.hostname.endsWith(".sharepoint.com"));
  } catch {
    return false;
  }
}

export default function DoujinEditor({ initialPosts, basePath }: EditorProps) {
  const operationInFlightRef = useRef(false);
  const [posts, setPosts] = useState(initialPosts);
  const [token, setToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [pages, setPages] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [pageInputKey, setPageInputKey] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [message, setMessage] = useState("");

  const editingPost = editingId ? posts.find((post) => post.id === editingId) : undefined;
  const previewUrl = useMemo(() => cover ? URL.createObjectURL(cover) : "", [cover]);
  const pagePreviewUrls = useMemo(() => pages.map((page) => URL.createObjectURL(page)), [pages]);
  const previewSource = previewUrl || (editingPost ? `${basePath}/${editingPost.cover}` : "");
  const parsedTags = form.tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 5);
  const remoteImages = parseRemoteImages(form.remoteImages);
  const storedLocalImages = (editingPost?.images ?? []).filter((source) => !isRemoteDoujinImage(source));

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => () => {
    pagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [pagePreviewUrls]);

  function clearForm() {
    setEditingId(null);
    setForm(initialForm);
    setCover(null);
    setPages([]);
    setFileInputKey((value) => value + 1);
    setPageInputKey((value) => value + 1);
  }

  function editPost(post: DoujinPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      japaneseTitle: post.japaneseTitle,
      excerpt: post.excerpt,
      tags: post.tags.join(", "),
      sourceUrl: post.sourceUrl,
      remoteImages: (post.images ?? []).filter(isRemoteDoujinImage).join("\n"),
    });
    setCover(null);
    setPages([]);
    setFileInputKey((value) => value + 1);
    setPageInputKey((value) => value + 1);
    setStatus("ready");
    setMessage("");
  }

  async function verifyOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    setStatus("checking");
    setMessage("正在验证站主身份…");
    try {
      const cleanToken = token.trim();
      await verifyGitHubOwner(cleanToken);
      setPosts(await readRepositoryJson("content/doujin-posts.json", cleanToken, posts));
      setAuthorized(true);
      setStatus("ready");
      setMessage("");
    } catch (error) {
      setAuthorized(false);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "身份验证失败。");
    }
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorized || !token.trim() || !form.title.trim() || !form.excerpt.trim()) return;
    if (!editingId && !cover) {
      setStatus("error");
      setMessage("新增投稿需要选择封面图片。");
      return;
    }
    if (cover && cover.size > 8 * 1024 * 1024) {
      setStatus("error");
      setMessage("封面图片请控制在 8 MB 以内。");
      return;
    }
    if (pages.length > 20) {
      setStatus("error");
      setMessage("一次最多上传 20 张阅读页。");
      return;
    }
    if (pages.some((page) => page.size > 20 * 1024 * 1024)) {
      setStatus("error");
      setMessage("每张漫画长图或阅读页请控制在 20 MB 以内。");
      return;
    }
    if (remoteImages.length > 20) {
      setStatus("error");
      setMessage("一次最多填写 20 条网盘图片直链。");
      return;
    }
    if (remoteImages.some((url) => !isSupportedRemoteImage(url))) {
      setStatus("error");
      setMessage("请填写有效的 OneDrive 或 SharePoint HTTPS 直链，每行一条。");
      return;
    }
    if (pages.length && remoteImages.length) {
      setStatus("error");
      setMessage("本地上传和网盘直链请选择一种阅读来源。");
      return;
    }
    if (operationInFlightRef.current) return;
    operationInFlightRef.current = true;

    setStatus("publishing");
    setMessage(editingId ? "正在保存修改…" : "正在发布投稿…");

    try {
      const cleanToken = token.trim();
      const currentPosts = await readRepositoryJson("content/doujin-posts.json", cleanToken, posts);
      const existingPost = editingId ? currentPosts.find((post) => post.id === editingId) : undefined;
      if (editingId && !existingPost) throw new Error("没有找到要修改的投稿，请刷新后重试。");

      const now = new Date();
      const id = editingId || `post-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${now.getTime().toString(36)}`;
      const coverPath = cover
        ? `doujin/${id}-${now.getTime().toString(36)}.${safeImageExtension(cover)}`
        : existingPost!.cover;
      const existingImages = existingPost?.images ?? [];
      const uploadedPagePaths = pages.length
        ? pages.map((page, index) => `doujin/${id}-page-${String(index + 1).padStart(2, "0")}-${now.getTime().toString(36)}.${safeImageExtension(page)}`)
        : [];
      const pagePaths = remoteImages.length ? remoteImages : uploadedPagePaths.length ? uploadedPagePaths : existingImages;
      const nextPost: DoujinPost = {
        id,
        title: form.title.trim(),
        japaneseTitle: form.japaneseTitle.trim() || "私のおすすめ",
        excerpt: form.excerpt.trim(),
        tags: parsedTags.length ? parsedTags : ["同人誌"],
        cover: coverPath,
        images: pagePaths,
        sourceUrl: form.sourceUrl.trim(),
        createdAt: existingPost?.createdAt || now.toISOString(),
      };
      const nextPosts = editingId
        ? currentPosts.map((post) => post.id === editingId ? nextPost : post)
        : [nextPost, ...currentPosts];
      const mutations: RepositoryMutation[] = [
        { path: "content/doujin-posts.json", content: JSON.stringify(nextPosts, null, 2) + "\n" },
      ];
      if (cover) {
        mutations.unshift({ path: `public/${coverPath}`, content: new Uint8Array(await cover.arrayBuffer()) });
        if (existingPost?.cover.startsWith("doujin/") && existingPost.cover !== coverPath) {
          mutations.push({ path: `public/${existingPost.cover}`, delete: true });
        }
      }
      if (pages.length) {
        const pageMutations = await Promise.all(pages.map(async (page, index): Promise<RepositoryMutation> => ({
          path: `public/${uploadedPagePaths[index]}`,
          content: new Uint8Array(await page.arrayBuffer()),
        })));
        mutations.unshift(...pageMutations);
      }
      if (pages.length || remoteImages.length) existingImages.filter((path) => path.startsWith("doujin/") && !pagePaths.includes(path)).forEach((path) => mutations.push({ path: `public/${path}`, delete: true }));
      await commitRepositoryFiles(cleanToken, `${editingId ? "Update" : "Add"} doujin post: ${form.title.trim()}`, mutations);

      setPosts(nextPosts);
      setStatus("success");
      setMessage(editingId ? "修改已保存，网站会自动更新。" : "投稿已发布，网站会自动更新。");
      clearForm();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试。");
    } finally {
      operationInFlightRef.current = false;
    }
  }

  async function deletePost(post: DoujinPost) {
    if (!authorized || !token.trim() || !window.confirm(`确定删除「${post.title}」吗？`)) return;
    if (operationInFlightRef.current) return;
    operationInFlightRef.current = true;
    setStatus("publishing");
    setMessage("正在删除投稿…");
    try {
      const cleanToken = token.trim();
      const currentPosts = await readRepositoryJson("content/doujin-posts.json", cleanToken, posts);
      const target = currentPosts.find((item) => item.id === post.id);
      if (!target) throw new Error("没有找到要删除的投稿，请刷新后重试。");
      const nextPosts = currentPosts.filter((item) => item.id !== post.id);
      const mutations: RepositoryMutation[] = [
        { path: "content/doujin-posts.json", content: JSON.stringify(nextPosts, null, 2) + "\n" },
      ];
      if (target.cover.startsWith("doujin/")) mutations.push({ path: `public/${target.cover}`, delete: true });
      (target.images ?? []).filter((path) => path.startsWith("doujin/") && path !== target.cover).forEach((path) => mutations.push({ path: `public/${path}`, delete: true }));
      await commitRepositoryFiles(cleanToken, `Delete doujin post: ${target.title}`, mutations);
      setPosts(nextPosts);
      clearForm();
      setStatus("success");
      setMessage("投稿已删除，网站会自动更新。");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "删除失败，请稍后重试。");
    } finally {
      operationInFlightRef.current = false;
    }
  }

  return (
    <section className="editor-section" aria-label="同人誌投稿编辑器">
      <div className="editor-copy">
        <p className="section-index">01 / OWNER ONLY</p>
        <h2>投稿管理<small>お気に入りを編集する</small></h2>
        <p>只有站主账号验证通过后，才能新增、修改或删除内容。</p>
        <div className="token-note">
          <strong>GitHub 权限</strong>
          <p>Resource owner 选择 Galzzhfh，仓库选择 hikyo-personal-site，Contents 设为 Read and write。令牌不会保存。</p>
          <a href="https://github.com/settings/personal-access-tokens/new?name=Hikyo%20Site%20Editor&amp;target_name=Galzzhfh&amp;contents=write" target="_blank" rel="noreferrer">创建令牌 <span>↗</span></a>
        </div>
      </div>

      {!authorized ? (
        <form className="owner-gate" onSubmit={verifyOwner}>
          <span className="owner-seal">秘</span>
          <h3>站主验证</h3>
          <label className="field">
            <span>GitHub 令牌</span>
            <input type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" placeholder="github_pat_…" required />
          </label>
          <button className="owner-unlock" type="submit" disabled={status === "checking"}>{status === "checking" ? "验证中…" : "进入管理"}<span>→</span></button>
          <p className={`publish-status is-${status}`} role="status">{message}</p>
        </form>
      ) : (
        <div className="editor-workspace">
          <div className="owner-toolbar">
            <span>Galzzhfh</span>
            <button type="button" onClick={() => { setAuthorized(false); setToken(""); clearForm(); setStatus("idle"); setMessage(""); }}>锁定</button>
          </div>

          <div className="post-manager" aria-label="已有投稿">
            <button className={!editingId ? "is-active" : ""} type="button" onClick={clearForm}>＋ 新增投稿</button>
            {posts.map((post) => (
              <button className={editingId === post.id ? "is-active" : ""} type="button" key={post.id} onClick={() => editPost(post)}>
                <span>{post.title}</span><small>修改</small>
              </button>
            ))}
          </div>

          <form className="editor-form" onSubmit={publish}>
            <div className="editor-mode field-wide"><span>{editingId ? "EDIT POST" : "NEW POST"}</span><strong>{editingId ? "修改投稿" : "新增投稿"}</strong></div>
            <label className="field">
              <span>标题</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={80} placeholder="作品名称" required />
            </label>
            <label className="field">
              <span>日文小标题</span>
              <input value={form.japaneseTitle} onChange={(event) => setForm({ ...form, japaneseTitle: event.target.value })} maxLength={50} placeholder="私のおすすめ" />
            </label>
            <label className="field field-wide">
              <span>推荐短语</span>
              <textarea value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} maxLength={180} rows={4} required />
            </label>
            <label className="field">
              <span>标签</span>
              <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} maxLength={80} />
            </label>
            <label className="field">
              <span>收藏链接</span>
              <input type="url" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} placeholder="https://…" />
            </label>
            <label className="field field-wide cover-field">
              <span>封面图片{editingId ? "（不更换可留空）" : ""}</span>
              <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setCover(event.target.files?.[0] ?? null)} required={!editingId} />
            </label>
            <label className="field field-wide cover-field">
              <span>漫画长图或阅读页（可多选，重新选择会替换原内容）</span>
              <input key={pageInputKey} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setPages(Array.from(event.target.files ?? []))} />
            </label>
            <label className="field field-wide">
              <span>OneDrive / SharePoint 图片直链（每行一条，与本地上传二选一）</span>
              <textarea value={form.remoteImages} onChange={(event) => setForm({ ...form, remoteImages: event.target.value })} rows={4} placeholder="https://…/download.aspx?share=…" />
            </label>

            {remoteImages.length ? <p className="remote-reader-note field-wide">已设置 {remoteImages.length} 条网盘直链，阅读时按需加载。</p> : null}
            {(pagePreviewUrls.length || storedLocalImages.length) ? <div className="reader-upload-preview field-wide" aria-label="阅读页预览">
              {(pagePreviewUrls.length ? pagePreviewUrls : storedLocalImages.map((path) => doujinImageSource(basePath, path))).map((source, index) => <img src={source} alt={`阅读页 ${index + 1}`} key={source} />)}
            </div> : null}

            <div className="editor-preview field-wide" aria-label="帖子预览">
              <div className="preview-cover">
                {previewSource ? <img src={previewSource} alt="封面预览" /> : <span>封面预览</span>}
              </div>
              <div>
                <p>{form.japaneseTitle || "私のおすすめ"}</p>
                <h3>{form.title || "作品标题"}</h3>
                <span>{form.excerpt || "推荐短语"}</span>
              </div>
            </div>

            <div className="publish-row field-wide">
              <button type="submit" disabled={status === "publishing"}>{status === "publishing" ? "保存中…" : editingId ? "保存修改" : "发布投稿"}<span>→</span></button>
              {editingPost ? <button className="delete-button" type="button" disabled={status === "publishing"} onClick={() => deletePost(editingPost)}>删除投稿</button> : null}
              <p className={`publish-status is-${status}`} role="status">{message}</p>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
