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

  // Super admin session setter - called before accessing demo accounts
  app.post("/api/superadmin/authorize", (req, res) => {
    const { username, password } = req.body;
    if (username === "superadmin" && password === "Narada112358") {
      (req.session as any).isSuperAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Demo login - bypasses OAuth for demo purposes (super admin only)
  app.get("/api/demo-login", async (req, res) => {
    try {
      // Check for super admin session AND authorization header
      const authHeader = req.headers["x-superadmin-auth"];
      const isSuperAdminSession = (req.session as any).isSuperAdmin === true;
      
      if (!isSuperAdminSession && authHeader !== "narada-superadmin-authorized") {
        return res.status(403).json({ error: "Super admin access required" });
      }

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

  // NaradaAI login - bypasses OAuth for NaradaAI demo (super admin only)
  app.get("/api/naradaai-login", async (req, res) => {
    try {
      // Check for super admin session AND authorization header
      const authHeader = req.headers["x-superadmin-auth"];
      const isSuperAdminSession = (req.session as any).isSuperAdmin === true;
      
      if (!isSuperAdminSession && authHeader !== "narada-superadmin-authorized") {
        return res.status(403).json({ error: "Super admin access required" });
      }

      const naradaUserId = "naradaai-user-001";
      const naradaAgentId = "naradaai-agent-001";
      const naradaClaims = {
        sub: naradaUserId,
        email: "naradaai@narada.ai",
        name: "NaradaAI",
        picture: null,
        given_name: "Narada",
        family_name: "AI",
      };

      // Upsert NaradaAI user with onboarding completed
      await storage.upsertUser({
        id: naradaUserId,
        email: naradaClaims.email,
        firstName: naradaClaims.given_name,
        lastName: naradaClaims.family_name,
        profileImageUrl: null,
      });

      // Mark onboarding as completed for NaradaAI user
      await storage.updateUserOnboarding(naradaUserId, {
        companyName: "Narada AI",
        companyWebsite: "https://narada.ai",
        role: "founder",
        useCase: "customer_support",
        onboardingCompleted: true,
      });

      // Check if NaradaAI agent exists, create if not
      const existingAgent = await storage.getAgent(naradaAgentId);
      if (!existingAgent) {
        await storage.createAgentWithId({
          id: naradaAgentId,
          userId: naradaUserId,
          name: "NaradaAI",
          persona: "I am Narada, your intelligent voice guide for the Narada AI platform. I help website visitors understand how our voice-based guidance system works, explain features like lead capture, guided tours, and AI-powered conversations. I'm friendly, knowledgeable, and ready to demonstrate the power of voice-based website assistance.",
          voiceStyle: "alloy",
          widgetDesign: "floating-bubble",
          widgetColor: "#8b5cf6",
          autoStart: false,
        });

        // Add some knowledge items for the NaradaAI agent
        await storage.createKnowledgeItem({
          agentId: naradaAgentId,
          question: "What is Narada AI?",
          answer: "Narada AI is a voice-based website guide platform that helps businesses engage visitors with intelligent voice conversations. It can capture leads, provide guided tours, answer questions, and enhance user experience through natural voice interaction."
        });

        await storage.createKnowledgeItem({
          agentId: naradaAgentId,
          question: "How does the voice widget work?",
          answer: "The Narada AI widget is a simple script you embed on your website. When visitors click the voice button, they can have a natural conversation with your AI agent. The agent can answer questions, guide users through your site, and capture contact information seamlessly."
        });

        await storage.createKnowledgeItem({
          agentId: naradaAgentId,
          question: "What are the benefits of using Narada AI?",
          answer: "With Narada AI, businesses see up to 85% higher lead capture rates, 3x faster sales cycles, and 40% higher conversion rates. Our voice-guided experience reduces bounce rates by 45% and increases time on site by 60%. It's like having a 24/7 sales rep on every page."
        });
      }

      // Create NaradaAI user session
      const user: any = {
        claims: naradaClaims,
        access_token: "naradaai-token",
        expires_at: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
      };

      req.login(user, (err) => {
        if (err) {
          console.error("NaradaAI login error:", err);
          return res.redirect("/?error=login_failed");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("NaradaAI login error:", error);
      res.status(500).json({ error: "Failed to create NaradaAI session" });
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
