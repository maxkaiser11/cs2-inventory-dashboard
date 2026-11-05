import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  steamId: text("steam_id").primaryKey(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  profileUrl: text("profile_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
