import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertBattleSchema,
  insertTrackSchema,
  insertReferralSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Genre routes
  app.get('/api/genres', async (req, res) => {
    try {
      const genres = await storage.getGenres();
      res.json(genres);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  // Battle routes
  app.get('/api/battles', async (req, res) => {
    try {
      const { genreId, status } = req.query;
      const battles = await storage.getBattles(
        genreId as string,
        status as string
      );
      res.json(battles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch battles" });
    }
  });

  app.get('/api/battles/:id', async (req, res) => {
    try {
      const battle = await storage.getBattle(req.params.id);
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      res.json(battle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch battle" });
    }
  });

  app.post('/api/battles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'participant') {
        return res.status(403).json({ message: "Only participants can create battles" });
      }

      const battleData = insertBattleSchema.parse({
        ...req.body,
        createdById: userId,
      });

      const battle = await storage.createBattle(battleData);
      res.json(battle);
    } catch (error) {
      res.status(400).json({ message: "Invalid battle data" });
    }
  });

  // Track routes
  app.get('/api/battles/:battleId/tracks', async (req, res) => {
    try {
      const tracks = await storage.getTracks(req.params.battleId);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.post('/api/tracks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'participant') {
        return res.status(403).json({ message: "Only participants can submit tracks" });
      }

      const trackData = insertTrackSchema.parse({
        ...req.body,
        artistId: userId,
      });

      const track = await storage.createTrack(trackData);
      res.json(track);
    } catch (error) {
      res.status(400).json({ message: "Invalid track data" });
    }
  });

  // Voting is intentionally closed until server-verified 50% listening sessions
  // and one-vote-per-member constraints are wired end-to-end.
  app.post('/api/votes', isAuthenticated, async (_req, res) => {
    res.status(503).json({
      message: "Voting is temporarily unavailable while fair-listening verification is being implemented.",
      code: "VOTING_ENGINE_NOT_READY",
    });
  });

  app.get('/api/tracks/:trackId/votes', async (req, res) => {
    try {
      const voteCount = await storage.getVoteCount(req.params.trackId);
      res.json({ count: voteCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vote count" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard/artists', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topArtists = await storage.getTopArtists(limit);
      res.json(topArtists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/leaderboard/referrers', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topReferrers = await storage.getTopReferrers(limit);
      res.json(topReferrers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch referrers" });
    }
  });

  // Trial routes
  app.get('/api/trial-slots/:genreId', async (req, res) => {
    try {
      const availableSlots = await storage.getAvailableTrialSlots(req.params.genreId);
      res.json({ available: availableSlots });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trial slots" });
    }
  });

  app.post('/api/trial-slots', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { genreId } = req.body;
      
      const availableSlots = await storage.getAvailableTrialSlots(genreId);
      if (availableSlots <= 0) {
        return res.status(400).json({ message: "No trial slots available for this genre" });
      }

      const trialSlot = await storage.grantTrialSlot(userId, genreId);
      res.json(trialSlot);
    } catch (error) {
      res.status(500).json({ message: "Failed to grant trial slot" });
    }
  });

  // Referral routes
  app.post('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const referrerId = req.user.claims.sub;
      const referralData = insertReferralSchema.parse({
        ...req.body,
        referrerId,
      });

      const referral = await storage.createReferral(referralData);
      res.json(referral);
    } catch (error) {
      res.status(400).json({ message: "Invalid referral data" });
    }
  });

  // Legacy one-time PaymentIntent activation was unsafe: it granted paid access
  // before payment confirmation and did not create a recurring subscription.
  // Keep checkout closed until verified recurring subscriptions and webhook
  // idempotency are implemented against configured Regular/VIP price IDs.
  app.post('/api/get-or-create-subscription', isAuthenticated, async (_req, res) => {
    res.status(503).json({
      message: "Subscription checkout is temporarily unavailable during the recurring billing rebuild.",
      code: "SUBSCRIPTION_CHECKOUT_NOT_READY",
    });
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const settings = await storage.upsertAdminSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update admin settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
