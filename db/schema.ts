import { sql } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const doujinLikes = sqliteTable(
  "doujin_likes",
  {
    postId: text("post_id").notNull(),
    deviceId: text("device_id").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({
      name: "doujin_likes_post_device_pk",
      columns: [table.postId, table.deviceId],
    }),
  ],
);
