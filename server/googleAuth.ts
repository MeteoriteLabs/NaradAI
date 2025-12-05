import * as client from "openid-client";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getGoogleOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL("https://accounts.google.com"),
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  const claims = tokens.claims();
  user.claims = {
    sub: claims?.sub,
    email: claims?.email,
    name: claims?.name,
    picture: claims?.picture,
    given_name: claims?.given_name,
    family_name: claims?.family_name,
  };
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = claims?.exp;
}

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims.sub,
    email: claims.email,
    firstName: claims.given_name || claims.name?.split(" ")[0] || "",
    lastName: claims.family_name || claims.name?.split(" ").slice(1).join(" ") || "",
    profileImageUrl: claims.picture,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Google OAuth login
  app.get("/api/login", async (req, res) => {
    try {
      const config = await getGoogleOidcConfig();
      
      // Build the callback URL based on the request
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const callbackUrl = `${protocol}://${host}/api/callback`;
      
      // Generate authorization URL
      const authUrl = client.buildAuthorizationUrl(config, {
        redirect_uri: callbackUrl,
        scope: "openid email profile",
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
      });
      
      // Store callback URL in session for later use
      (req.session as any).callbackUrl = callbackUrl;
      
      res.redirect(authUrl.href);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to initiate login" });
    }
  });

  // Google OAuth callback
  app.get("/api/callback", async (req, res) => {
    try {
      const config = await getGoogleOidcConfig();
      const callbackUrl = (req.session as any).callbackUrl || `${req.protocol}://${req.headers.host}/api/callback`;
      
      // Exchange code for tokens
      const currentUrl = new URL(req.url, `${req.protocol}://${req.headers.host}`);
      const tokens = await client.authorizationCodeGrant(config, currentUrl, {
        expectedState: client.skipStateCheck,
        idTokenExpected: true,
      });
      
      // Create user object
      const user: any = {};
      updateUserSession(user, tokens);
      
      // Upsert user to database
      await upsertUser(user.claims);
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.redirect("/?error=login_failed");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect("/?error=auth_failed");
    }
  });

  // Demo login - bypasses OAuth for demo purposes
  app.get("/api/demo-login", async (req, res) => {
    try {
      const demoUserId = "demo-user-001";
      const demoClaims = {
        sub: demoUserId,
        email: "demo@narada.ai",
        name: "Demo User",
        picture: null,
        given_name: "Demo",
        family_name: "User",
      };

      // Upsert demo user with onboarding completed
      await storage.upsertUser({
        id: demoUserId,
        email: demoClaims.email,
        firstName: demoClaims.given_name,
        lastName: demoClaims.family_name,
        profileImageUrl: null,
      });

      // Mark onboarding as completed for demo user
      await storage.updateUserOnboarding(demoUserId, {
        companyName: "Demo Company",
        companyWebsite: "https://demo.narada.ai",
        role: "founder",
        useCase: "product_tours",
        onboardingCompleted: true,
      });

      // Create demo user session
      const user: any = {
        claims: demoClaims,
        access_token: "demo-token",
        expires_at: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
      };

      req.login(user, (err) => {
        if (err) {
          console.error("Demo login error:", err);
          return res.redirect("/?error=login_failed");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ error: "Failed to create demo session" });
    }
  });

  // Logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if token is expired
  if (user.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now > user.expires_at && user.refresh_token) {
      try {
        const config = await getGoogleOidcConfig();
        const tokenResponse = await client.refreshTokenGrant(config, user.refresh_token);
        updateUserSession(user, tokenResponse);
      } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(401).json({ message: "Unauthorized" });
      }
    }
  }

  return next();
};
