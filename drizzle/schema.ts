import { relations } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const achievementTypeEnum = pgEnum("achievement_type", [
  "input",
  "output",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  passwordHash: varchar("password_hash").notNull(),
  // ログイン試行回数の制限（技術仕様書3.2）: 5回失敗で15分ロック
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

export const achievementGroups = pgTable("achievement_groups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 300 }).notNull(),
  color: varchar("color").notNull().default("slate"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  groupId: integer("group_id")
    .notNull()
    .references(() => achievementGroups.id, { onDelete: "restrict" }),
  date: date("date").notNull().defaultNow(),
  type: achievementTypeEnum("type").notNull(),
  theme: varchar("theme", { length: 300 }).notNull(),
  content: text("content"),
});

export const usersRelations = relations(users, ({ many }) => ({
  achievementGroups: many(achievementGroups),
  achievements: many(achievements),
}));

export const achievementGroupsRelations = relations(
  achievementGroups,
  ({ one, many }) => ({
    user: one(users, {
      fields: [achievementGroups.userId],
      references: [users.id],
    }),
    achievements: many(achievements),
  }),
);

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
  group: one(achievementGroups, {
    fields: [achievements.groupId],
    references: [achievementGroups.id],
  }),
}));
