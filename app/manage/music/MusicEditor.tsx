"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  commitRepositoryFiles,
  readRepositoryJson,
  safeImageExtension,
  verifyOwner,
  type RepositoryMutation,
} from "../../../lib/github-owner";
import type { MusicTrack } from "../../../lib/music";

type EditorProps = {
  initialTracks: MusicTrack[];
  basePath: string;
};

type EditorStatus = "idle" | "checking" | "ready" | "publishing" | "success" | "error";

const initialForm = { title: "", artist: "", songInput: "" };

function parseSongId(value: string) {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  return trimmed.match(/[?&#]id=(\d+)/)?.[1] ?? "";
}

export default function MusicEditor({ initialTracks, basePath }: EditorProps) {
  const [tracks, setTracks] = useState(initialTracks);
  const [token, setToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [message, setMessage] = useState("");

  const editingTrack = editingId ? tracks.find((track) => track.id === editingId) : undefined;
  const previewUrl = useMemo(() => cover ? URL.createObjectURL(cover) : "", [cover]);
  const previewSource = previewUrl || (editingTrack ? `${basePath}/${editingTrack.cover}` : "");

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function clearForm() {
    setEditingId(null);
    setForm(initialForm);
    setCover(null);
    setFileInputKey((value) => value + 1);
  }

  function editTrack(track: MusicTrack) {
    setEditingId(track.id);
    setForm({ title: track.title, artist: track.artist, songInput: track.songId });
    setCover(null);
    setFileInputKey((value) => value + 1);
    setStatus("ready");
    setMessage("");
  }

  async function verifyMusicOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    setStatus("checking");
    setMessage("正在验证站主身份…");
    try {
      const cleanToken = token.trim();
      await verifyOwner(cleanToken);
      setTracks(await readRepositoryJson("content/music-tracks.json", cleanToken, tracks));
      setAuthorized(true);
      setStatus("ready");
      setMessage("");
    } catch (error) {
      setAuthorized(false);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "身份验证失败。");
    }
  }

  async function publishTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authorized || !token.trim() || !form.title.trim() || !form.artist.trim()) return;
    const songId = parseSongId(form.songInput);
    if (!songId) {
      setStatus("error");
      setMessage("请输入网易云歌曲 ID 或歌曲链接。");
      return;
    }
    if (!editingId && !cover) {
      setStatus("error");
      setMessage("新增曲目需要选择唱片封面。");
      return;
    }
    if (cover && cover.size > 8 * 1024 * 1024) {
      setStatus("error");
      setMessage("封面图片请控制在 8 MB 以内。");
      return;
    }

    setStatus("publishing");
    setMessage(editingId ? "正在保存修改…" : "正在添加曲目…");
    try {
      const cleanToken = token.trim();
      const currentTracks = await readRepositoryJson("content/music-tracks.json", cleanToken, tracks);
      const existingTrack = editingId ? currentTracks.find((track) => track.id === editingId) : undefined;
      if (editingId && !existingTrack) throw new Error("没有找到要修改的曲目，请刷新后重试。");
      const now = new Date();
      const id = editingId || `track-${songId}-${now.getTime().toString(36)}`;
      const coverPath = cover
        ? `music/${id}-${now.getTime().toString(36)}.${safeImageExtension(cover)}`
        : existingTrack!.cover;
      const nextTrack: MusicTrack = {
        id,
        title: form.title.trim(),
        artist: form.artist.trim(),
        songId,
        cover: coverPath,
        createdAt: existingTrack?.createdAt || now.toISOString().slice(0, 10),
      };
      const nextTracks = editingId
        ? currentTracks.map((track) => track.id === editingId ? nextTrack : track)
        : [...currentTracks, nextTrack];
      const mutations: RepositoryMutation[] = [
        { path: "content/music-tracks.json", content: JSON.stringify(nextTracks, null, 2) + "\n" },
      ];
      if (cover) {
        mutations.unshift({ path: `public/${coverPath}`, content: new Uint8Array(await cover.arrayBuffer()) });
        if (existingTrack?.cover.startsWith("music/") && existingTrack.cover !== coverPath) {
          mutations.push({ path: `public/${existingTrack.cover}`, delete: true });
        }
      }
      await commitRepositoryFiles(cleanToken, `${editingId ? "Update" : "Add"} music track: ${nextTrack.title}`, mutations);
      setTracks(nextTracks);
      clearForm();
      setStatus("success");
      setMessage(editingId ? "修改已保存，网站会自动更新。" : "曲目已添加，网站会自动更新。");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试。");
    }
  }

  async function deleteTrack(track: MusicTrack) {
    if (!authorized || !token.trim() || !window.confirm(`确定删除「${track.title}」吗？`)) return;
    setStatus("publishing");
    setMessage("正在删除曲目…");
    try {
      const cleanToken = token.trim();
      const currentTracks = await readRepositoryJson("content/music-tracks.json", cleanToken, tracks);
      const target = currentTracks.find((item) => item.id === track.id);
      if (!target) throw new Error("没有找到要删除的曲目，请刷新后重试。");
      const nextTracks = currentTracks.filter((item) => item.id !== track.id);
      const mutations: RepositoryMutation[] = [
        { path: "content/music-tracks.json", content: JSON.stringify(nextTracks, null, 2) + "\n" },
      ];
      if (target.cover.startsWith("music/")) mutations.push({ path: `public/${target.cover}`, delete: true });
      await commitRepositoryFiles(cleanToken, `Delete music track: ${target.title}`, mutations);
      setTracks(nextTracks);
      clearForm();
      setStatus("success");
      setMessage("曲目已删除，网站会自动更新。");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "删除失败，请稍后重试。");
    }
  }

  return (
    <section className="editor-section" aria-label="音乐管理编辑器">
      <div className="editor-copy">
        <p className="section-index">02 / OWNER ONLY</p>
        <h2>音乐管理<small>音楽を編集する</small></h2>
        <p>只有站主账号验证通过后，才能新增、修改或删除曲目。</p>
        <div className="token-note">
          <strong>GitHub 权限</strong>
          <p>Resource owner 选择 Galzzhfh，仓库选择 hikyo-personal-site，Contents 设为 Read and write。令牌不会保存。</p>
          <a href="https://github.com/settings/personal-access-tokens/new?name=Hikyo%20Site%20Editor&amp;target_name=Galzzhfh&amp;contents=write" target="_blank" rel="noreferrer">创建令牌 <span>↗</span></a>
        </div>
      </div>

      {!authorized ? (
        <form className="owner-gate" onSubmit={verifyMusicOwner}>
          <span className="owner-seal">音</span>
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
          <div className="post-manager" aria-label="已有曲目">
            <button className={!editingId ? "is-active" : ""} type="button" onClick={clearForm}>＋ 新增曲目</button>
            {tracks.map((track) => (
              <button className={editingId === track.id ? "is-active" : ""} type="button" key={track.id} onClick={() => editTrack(track)}>
                <span>{track.title}</span><small>修改</small>
              </button>
            ))}
          </div>
          <form className="editor-form" onSubmit={publishTrack}>
            <div className="editor-mode field-wide"><span>{editingId ? "EDIT TRACK" : "NEW TRACK"}</span><strong>{editingId ? "修改曲目" : "新增曲目"}</strong></div>
            <label className="field">
              <span>曲名</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={80} required />
            </label>
            <label className="field">
              <span>作者</span>
              <input value={form.artist} onChange={(event) => setForm({ ...form, artist: event.target.value })} maxLength={80} required />
            </label>
            <label className="field field-wide">
              <span>网易云歌曲 ID 或链接</span>
              <input value={form.songInput} onChange={(event) => setForm({ ...form, songInput: event.target.value })} placeholder="1367154014" required />
            </label>
            <label className="field field-wide cover-field">
              <span>唱片封面{editingId ? "（不更换可留空）" : ""}</span>
              <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setCover(event.target.files?.[0] ?? null)} required={!editingId} />
            </label>
            <div className="editor-preview music-editor-preview field-wide" aria-label="曲目预览">
              <div className="preview-cover">
                {previewSource ? <img src={previewSource} alt="唱片封面预览" /> : <span>唱片封面</span>}
              </div>
              <div><p>NOW PLAYING</p><h3>{form.title || "曲目名称"}</h3><span>{form.artist || "作者"}</span></div>
            </div>
            <div className="publish-row field-wide">
              <button type="submit" disabled={status === "publishing"}>{status === "publishing" ? "保存中…" : editingId ? "保存修改" : "添加曲目"}<span>→</span></button>
              {editingTrack ? <button className="delete-button" type="button" disabled={status === "publishing"} onClick={() => deleteTrack(editingTrack)}>删除曲目</button> : null}
              <p className={`publish-status is-${status}`} role="status">{message}</p>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
