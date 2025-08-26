import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const GOOGLE_CLIENT_ID = "778822215477-dd1v.apps.googleusercontent.com";
  const GOOGLE_CLIENT_SECRET = "YOUR_GOOGLE_CLIENT_SECRET"; // Replace with actual secret

  const redirectUri =
    process.env.NODE_ENV === "production"
      ? "https://note-genius-benjaminjodom45.replit.app/api/auth/google/callback"
      : "http://localhost:5000/api/auth/google/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: redirectUri,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const userData = {
            email: profile.emails?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0]?.value,
            username:
              profile.displayName || profile.emails?.[0]?.value?.split("@")[0],
          };

          const user = await storage.upsertUser(userData);
          return done(null, user);
        } catch (error) {
          return done(error, undefined);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  });

  app.get(
    "/api/login",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login-failed",
      successRedirect: "/dashboard",
    }),
  );

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });
}
