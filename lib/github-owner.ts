const repository = "Galzzhfh/hikyo-personal-site";
const branch = "main";
const apiBase = "https://api.github.com";

type GitRef = { object: { sha: string } };
type GitCommit = { tree: { sha: string } };
type GitObject = { sha: string };
type GitHubUser = { login: string };
type GitHubContent = { content: string; encoding: string };
type GitHubError = { message?: string };
type GitTreeEntry = { path: string; mode: "100644"; type: "blob"; sha: string | null };

export type RepositoryMutation =
  | { path: string; content: string | Uint8Array }
  | { path: string; delete: true };

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64ToText(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

function permissionError() {
  return new Error("令牌无法访问此仓库。请把 Resource owner 设为 Galzzhfh，Repository access 选择 hikyo-personal-site，并将 Contents 设为 Read and write。");
}

export async function githubRequest<T>(path: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("X-GitHub-Api-Version", "2022-11-28");
  const response = await fetch(`${apiBase}${path}`, { ...init, headers });
  const data = await response.json() as T & GitHubError;
  if (!response.ok) {
    if (response.status === 403 && data.message?.includes("Resource not accessible by personal access token")) {
      throw permissionError();
    }
    throw new Error(data.message || `GitHub 请求失败（${response.status}）`);
  }
  return data;
}

export async function verifyOwner(token: string) {
  const user = await githubRequest<GitHubUser>("/user", token);
  if (user.login.toLowerCase() !== "galzzhfh") throw new Error("仅 Galzzhfh 可以进入管理页面。");
  await githubRequest(`/repos/${repository}`, token);
}

export async function readRepositoryJson<T>(path: string, token: string, fallback: T) {
  const content = await githubRequest<GitHubContent>(`/repos/${repository}/contents/${path}?ref=${branch}`, token);
  return content.encoding === "base64" ? JSON.parse(base64ToText(content.content)) as T : fallback;
}

export async function commitRepositoryFiles(token: string, message: string, mutations: RepositoryMutation[]) {
  await verifyOwner(token);
  const reference = await githubRequest<GitRef>(`/repos/${repository}/git/ref/heads/${branch}`, token);
  const parent = await githubRequest<GitCommit>(`/repos/${repository}/git/commits/${reference.object.sha}`, token);
  const treeEntries = await Promise.all(mutations.map(async (mutation): Promise<GitTreeEntry> => {
    if ("delete" in mutation) {
      return { path: mutation.path, mode: "100644", type: "blob", sha: null };
    }
    const bytes = typeof mutation.content === "string"
      ? new TextEncoder().encode(mutation.content)
      : mutation.content;
    const blob = await githubRequest<GitObject>(`/repos/${repository}/git/blobs`, token, {
      method: "POST",
      body: JSON.stringify({ content: bytesToBase64(bytes), encoding: "base64" }),
    });
    return { path: mutation.path, mode: "100644", type: "blob", sha: blob.sha };
  }));
  const tree = await githubRequest<GitObject>(`/repos/${repository}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree: treeEntries }),
  });
  const commit = await githubRequest<GitObject>(`/repos/${repository}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [reference.object.sha] }),
  });
  await githubRequest<GitObject>(`/repos/${repository}/git/refs/heads/${branch}`, token, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
}

export function safeImageExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension) ? extension : "jpg";
}
