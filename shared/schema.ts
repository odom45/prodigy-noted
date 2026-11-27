import { sql } from 'drizzle-orm';
import {
  index,
  uniqueIndex,
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
  membershipTier: varchar("membership_tier", { enum: ["free", "regular", "vip"] }).notNull().default("free"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  ageVerifiedAt: timestamp("age_verified_at", { withTimezone: true }),
  competitionSuspendedUntil: timestamp("competition_suspended_until", { withTimezone: true }),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
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
  maxTrialSlots: integer("max_trial_slots").notNull().default(100),
  filledTrialSlots: integer("filled_trial_slots").notNull().default(0),
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
}, (table) => [
  uniqueIndex("votes_user_battle_unique").on(table.userId, table.battleId),
]);

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


// Prodigy Noted music-social foundation. These tables back the new platform
// domains; privileged transitions are enforced by server services, never clients.
export const artistProfiles = pgTable("artist_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 80 }),
  biography: text("biography"),
  primaryGenreId: varchar("primary_genre_id").references(() => genres.id, { onDelete: "set null" }),
  coverImageUrl: text("cover_image_url"),
  websiteUrl: text("website_url"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const artistFollows = pgTable("artist_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerUserId: varchar("follower_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  artistUserId: varchar("artist_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("artist_follows_pair_unique").on(table.followerUserId, table.artistUserId),
  index("artist_follows_artist_idx").on(table.artistUserId),
]);

export const crews = pgTable("crews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  description: text("description"),
  leaderUserId: varchar("leader_user_id").notNull().references(() => users.id),
  avatarUrl: text("avatar_url"),
  status: varchar("status", { enum: ["active", "suspended", "archived"] }).notNull().default("active"),
  experiencePoints: integer("experience_points").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const crewMembers = pgTable("crew_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crewId: varchar("crew_id").notNull().references(() => crews.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { enum: ["leader", "member"] }).notNull().default("member"),
  status: varchar("status", { enum: ["invited", "active", "declined", "removed"] }).notNull().default("invited"),
  invitedByUserId: varchar("invited_by_user_id").references(() => users.id),
  joinedAt: timestamp("joined_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("crew_members_pair_unique").on(table.crewId, table.userId),
  index("crew_members_user_idx").on(table.userId, table.status),
]);

export const battleEntries = pgTable("battle_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  battleId: varchar("battle_id").notNull().references(() => battles.id, { onDelete: "cascade" }),
  trackId: varchar("track_id").notNull().references(() => tracks.id),
  submittedByUserId: varchar("submitted_by_user_id").notNull().references(() => users.id),
  side: varchar("side", { enum: ["A", "B"] }).notNull(),
  durationSnapshotSeconds: integer("duration_snapshot_seconds").notNull(),
  rightsConfirmedAt: timestamp("rights_confirmed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("battle_entries_side_unique").on(table.battleId, table.side),
  uniqueIndex("battle_entries_track_unique").on(table.battleId, table.trackId),
]);

export const battleVoteAssignments = pgTable("battle_vote_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  battleId: varchar("battle_id").notNull().references(() => battles.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { enum: ["assigned", "qualified", "voted", "expired", "skipped"] }).notNull().default("assigned"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("battle_vote_assignment_unique").on(table.battleId, table.userId),
  index("battle_vote_assignments_user_status_idx").on(table.userId, table.status),
]);

export const battleListenSessions = pgTable("battle_listen_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull().references(() => battleVoteAssignments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  battleId: varchar("battle_id").notNull().references(() => battles.id, { onDelete: "cascade" }),
  side: varchar("side", { enum: ["A", "B"] }).notNull(),
  durationSnapshotSeconds: integer("duration_snapshot_seconds").notNull(),
  qualifiedListenedSeconds: integer("qualified_listened_seconds").notNull().default(0),
  sessionTokenHash: varchar("session_token_hash").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
  qualifiedAt: timestamp("qualified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("battle_listen_sessions_assignment_idx").on(table.assignmentId, table.side),
]);

export const battleListenSegments = pgTable("battle_listen_segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listenSessionId: varchar("listen_session_id").notNull().references(() => battleListenSessions.id, { onDelete: "cascade" }),
  sequenceNumber: integer("sequence_number").notNull(),
  mediaStartSecond: integer("media_start_second").notNull(),
  mediaEndSecond: integer("media_end_second").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("listen_segment_sequence_unique").on(table.listenSessionId, table.sequenceNumber),
]);

export const userCompetitionProgress = pgTable("user_competition_progress", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  experiencePoints: integer("experience_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const competitionCycles = pgTable("competition_cycles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tier: varchar("tier", { enum: ["regular", "vip"] }).notNull(),
  cycleNumber: integer("cycle_number").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  requiredVotes: integer("required_votes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("competition_cycle_tier_number_unique").on(table.tier, table.cycleNumber),
]);

export const seasons = pgTable("seasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seasonYear: integer("season_year").notNull(),
  quarter: integer("quarter").notNull(),
  status: varchar("status", { enum: ["upcoming", "open", "active", "completed", "cancelled"] }).notNull().default("upcoming"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  rulesVersion: varchar("rules_version", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("season_year_quarter_unique").on(table.seasonYear, table.quarter),
]);

export const seasonEntries = pgTable("season_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seasonId: varchar("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
  artistUserId: varchar("artist_user_id").notNull().references(() => users.id),
  points: integer("points").notNull().default(0),
  placement: integer("placement"),
  qualifiedForChampionship: boolean("qualified_for_championship").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("season_artist_unique").on(table.seasonId, table.artistUserId),
  index("season_entries_ranking_idx").on(table.seasonId, table.points),
]);

export const moderationCases = pgTable("moderation_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterUserId: varchar("reporter_user_id").references(() => users.id, { onDelete: "set null" }),
  subjectUserId: varchar("subject_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: varchar("target_type", { enum: ["comment", "track", "profile", "message", "crew", "battle"] }).notNull(),
  targetId: varchar("target_id").notNull(),
  reasonCode: varchar("reason_code").notNull(),
  description: text("description"),
  status: varchar("status", { enum: ["open", "reviewing", "resolved", "appealed", "closed"] }).notNull().default("open"),
  enforcementAction: varchar("enforcement_action", { enum: ["none", "warning", "temporary_suspension", "competition_suspension", "permanent_ban"] }),
  evidence: jsonb("evidence").notNull().default(sql`'[]'::jsonb`),
  moderatorUserId: varchar("moderator_user_id").references(() => users.id, { onDelete: "set null" }),
  decisionReason: text("decision_reason"),
  appealedAt: timestamp("appealed_at", { withTimezone: true }),
  appealDecision: text("appeal_decision"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("moderation_cases_subject_idx").on(table.subjectUserId, table.createdAt),
  index("moderation_cases_status_idx").on(table.status, table.createdAt),
]);

export const studioProjects = pgTable("studio_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  crewId: varchar("crew_id").references(() => crews.id, { onDelete: "set null" }),
  title: varchar("title", { length: 120 }).notNull(),
  projectData: jsonb("project_data").notNull().default(sql`'{}'::jsonb`),
  visibility: varchar("visibility", { enum: ["private", "crew", "unlisted"] }).notNull().default("private"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("studio_projects_owner_updated_idx").on(table.ownerUserId, table.updatedAt),
]);

export const studioProjectMembers = pgTable("studio_project_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => studioProjects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { enum: ["viewer", "editor", "producer"] }).notNull(),
  invitedByUserId: varchar("invited_by_user_id").references(() => users.id),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("studio_project_member_unique").on(table.projectId, table.userId),
]);

export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  eventId: varchar("event_id").primaryKey(),
  eventType: varchar("event_type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  processingError: text("processing_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payoutLedgerEntries = pgTable("payout_ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sourceType: varchar("source_type", { enum: ["prize", "referral", "royalty", "adjustment", "reversal"] }).notNull(),
  sourceId: varchar("source_id").notNull(),
  amountCents: decimal("amount_cents", { precision: 18, scale: 0 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status", { enum: ["pending", "approved", "paid", "reversed", "rejected"] }).notNull().default("pending"),
  idempotencyKey: varchar("idempotency_key").notNull().unique(),
  approvedByUserId: varchar("approved_by_user_id").references(() => users.id),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});


export const crewMeetings = pgTable("crew_meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crewId: varchar("crew_id").notNull().references(() => crews.id, { onDelete: "cascade" }),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 120 }).notNull(),
  agenda: text("agenda"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  meetingUrl: text("meeting_url"),
  status: varchar("status", { enum: ["scheduled", "cancelled", "completed"] }).notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("crew_meetings_crew_start_idx").on(table.crewId, table.startsAt),
]);

export const crewMeetingAttendees = pgTable("crew_meeting_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetingId: varchar("meeting_id").notNull().references(() => crewMeetings.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  response: varchar("response", { enum: ["invited", "accepted", "declined", "tentative"] }).notNull().default("invited"),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("crew_meeting_attendee_unique").on(table.meetingId, table.userId),
]);

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
  id: true,
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
