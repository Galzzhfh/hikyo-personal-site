import { count, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { doujinLikes } from "../../../db/schema";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

function validPostId(value: string) {
  return /^[a-zA-Z0-9_-]{1,120}$/.test(value);
}

function validDeviceId(value: string) {
  return /^[a-f0-9-]{20,80}$/i.test(value);
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const postIds = [...new Set((url.searchParams.get("postIds") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(validPostId))].slice(0, 100);

    if (!postIds.length) return json({ likes: {} });

    const rows = await getDb()
      .select({ postId: doujinLikes.postId, total: count(doujinLikes.deviceId) })
      .from(doujinLikes)
      .where(inArray(doujinLikes.postId, postIds))
      .groupBy(doujinLikes.postId);

    return json({
      likes: Object.fromEntries(rows.map((row) => [row.postId, Number(row.total)])),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load likes";
    return json({ error: message }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { postId?: string; deviceId?: string };
    const postId = payload.postId?.trim() ?? "";
    const deviceId = payload.deviceId?.trim() ?? "";

    if (!validPostId(postId) || !validDeviceId(deviceId)) {
      return json({ error: "Invalid like request" }, 400);
    }

    const db = getDb();
    const inserted = await db
      .insert(doujinLikes)
      .values({ postId, deviceId })
      .onConflictDoNothing()
      .returning({ deviceId: doujinLikes.deviceId });
    const [result] = await db
      .select({ total: count(doujinLikes.deviceId) })
      .from(doujinLikes)
      .where(eq(doujinLikes.postId, postId));

    return json({ postId, count: Number(result?.total ?? 0), liked: true, added: inserted.length > 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save like";
    return json({ error: message }, 500);
  }
}
