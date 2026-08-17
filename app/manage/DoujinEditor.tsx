"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { DoujinPost } from "../../lib/doujin";

const repository = "Galzzhfh/hikyo-personal-site";
const branch = "main";
const apiBase = "https://api.github.com";

type EditorProps = {
  initialPosts: DoujinPost[];
  basePath: string;
};

type GitRef = { object: { sha: string } };
type GitCommit = { tree: { sha: string } };
type GitObject = { sha: string };
type GitHubUser = { login: string };
type GitHubContent = { content: string; encoding: string };
type GitHubError = { message?: string };
type GitTreeEntry = { path: string; mode: "100644"; type: "blob"; sha: string };
type EditorStatus = "idle" | "checking" | "ready" | "publishing" | "success" | "error";

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
  const response = await fetch(`${apiBase}${path}`, { ...init, headers });
  const data = await response.json() as T & GitHubError;
  if (!response.ok) throw new Error(data.message || `GitHub 请求失败（${response.status}）`);
  return data;
}

function decodePosts(content: GitHubContent, fallback: DoujinPost[]) {
  return content.encoding === "base64"
    ? JSON.parse(base64ToText(content.content)) as DoujinPost[]
    : fallback;
}

function safeExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension) ? extension : "jpg";
}

export default function DoujinEditor({ initialPosts, basePath }: EditorProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [token, setToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [message, setMessage] = useState("");

  const editingPost = editingId ? posts.find((post) => post.id === editingId) : undefined;
  const previewUrl = useMemo(() => cover ? URL.createObjectURL(cover) : "", [cover]);
  const previewSource = previewUrl || (editingPost ? `${basePath}/${editingPost.cover}` : "");
  const parsedTags = form.tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 5);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function clearForm() {
    setEditingId(null);
    setForm(initialForm);
    setCover(null);
    setFileInputKey((value) => value + 1);
  }

  function editPost(post: DoujinPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      japaneseTitle: post.japaneseTitle,
      excerpt: post.excerpt,
      tags: post.tags.join(", "),
      sourceUrl: post.sourceUrl,
    });
    setCover(null);
    setFileInputKey((value) => value + 1);
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
      const user = await githubRequest<GitHubUser>("/user", cleanToken);
      if (user.login.toLowerCase() !== "galzzhfh") throw new Error("仅 Galzzhfh 可以进入投稿管理。");
      const currentContent = await githubRequest<GitHubContent>(`/repos/${repository}/contents/content/doujin-posts.json?ref=${branch}`, cleanToken);
      setPosts(decodePosts(currentContent, posts));
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

    setStatus("publishing");
    setMessage(editingId ? "正在保存修改…" : "正在发布投稿…");

    try {
      const cleanToken = token.trim();
      const user = await githubRequest<GitHubUser>("/user", cleanToken);
      if (user.login.toLowerCase() !== "galzzhfh") throw new Error("站主身份已失效，请重新验证。");

      const reference = await githubRequest<GitRef>(`/repos/${repository}/git/ref/heads/${branch}`, cleanToken);
      const [parent, currentContent] = await Promise.all([
        githubRequest<GitCommit>(`/repos/${repository}/git/commits/${reference.object.sha}`, cleanToken),
        githubRequest<GitHubContent>(`/repos/${repository}/contents/content/doujin-posts.json?ref=${branch}`, cleanToken),
      ]);
      const currentPosts = decodePosts(currentContent, posts);
      const existingPost = editingId ? currentPosts.find((post) => post.id === editingId) : undefined;
      if (editingId && !existingPost) throw new Error("没有找到要修改的投稿，请刷新后重试。");

      const now = new Date();
      const id = editingId || `post-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${now.getTime().toString(36)}`;
      const coverPath = cover
        ? `doujin/${id}-${now.getTime().toString(36)}.${safeExtension(cover)}`
        : existingPost!.cover;
      const nextPost: DoujinPost = {
        id,
        title: form.title.trim(),
        japaneseTitle: form.japaneseTitle.trim() || "私のおすすめ",
        excerpt: form.excerpt.trim(),
        tags: parsedTags.length ? parsedTags : ["同人誌"],
        cover: coverPath,
        sourceUrl: form.sourceUrl.trim(),
        createdAt: existingPost?.createdAt || now.toISOString().slice(0, 10),
      };
      const nextPosts = editingId
        ? currentPosts.map((post) => post.id === editingId ? nextPost : post)
        : [nextPost, ...currentPosts];

      const contentBlob = await githubRequest<GitObject>(`/repos/${repository}/git/blobs`, cleanToken, {
        method: "POST",
        body: JSON.stringify({ content: textToBase64(JSON.stringify(nextPosts, null, 2) + "\n"), encoding: "base64" }),
      });
      const treeEntries: GitTreeEntry[] = [
        { path: "content/doujin-posts.json", mode: "100644", type: "blob", sha: contentBlob.sha },
      ];

      if (cover) {
        const coverBlob = await githubRequest<GitObject>(`/repos/${repository}/git/blobs`, cleanToken, {
          method: "POST",
          body: JSON.stringify({ content: bytesToBase64(new Uint8Array(await cover.arrayBuffer())), encoding: "base64" }),
        });
        treeEntries.unshift({ path: `public/${coverPath}`, mode: "100644", type: "blob", sha: coverBlob.sha });
      }

      const tree = await githubRequest<GitObject>(`/repos/${repository}/git/trees`, cleanToken, {
        method: "POST",
        body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries }),
      });
      const commit = await githubRequest<GitObject>(`/repos/${repository}/git/commits`, cleanToken, {
        method: "POST",
        body: JSON.stringify({
          message: `${editingId ? "Update" : "Add"} doujin post: ${form.title.trim()}`,
          tree: tree.sha,
          parents: [reference.object.sha],
        }),
      });
      await githubRequest<GitObject>(`/repos/${repository}/git/refs/heads/${branch}`, cleanToken, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: false }),
      });

      setPosts(nextPosts);
      setStatus("success");
      setMessage(editingId ? "修改已保存，网站会自动更新。" : "投稿已发布，网站会自动更新。");
      clearForm();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试。");
    }
  }

  return (
    <section className="editor-section" aria-label="同人誌投稿编辑器">
      <div className="editor-copy">
        <p className="section-index">01 / OWNER ONLY</p>
        <h2>投稿管理<small>お気に入りを編集する</small></h2>
        <p>只有站主账号验证通过后，才能新增或修改内容。</p>
        <div className="token-note">
          <strong>GitHub 权限</strong>
          <p>使用仅限本仓库、Contents 读写权限的精细令牌。令牌只在当前页面使用，不会保存。</p>
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">创建令牌 <span>↗</span></a>
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
              <p className={`publish-status is-${status}`} role="status">{message}</p>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
