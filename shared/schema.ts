import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  role: varchar("role", { enum: ["listener", "participant", "admin"] }).default("listener"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { enum: ["active", "inactive", "trial", "canceled"] }).default("inactive"),
  trialExpiresAt: timestamp("trial_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const genres = pgTable("genres", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  maxTrialSlots: integer("max_trial_slots").default(100),
  filledTrialSlots: integer("filled_trial_slots").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const battles = pgTable("battles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  genreId: varchar("genre_id").references(() => genres.id),
  createdById: varchar("created_by_id").references(() => users.id),
  status: varchar("status", { enum: ["active", "ended", "pending"] }).default("active"),
  endsAt: timestamp("ends_at").notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tracks = pgTable("tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  artistId: varchar("artist_id").references(() => users.id),
  battleId: varchar("battle_id").references(() => battles.id),
  audioUrl: varchar("audio_url"),
  bandlabUrl: varchar("bandlab_url"),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  trackId: varchar("track_id").references(() => tracks.id),
  battleId: varchar("battle_id").references(() => battles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").references(() => users.id),
  referredUserId: varchar("referred_user_id").references(() => users.id),
  socialPostUrl: varchar("social_post_url"),
  status: varchar("status", { enum: ["pending", "verified", "completed"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentRatings = pgTable("content_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  battleId: varchar("battle_id").references(() => battles.id),
  trackId: varchar("track_id").references(() => tracks.id),
  rating: varchar("rating", { enum: ["All Ages", "13+", "18+"] }).default("All Ages"),
  flaggedBy: text("flagged_by").array(),
  confirmedByAdmin: boolean("confirmed_by_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id),
  stripeAccountId: varchar("stripe_account_id"),
  payoutSchedule: varchar("payout_schedule", { enum: ["daily", "weekly", "monthly"] }).default("monthly"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trialSlots = pgTable("trial_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  genreId: varchar("genre_id").references(() => genres.id),
  userId: varchar("user_id").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  battles: many(battles),
  tracks: many(tracks),
  votes: many(votes),
  referralsGiven: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
  adminSettings: one(adminSettings),
  trialSlots: many(trialSlots),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  battles: many(battles),
  trialSlots: many(trialSlots),
}));

export const battlesRelations = relations(battles, ({ one, many }) => ({
  genre: one(genres, {
    fields: [battles.genreId],
    references: [genres.id],
  }),
  creator: one(users, {
    fields: [battles.createdById],
    references: [users.id],
  }),
  tracks: many(tracks),
  votes: many(votes),
  contentRating: one(contentRatings),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  artist: one(users, {
    fields: [tracks.artistId],
    references: [users.id],
  }),
  battle: one(battles, {
    fields: [tracks.battleId],
    references: [battles.id],
  }),
  votes: many(votes),
  contentRating: one(contentRatings),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  track: one(tracks, {
    fields: [votes.trackId],
    references: [tracks.id],
  }),
  battle: one(battles, {
    fields: [votes.battleId],
    references: [battles.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  username: true,
});

export const insertGenreSchema = createInsertSchema(genres).omit({
  id: true,
  createdAt: true,
});

export const insertBattleSchema = createInsertSchema(battles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Genre = typeof genres.$inferSelect;
export type Battle = typeof battles.$inferSelect;
export type Track = typeof tracks.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type ContentRating = typeof contentRatings.$inferSelect;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type TrialSlot = typeof trialSlots.$inferSelect;

export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type InsertBattle = z.infer<typeof insertBattleSchema>;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
