"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { DoujinPost } from "../../lib/doujin";

type SortMode = "newest" | "likes";

type GalleryProps = {
  posts: DoujinPost[];
  basePath: string;
  apiEndpoint: string;
};

const deviceKey = "hikyo-doujin-device-v1";
const likedPostsKey = "hikyo-doujin-liked-v1";

function getDeviceId() {
  const stored = window.localStorage.getItem(deviceKey);
  if (stored) return stored;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(deviceKey, created);
  return created;
}

function readLikedPosts() {
  try {
    const value = JSON.parse(window.localStorage.getItem(likedPostsKey) ?? "[]");
    return new Set<string>(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function saveLikedPosts(value: Set<string>) {
  window.localStorage.setItem(likedPostsKey, JSON.stringify([...value]));
}

export default function DoujinGallery({ posts, basePath, apiEndpoint }: GalleryProps) {
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [pendingPosts, setPendingPosts] = useState<Set<string>>(new Set());
  const pendingRef = useRef(new Set<string>());

  useEffect(() => {
    queueMicrotask(() => setLikedPosts(readLikedPosts()));
    const postIds = posts.map((post) => post.id).join(",");
    if (!postIds) return;

    const controller = new AbortController();
    fetch(`${apiEndpoint}?postIds=${encodeURIComponent(postIds)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("likes unavailable");
        return response.json() as Promise<{ likes?: Record<string, number> }>;
      })
      .then((data) => setLikes(data.likes ?? {}))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLikes({});
      });

    return () => controller.abort();
  }, [apiEndpoint, posts]);

  const sortedPosts = useMemo(() => {
    return posts
      .map((post, index) => ({ post, index }))
      .sort((left, right) => {
        if (sortMode === "likes") {
          const likeDifference = (likes[right.post.id] ?? 0) - (likes[left.post.id] ?? 0);
          if (likeDifference) return likeDifference;
        }
        const dateDifference = Date.parse(right.post.createdAt) - Date.parse(left.post.createdAt);
        return dateDifference || left.index - right.index;
      })
      .map(({ post }) => post);
  }, [likes, posts, sortMode]);

  async function likePost(postId: string) {
    if (likedPosts.has(postId) || pendingRef.current.has(postId)) return;
    pendingRef.current.add(postId);
    setPendingPosts(new Set(pendingRef.current));
    setLikes((current) => ({ ...current, [postId]: (current[postId] ?? 0) + 1 }));

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, deviceId: getDeviceId() }),
      });
      const data = await response.json() as { count?: number; liked?: boolean; error?: string };
      if (!response.ok || !data.liked) throw new Error(data.error || "like failed");

      setLikes((current) => ({ ...current, [postId]: data.count ?? current[postId] ?? 0 }));
      setLikedPosts((current) => {
        const next = new Set(current).add(postId);
        saveLikedPosts(next);
        return next;
      });
    } catch {
      setLikes((current) => ({ ...current, [postId]: Math.max(0, (current[postId] ?? 1) - 1) }));
    } finally {
      pendingRef.current.delete(postId);
      setPendingPosts(new Set(pendingRef.current));
    }
  }

  return (
    <>
      <div className="resource-toolbar" aria-label="漫画排序">
        <button type="button" className={sortMode === "newest" ? "is-active" : ""} onClick={() => setSortMode("newest")}>最新</button>
        <button type="button" className={sortMode === "likes" ? "is-active" : ""} onClick={() => setSortMode("likes")}>最多赞</button>
      </div>
      <div className="resource-grid">
        {sortedPosts.map((item, index) => {
          const liked = likedPosts.has(item.id);
          const pending = pendingPosts.has(item.id);
          return (
            <article
              className="resource-card"
              key={item.id}
              style={{ "--card-delay": `${Math.min(index, 10) * 70}ms` } as CSSProperties}
            >
              <div className="resource-cover">
                <img
                  src={`${basePath}/${item.cover}`}
                  alt={`${item.title} 封面`}
                  loading={index > 3 ? "lazy" : undefined}
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="resource-card-body">
                <p>{item.japaneseTitle}</p>
                <h2>{item.title}</h2>
                <p className="resource-card-summary">{item.excerpt}</p>
                <div className="resource-card-meta">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="resource-card-actions">
                  {item.sourceUrl ? <a className="resource-link" href={item.sourceUrl} target="_blank" rel="noreferrer">查看收藏 <span>↗</span></a> : <span />}
                  <button
                    type="button"
                    className={`like-button${liked ? " is-liked" : ""}`}
                    aria-label={liked ? `已赞 ${item.title}` : `点赞 ${item.title}`}
                    aria-pressed={liked}
                    disabled={liked || pending}
                    onClick={() => likePost(item.id)}
                  >
                    <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
                    <strong>{likes[item.id] ?? 0}</strong>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
