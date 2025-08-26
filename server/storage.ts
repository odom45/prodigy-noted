import {
  users,
  genres,
  battles,
  tracks,
  votes,
  referrals,
  contentRatings,
  adminSettings,
  trialSlots,
  type User,
  type UpsertUser,
  type Genre,
  type Battle,
  type Track,
  type Vote,
  type Referral,
  type ContentRating,
  type AdminSettings,
  type TrialSlot,
  type InsertGenre,
  type InsertBattle,
  type InsertTrack,
  type InsertVote,
  type InsertReferral,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  
  // Genre operations
  getGenres(): Promise<Genre[]>;
  getGenre(id: string): Promise<Genre | undefined>;
  createGenre(genre: InsertGenre): Promise<Genre>;
  updateTrialSlots(genreId: string, increment: number): Promise<void>;
  
  // Battle operations
  getBattles(genreId?: string, status?: string): Promise<Battle[]>;
  getBattle(id: string): Promise<Battle | undefined>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  updateBattleStatus(id: string, status: string): Promise<void>;
  
  // Track operations
  getTracks(battleId: string): Promise<Track[]>;
  getTrack(id: string): Promise<Track | undefined>;
  createTrack(track: InsertTrack): Promise<Track>;
  
  // Vote operations
  getVotes(battleId: string): Promise<Vote[]>;
  getUserVote(userId: string, battleId: string): Promise<Vote | undefined>;
  createVote(vote: InsertVote): Promise<Vote>;
  getVoteCount(trackId: string): Promise<number>;
  
  // Referral operations
  getReferrals(referrerId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getTopReferrers(limit: number): Promise<{ user: User; referralCount: number }[]>;
  
  // Trial slot operations
  getAvailableTrialSlots(genreId: string): Promise<number>;
  grantTrialSlot(userId: string, genreId: string): Promise<TrialSlot>;
  
  // Leaderboard operations
  getTopArtists(limit: number): Promise<{ user: User; totalVotes: number }[]>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    activeBattles: number;
    trialConversions: number;
    revenue: number;
  }>;
  upsertAdminSettings(adminId: string, settings: Partial<AdminSettings>): Promise<AdminSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        role: role as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Genre operations
  async getGenres(): Promise<Genre[]> {
    return await db.select().from(genres);
  }

  async getGenre(id: string): Promise<Genre | undefined> {
    const [genre] = await db.select().from(genres).where(eq(genres.id, id));
    return genre;
  }

  async createGenre(genreData: InsertGenre): Promise<Genre> {
    const existingGenres = await this.getGenres();
    if (existingGenres.length >= 8) {
      throw new Error("Maximum number of genres reached");
    }
    const [genre] = await db.insert(genres).values(genreData).returning();
    return genre;
  }

  async updateTrialSlots(genreId: string, increment: number): Promise<void> {
    await db
      .update(genres)
      .set({
        filledTrialSlots: sql`${genres.filledTrialSlots} + ${increment}`,
      })
      .where(eq(genres.id, genreId));
  }

  // Battle operations
  async getBattles(genreId?: string, status?: string): Promise<Battle[]> {
    let query = db.select().from(battles);
    
    if (genreId && status) {
      query = query.where(and(eq(battles.genreId, genreId), eq(battles.status, status as any)));
    } else if (genreId) {
      query = query.where(eq(battles.genreId, genreId));
    } else if (status) {
      query = query.where(eq(battles.status, status as any));
    }
    
    return await query.orderBy(desc(battles.createdAt));
  }

  async getBattle(id: string): Promise<Battle | undefined> {
    const [battle] = await db.select().from(battles).where(eq(battles.id, id));
    return battle;
  }

  async createBattle(battleData: InsertBattle): Promise<Battle> {
    const [battle] = await db.insert(battles).values(battleData).returning();
    return battle;
  }

  async updateBattleStatus(id: string, status: string): Promise<void> {
    await db
      .update(battles)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(battles.id, id));
  }

  // Track operations
  async getTracks(battleId: string): Promise<Track[]> {
    return await db.select().from(tracks).where(eq(tracks.battleId, battleId));
  }

  async getTrack(id: string): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track;
  }

  async createTrack(trackData: InsertTrack): Promise<Track> {
    const [track] = await db.insert(tracks).values(trackData).returning();
    return track;
  }

  // Vote operations
  async getVotes(battleId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.battleId, battleId));
  }

  async getUserVote(userId: string, battleId: string): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.battleId, battleId)));
    return vote;
  }

  async createVote(voteData: InsertVote): Promise<Vote> {
    const [vote] = await db.insert(votes).values(voteData).returning();
    return vote;
  }

  async getVoteCount(trackId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(votes)
      .where(eq(votes.trackId, trackId));
    return result.count;
  }

  // Referral operations
  async getReferrals(referrerId: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }

  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const [referral] = await db.insert(referrals).values(referralData).returning();
    return referral;
  }

  async getTopReferrers(limit: number): Promise<{ user: User; referralCount: number }[]> {
    const result = await db
      .select({
        user: users,
        referralCount: count(referrals.id),
      })
      .from(users)
      .leftJoin(referrals, eq(users.id, referrals.referrerId))
      .groupBy(users.id)
      .orderBy(desc(count(referrals.id)))
      .limit(limit);

    return result.map(r => ({
      user: r.user,
      referralCount: r.referralCount,
    }));
  }

  // Trial slot operations
  async getAvailableTrialSlots(genreId: string): Promise<number> {
    const [genre] = await db.select().from(genres).where(eq(genres.id, genreId));
    if (!genre) return 0;
    return Math.max(0, genre.maxTrialSlots - genre.filledTrialSlots);
  }

  async grantTrialSlot(userId: string, genreId: string): Promise<TrialSlot> {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month trial

    const [trialSlot] = await db
      .insert(trialSlots)
      .values({
        userId,
        genreId,
        expiresAt,
      })
      .returning();

    // Update user trial status
    await db
      .update(users)
      .set({
        subscriptionStatus: "trial",
        trialExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Increment filled slots
    await this.updateTrialSlots(genreId, 1);

    return trialSlot;
  }

  // Leaderboard operations
  async getTopArtists(limit: number): Promise<{ user: User; totalVotes: number }[]> {
    const result = await db
      .select({
        user: users,
        totalVotes: count(votes.id),
      })
      .from(users)
      .leftJoin(tracks, eq(users.id, tracks.artistId))
      .leftJoin(votes, eq(tracks.id, votes.trackId))
      .where(eq(users.role, "participant"))
      .groupBy(users.id)
      .orderBy(desc(count(votes.id)))
      .limit(limit);

    return result.map(r => ({
      user: r.user,
      totalVotes: r.totalVotes,
    }));
  }

  // Admin operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeBattles: number;
    trialConversions: number;
    revenue: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [battleCount] = await db
      .select({ count: count() })
      .from(battles)
      .where(eq(battles.status, "active"));
    
    const [activeSubscriptions] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionStatus, "active"));

    // Mock revenue calculation (in real app, would calculate from Stripe data)
    const revenue = activeSubscriptions.count * 4.99;

    return {
      totalUsers: userCount.count,
      activeBattles: battleCount.count,
      trialConversions: activeSubscriptions.count,
      revenue,
    };
  }

  async upsertAdminSettings(adminId: string, settings: Partial<AdminSettings>): Promise<AdminSettings> {
    const [adminSetting] = await db
      .insert(adminSettings)
      .values({ ...settings, adminId })
      .onConflictDoUpdate({
        target: adminSettings.adminId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return adminSetting;
  }
}

export const storage = new DatabaseStorage();
