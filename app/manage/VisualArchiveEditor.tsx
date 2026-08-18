"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { VisualArchiveItem } from "../../lib/archive";
import {
  commitRepositoryFiles,
  readRepositoryJson,
  safeImageExtension,
  verifyOwner,
  type RepositoryMutation,
} from "../../lib/github-owner";

type ArchiveKind = "game" | "anime";

type EditorProps = {
  initialItems: VisualArchiveItem[];
  basePath: string;
  kind: ArchiveKind;
};

type EditorStatus = "idle" | "checking" | "ready" | "publishing" | "success" | "error";

const configs = {
  game: {
    title: "游戏管理",
    itemName: "游戏",
    defaultTag: "游戏",
    repositoryPath: "content/game-posts.json",
    assetDirectory: "games",
  },
  anime: {
    title: "动画管理",
    itemName: "动画",
    defaultTag: "动画",
    repositoryPath: "content/anime-posts.json",
    assetDirectory: "anime",
  },
} as const;

const initialForm = { title: "", japaneseTitle: "", summary: "", thoughts: "", tags: "" };

export default function VisualArchiveEditor({ initialItems, basePath, kind }: EditorProps) {
  const config = configs[kind];
  const operationInFlightRef = useRef(false);
  const [items, setItems] = useState(initialItems);
  const [token, setToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [previews, setPreviews] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewInputKey, setPreviewInputKey] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [message, setMessage] = useState("");

  const editingItem = editingId ? items.find((item) => item.id === editingId) : undefined;
  const coverPreviewUrl = useMemo(() => cover ? URL.createObjectURL(cover) : "", [cover]);
  const previewUrls = useMemo(() => previews.map((file) => URL.createObjectURL(file)), [previews]);
  const previewSource = coverPreviewUrl || (editingItem ? `${basePath}/${editingItem.cover}` : "");
  const shownPreviews = previewUrls.length ? previewUrls : (editingItem?.previews ?? []).map((path) => `${basePath}/${path}`);
  const parsedTags = form.tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean).slice(0, 6);

  useEffect(() => () => {
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

  useEffect(() => () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  function clearForm() {
    setEditingId(null);
    setForm({ ...initialForm, tags: config.defaultTag });
    setCover(null);
    setPreviews([]);
    setFileInputKey((value) => value + 1);
    setPreviewInputKey((value) => value + 1);
  }

  function editItem(item: VisualArchiveItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      japaneseTitle: item.japaneseTitle,
      summary: item.summary,
      thoughts: item.thoughts,
      tags: item.tags.join(", "),
    });
    setCover(null);
    setPreviews([]);
    setFileInputKey((value) => value + 1);
    setPreviewInputKey((value) => value + 1);
    setStatus("ready");
    setMessage("");
  }

  async function verifyArchiveOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    setStatus("checking");
    setMessage("正在验证站主身份…");
    try {
      const cleanToken = token.trim();
      await verifyOwner(cleanToken);
      setItems(await readRepositoryJson<VisualArchiveItem[]>(config.repositoryPath, cleanToken, items));
      setAuthorized(true);
      setStatus("ready");
      setMessage("");
    } catch (error) {
      setAuthorized(false);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "身份验证失败。");
    }
  }

  async function publishItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorized || !token.trim() || !form.title.trim() || !form.summary.trim() || !form.thoughts.trim()) return;
    if (!editingId && !cover) {
      setStatus("error");
      setMessage(`新增${config.itemName}需要选择封面图片。`);
      return;
    }
    if (cover && cover.size > 8 * 1024 * 1024) {
      setStatus("error");
      setMessage("封面图片请控制在 8 MB 以内。");
      return;
    }
    if (previews.length > 12) {
      setStatus("error");
      setMessage("一次最多上传 12 张预览图。");
      return;
    }
    if (previews.some((file) => file.size > 8 * 1024 * 1024)) {
      setStatus("error");
      setMessage("每张预览图请控制在 8 MB 以内。");
      return;
    }
    if (operationInFlightRef.current) return;
    operationInFlightRef.current = true;
    setStatus("publishing");
    setMessage(editingId ? "正在保存修改…" : `正在添加${config.itemName}…`);

    try {
      const cleanToken = token.trim();
      const currentItems = await readRepositoryJson<VisualArchiveItem[]>(config.repositoryPath, cleanToken, items);
      const existingItem = editingId ? currentItems.find((item) => item.id === editingId) : undefined;
      if (editingId && !existingItem) throw new Error(`没有找到要修改的${config.itemName}，请刷新后重试。`);

      const now = new Date();
      const stamp = now.getTime().toString(36);
      const id = editingId || `${kind}-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${stamp}`;
      const coverPath = cover
        ? `${config.assetDirectory}/${id}-cover-${stamp}.${safeImageExtension(cover)}`
        : existingItem!.cover;
      const oldPreviews = existingItem?.previews ?? [];
      let previewPaths = previews.length
        ? previews.map((file, index) => `${config.assetDirectory}/${id}-preview-${String(index + 1).padStart(2, "0")}-${stamp}.${safeImageExtension(file)}`)
        : oldPreviews;
      if (!previews.length && cover && existingItem) {
        previewPaths = previewPaths.map((path) => path === existingItem.cover ? coverPath : path);
      }
      if (!previewPaths.length) previewPaths = [coverPath];

      const nextItem: VisualArchiveItem = {
        id,
        title: form.title.trim(),
        japaneseTitle: form.japaneseTitle.trim() || "私のおすすめ",
        summary: form.summary.trim(),
        thoughts: form.thoughts.trim(),
        tags: parsedTags.length ? parsedTags : [config.defaultTag],
        cover: coverPath,
        previews: previewPaths,
        createdAt: existingItem?.createdAt || now.toISOString(),
      };
      const nextItems = editingId
        ? currentItems.map((item) => item.id === editingId ? nextItem : item)
        : [nextItem, ...currentItems];
      const mutations: RepositoryMutation[] = [
        { path: config.repositoryPath, content: JSON.stringify(nextItems, null, 2) + "\n" },
      ];

      if (cover) mutations.unshift({ path: `public/${coverPath}`, content: new Uint8Array(await cover.arrayBuffer()) });
      if (previews.length) {
        const previewMutations = await Promise.all(previews.map(async (file, index): Promise<RepositoryMutation> => ({
          path: `public/${previewPaths[index]}`,
          content: new Uint8Array(await file.arrayBuffer()),
        })));
        mutations.unshift(...previewMutations);
      }

      const keptPaths = new Set([coverPath, ...previewPaths]);
      const replacedPaths = new Set([existingItem?.cover, ...oldPreviews]);
      replacedPaths.forEach((path) => {
        if (path?.startsWith(`${config.assetDirectory}/`) && !keptPaths.has(path)) {
          mutations.push({ path: `public/${path}`, delete: true });
        }
      });

      await commitRepositoryFiles(cleanToken, `${editingId ? "Update" : "Add"} ${kind}: ${nextItem.title}`, mutations);
      setItems(nextItems);
      clearForm();
      setStatus("success");
      setMessage(editingId ? "修改已保存，网站会自动更新。" : `${config.itemName}已添加，网站会自动更新。`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试。");
    } finally {
      operationInFlightRef.current = false;
    }
  }

  async function deleteItem(item: VisualArchiveItem) {
    if (!authorized || !token.trim() || !window.confirm(`确定删除「${item.title}」吗？`)) return;
    if (operationInFlightRef.current) return;
    operationInFlightRef.current = true;
    setStatus("publishing");
    setMessage(`正在删除${config.itemName}…`);
    try {
      const cleanToken = token.trim();
      const currentItems = await readRepositoryJson<VisualArchiveItem[]>(config.repositoryPath, cleanToken, items);
      const target = currentItems.find((current) => current.id === item.id);
      if (!target) throw new Error(`没有找到要删除的${config.itemName}，请刷新后重试。`);
      const nextItems = currentItems.filter((current) => current.id !== item.id);
      const mutations: RepositoryMutation[] = [
        { path: config.repositoryPath, content: JSON.stringify(nextItems, null, 2) + "\n" },
      ];
      [...new Set([target.cover, ...target.previews])].forEach((path) => {
        if (path.startsWith(`${config.assetDirectory}/`)) mutations.push({ path: `public/${path}`, delete: true });
      });
      await commitRepositoryFiles(cleanToken, `Delete ${kind}: ${target.title}`, mutations);
      setItems(nextItems);
      clearForm();
      setStatus("success");
      setMessage(`${config.itemName}已删除，网站会自动更新。`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "删除失败，请稍后重试。");
    } finally {
      operationInFlightRef.current = false;
    }
  }

  return (
    <section className="editor-section" aria-label={`${config.title}编辑器`}>
      <div className="editor-copy">
        <p className="section-index">01 / OWNER ONLY</p>
        <h2>{config.title}<small>お気に入りを編集する</small></h2>
        <p>只有站主账号验证通过后，才能新增、修改或删除内容。</p>
        <div className="token-note">
          <strong>GitHub 权限</strong>
          <p>Resource owner 选择 Galzzhfh，仓库选择 hikyo-personal-site，Contents 设为 Read and write。令牌不会保存。</p>
        </div>
      </div>

      {!authorized ? (
        <form className="owner-gate" onSubmit={verifyArchiveOwner}>
          <span className="owner-seal">秘</span>
          <h3>站主验证</h3>
          <label className="field"><span>GitHub 令牌</span><input type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" placeholder="github_pat_…" required /></label>
          <button className="owner-unlock" type="submit" disabled={status === "checking"}>{status === "checking" ? "验证中…" : "进入管理"}<span>→</span></button>
          <p className={`publish-status is-${status}`} role="status">{message}</p>
        </form>
      ) : (
        <div className="editor-workspace">
          <div className="owner-toolbar"><span>Galzzhfh</span><button type="button" onClick={() => { setAuthorized(false); setToken(""); clearForm(); setStatus("idle"); setMessage(""); }}>锁定</button></div>
          <div className="post-manager" aria-label={`已有${config.itemName}`}>
            <button className={!editingId ? "is-active" : ""} type="button" onClick={clearForm}>＋ 新增{config.itemName}</button>
            {items.map((item) => <button className={editingId === item.id ? "is-active" : ""} type="button" key={item.id} onClick={() => editItem(item)}><span>{item.title}</span><small>修改</small></button>)}
          </div>

          <form className="editor-form" onSubmit={publishItem}>
            <div className="editor-mode field-wide"><span>{editingId ? "EDIT ITEM" : "NEW ITEM"}</span><strong>{editingId ? `修改${config.itemName}` : `新增${config.itemName}`}</strong></div>
            <label className="field"><span>标题</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
            <label className="field"><span>日文标题</span><input value={form.japaneseTitle} onChange={(event) => setForm({ ...form, japaneseTitle: event.target.value })} /></label>
            <label className="field field-wide"><span>卡片简介</span><input value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required /></label>
            <label className="field field-wide"><span>{kind === "game" ? "通关感想" : "观后感"}</span><textarea value={form.thoughts} onChange={(event) => setForm({ ...form, thoughts: event.target.value })} required /></label>
            <label className="field field-wide"><span>标签（逗号分隔）</span><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></label>
            <label className="field field-wide cover-field"><span>封面图片{editingId ? "（不更换可留空）" : ""}</span><input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setCover(event.target.files?.[0] ?? null)} required={!editingId} /></label>
            <label className="field field-wide cover-field"><span>预览图（可多选，重新选择会替换原预览图）</span><input key={previewInputKey} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setPreviews(Array.from(event.target.files ?? []))} /></label>
            {shownPreviews.length ? <div className="reader-upload-preview field-wide" aria-label="预览图预览">{shownPreviews.map((source, index) => <img src={source} alt={`预览图 ${index + 1}`} key={source} />)}</div> : null}
            <div className="editor-preview field-wide">
              <div className="preview-cover">{previewSource ? <img src={previewSource} alt="封面预览" /> : "封面预览"}</div>
              <div><p>{form.japaneseTitle || "私のおすすめ"}</p><h3>{form.title || `${config.itemName}标题`}</h3><span>{form.summary || "卡片简介"}</span></div>
            </div>
            <div className="publish-row field-wide">
              <button type="submit" disabled={status === "publishing"}>{status === "publishing" ? "保存中…" : editingId ? "保存修改" : `添加${config.itemName}`}<span>→</span></button>
              {editingItem ? <button className="delete-button" type="button" onClick={() => deleteItem(editingItem)} disabled={status === "publishing"}>删除{config.itemName}</button> : null}
              <p className={`publish-status is-${status}`} role="status">{message}</p>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
