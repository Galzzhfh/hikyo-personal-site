"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { DoujinPost } from "../../lib/doujin";

const repository = "Galzzhfh/hikyo-personal-site";
const branch = "main";
const apiBase = "https://api.github.com";

type EditorProps = {
  initialPosts: DoujinPost[];
};

type GitRef = { object: { sha: string } };
type GitCommit = { tree: { sha: string } };
type GitObject = { sha: string };
type GitHubUser = { login: string };
type GitHubContent = { content: string; encoding: string };
type GitHubError = { message?: string };

const initialForm = {
  title: "",
  japaneseTitle: "",
  excerpt: "",
  tags: "同人誌",
  sourceUrl: "",
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function textToBase64(value: string) {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64ToText(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

async function githubRequest<T>(path: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  const data = await response.json() as T & GitHubError;
  if (!response.ok) {
    throw new Error(data.message || `GitHub 请求失败（${response.status}）`);
  }
  return data;
}

function safeExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension) ? extension : "jpg";
}

export default function DoujinEditor({ initialPosts }: EditorProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [token, setToken] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const previewUrl = useMemo(() => cover ? URL.createObjectURL(cover) : "", [cover]);
  const parsedTags = form.tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 5);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim() || !cover || !form.title.trim() || !form.excerpt.trim()) return;
    if (cover.size > 8 * 1024 * 1024) {
      setStatus("error");
      setMessage("封面图片请控制在 8 MB 以内。");
      return;
    }

    setStatus("publishing");
    setMessage("正在安全连接 GitHub…");

    try {
      const cleanToken = token.trim();
      const user = await githubRequest<GitHubUser>("/user", cleanToken);
      if (user.login.toLowerCase() !== "galzzhfh") {
        throw new Error("当前令牌不属于站主账号 Galzzhfh。");
      }

      const reference = await githubRequest<GitRef>(`/repos/${repository}/git/ref/heads/${branch}`, cleanToken);
      const [parent, currentContent] = await Promise.all([
        githubRequest<GitCommit>(`/repos/${repository}/git/commits/${reference.object.sha}`, cleanToken),
        githubRequest<GitHubContent>(`/repos/${repository}/contents/content/doujin-posts.json?ref=${branch}`, cleanToken),
      ]);
      const currentPosts = currentContent.encoding === "base64"
        ? JSON.parse(base64ToText(currentContent.content)) as DoujinPost[]
        : posts;
      const now = new Date();
      const id = `post-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${now.getTime().toString(36)}`;
      const coverPath = `doujin/${id}.${safeExtension(cover)}`;
      const coverBytes = new Uint8Array(await cover.arrayBuffer());

      setMessage("正在上传封面并整理帖子…");
      const nextPost: DoujinPost = {
        id,
        title: form.title.trim(),
        japaneseTitle: form.japaneseTitle.trim() || "私のおすすめ",
        excerpt: form.excerpt.trim(),
        tags: parsedTags.length ? parsedTags : ["同人誌"],
        cover: coverPath,
        sourceUrl: form.sourceUrl.trim(),
        createdAt: now.toISOString().slice(0, 10),
      };
      const nextPosts = [nextPost, ...currentPosts];

      const [coverBlob, contentBlob] = await Promise.all([
        githubRequest<GitObject>(`/repos/${repository}/git/blobs`, cleanToken, {
          method: "POST",
          body: JSON.stringify({ content: bytesToBase64(coverBytes), encoding: "base64" }),
        }),
        githubRequest<GitObject>(`/repos/${repository}/git/blobs`, cleanToken, {
          method: "POST",
          body: JSON.stringify({
            content: textToBase64(JSON.stringify(nextPosts, null, 2) + "\n"),
            encoding: "base64",
          }),
        }),
      ]);

      const tree = await githubRequest<GitObject>(`/repos/${repository}/git/trees`, cleanToken, {
        method: "POST",
        body: JSON.stringify({
          base_tree: parent.tree.sha,
          tree: [
            { path: `public/${coverPath}`, mode: "100644", type: "blob", sha: coverBlob.sha },
            { path: "content/doujin-posts.json", mode: "100644", type: "blob", sha: contentBlob.sha },
          ],
        }),
      });
      const commit = await githubRequest<GitObject>(`/repos/${repository}/git/commits`, cleanToken, {
        method: "POST",
        body: JSON.stringify({
          message: `Add doujin post: ${form.title.trim()}`,
          tree: tree.sha,
          parents: [reference.object.sha],
        }),
      });
      await githubRequest<GitObject>(`/repos/${repository}/git/refs/heads/${branch}`, cleanToken, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });

      setStatus("success");
      setMessage("投稿已提交。网站会在约一分钟后自动更新。");
      setPosts(nextPosts);
      setForm(initialForm);
      setCover(null);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "投稿失败，请稍后重试。");
    }
  }

  return (
    <section className="editor-section" aria-label="同人誌投稿编辑器">
      <div className="editor-copy">
        <p className="section-index">01 / NEW POST</p>
        <h2>添加喜欢的作品<small>新しいお気に入り</small></h2>
        <p>填写内容并选择封面，发布后会自动加入推荐页。</p>
        <div className="token-note">
          <strong>首次使用</strong>
          <p>创建仅限本仓库、Contents 读写权限的 GitHub 精细令牌。令牌只在当前页面使用，不会保存。</p>
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">创建令牌 <span>↗</span></a>
        </div>
      </div>

      <form className="editor-form" onSubmit={publish}>
        <label className="field field-wide">
          <span>GitHub 令牌</span>
          <input type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" placeholder="github_pat_…" required />
        </label>
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
          <textarea value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} maxLength={180} rows={4} placeholder="为什么想把它收藏在这里？" required />
        </label>
        <label className="field">
          <span>标签</span>
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} maxLength={80} placeholder="同人誌, 治愈" />
        </label>
        <label className="field">
          <span>收藏链接</span>
          <input type="url" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} placeholder="https://…" />
        </label>
        <label className="field field-wide cover-field">
          <span>封面图片</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setCover(event.target.files?.[0] ?? null)} required />
        </label>

        <div className="editor-preview field-wide" aria-label="帖子预览">
          <div className="preview-cover">
            {previewUrl ? <img src={previewUrl} alt="待发布封面预览" /> : <span>封面预览</span>}
          </div>
          <div>
            <p>{form.japaneseTitle || "私のおすすめ"}</p>
            <h3>{form.title || "作品标题"}</h3>
            <span>{form.excerpt || "推荐短语会显示在这里。"}</span>
          </div>
        </div>

        <div className="publish-row field-wide">
          <button type="submit" disabled={status === "publishing"}>{status === "publishing" ? "发布中…" : "发布投稿"}<span>→</span></button>
          <p className={`publish-status is-${status}`} role="status">{message}</p>
        </div>
      </form>
    </section>
  );
}
