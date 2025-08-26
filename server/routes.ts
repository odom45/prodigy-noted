import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertBattleSchema,
  insertTrackSchema,
  insertVoteSchema,
  insertReferralSchema,
} from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

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

  // Vote routes
  app.post('/api/votes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if user already voted in this battle
      const existingVote = await storage.getUserVote(userId, req.body.battleId);
      if (existingVote) {
        return res.status(400).json({ message: "Already voted in this battle" });
      }

      const voteData = insertVoteSchema.parse({
        ...req.body,
        userId,
      });

      const vote = await storage.createVote(voteData);
      res.json(vote);
    } catch (error) {
      res.status(400).json({ message: "Invalid vote data" });
    }
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

  // Stripe subscription routes
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ['latest_invoice.payment_intent'],
        });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
        return;
      }

      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username || `${user.firstName} ${user.lastName}`,
      });

      // Create a simple payment intent for subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 499,
        currency: 'usd',
        customer: customer.id,
        setup_future_usage: 'off_session',
        metadata: {
          subscription_type: 'participant',
          user_id: userId,
        },
      });

      // Update user as active participant after payment intent creation
      await storage.updateUserSubscriptionStatus(userId, 'active');
      await storage.updateUserStripeInfo(userId, customer.id, paymentIntent.id);

      res.json({
        subscriptionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe webhook
  app.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        event = req.body;
      }
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
      const session = event.data.object;
      const customerId = session.customer;
      
      // Update user subscription status
      const users = await storage.getAdminStats(); // This is a placeholder - implement proper user lookup by Stripe customer ID
      // In real implementation, you'd find the user by stripeCustomerId and update their subscription status
    }

    res.json({ received: true });
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
