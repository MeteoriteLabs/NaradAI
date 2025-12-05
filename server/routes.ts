import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, updateAgentSchema, insertKnowledgeItemSchema, insertEventTagSchema, insertFlowSchema, insertStepSchema, insertLeadSchema } from "@shared/schema";
import { setupWebSocket } from "./websocket";
import { setupStreamingWebSocket } from "./websocket-stream";
import { setupAuth, isAuthenticated } from "./googleAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
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

  // Update user onboarding
  app.post('/api/auth/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companyName, companyWebsite, role, useCase } = req.body;
      const user = await storage.updateUserOnboarding(userId, {
        companyName,
        companyWebsite,
        role,
        useCase,
        onboardingCompleted: true,
      });
      res.json(user);
    } catch (error) {
      console.error("Error updating onboarding:", error);
      res.status(500).json({ message: "Failed to update onboarding" });
    }
  });

  // Agents - Protected routes
  app.post("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent({ ...data, userId });
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/agents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agents = await storage.getAgentsByUser(userId);
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      if (agent.userId && agent.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingAgent = await storage.getAgent(req.params.id);
      if (!existingAgent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      if (existingAgent.userId && existingAgent.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updateData = updateAgentSchema.parse(req.body);
      const agent = await storage.updateAgent(req.params.id, { ...updateData, userId });
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/agents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existingAgent = await storage.getAgent(req.params.id);
      if (!existingAgent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      if (existingAgent.userId && existingAgent.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const success = await storage.deleteAgent(req.params.id);
      res.json({ message: "Agent deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper to verify agent ownership
  async function verifyAgentOwnership(agentId: string, userId: string): Promise<boolean> {
    const agent = await storage.getAgent(agentId);
    if (!agent) return false;
    if (agent.userId && agent.userId !== userId) return false;
    return true;
  }

  // Knowledge Items - Protected routes
  app.post("/api/agents/:agentId/knowledge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const data = insertKnowledgeItemSchema.parse({
        ...req.body,
        agentId: req.params.agentId,
      });
      const item = await storage.createKnowledgeItem(data);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/agents/:agentId/knowledge", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const items = await storage.getKnowledgeItems(req.params.agentId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/knowledge/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const item = await storage.getKnowledgeItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Knowledge item not found" });
      }
      if (!await verifyAgentOwnership(item.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const success = await storage.deleteKnowledgeItem(req.params.id);
      res.json({ message: "Knowledge item deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Event Tags - Protected routes
  app.post("/api/agents/:agentId/tags", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const data = insertEventTagSchema.parse({
        ...req.body,
        agentId: req.params.agentId,
      });
      const tag = await storage.createEventTag(data);
      res.json(tag);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/agents/:agentId/tags", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const tags = await storage.getEventTags(req.params.agentId);
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tags/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tag = await storage.getEventTag(req.params.id);
      if (!tag) {
        return res.status(404).json({ error: "Event tag not found" });
      }
      if (!await verifyAgentOwnership(tag.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const success = await storage.deleteEventTag(req.params.id);
      res.json({ message: "Event tag deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Flows - Protected routes
  app.post("/api/agents/:agentId/flows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const data = insertFlowSchema.parse({
        ...req.body,
        agentId: req.params.agentId,
      });
      const flow = await storage.createFlow(data);
      res.json(flow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/agents/:agentId/flows", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const flowsList = await storage.getFlows(req.params.agentId);
      res.json(flowsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/flows/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const flow = await storage.getFlow(req.params.id);
      if (!flow) {
        return res.status(404).json({ error: "Flow not found" });
      }
      if (!await verifyAgentOwnership(flow.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const success = await storage.deleteFlow(req.params.id);
      res.json({ message: "Flow deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Helper to verify flow ownership via its agent
  async function verifyFlowOwnership(flowId: string, userId: string): Promise<boolean> {
    const flow = await storage.getFlow(flowId);
    if (!flow) return false;
    return await verifyAgentOwnership(flow.agentId, userId);
  }

  // Steps - Protected routes
  app.post("/api/flows/:flowId/steps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyFlowOwnership(req.params.flowId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const data = insertStepSchema.parse({
        ...req.body,
        flowId: req.params.flowId,
      });
      const step = await storage.createStep(data);
      res.json(step);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/flows/:flowId/steps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyFlowOwnership(req.params.flowId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const stepsList = await storage.getSteps(req.params.flowId);
      res.json(stepsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/steps/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const step = await storage.getStep(req.params.id);
      if (!step) {
        return res.status(404).json({ error: "Step not found" });
      }
      if (!await verifyFlowOwnership(step.flowId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const success = await storage.deleteStep(req.params.id);
      res.json({ message: "Step deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Leads - Protected routes (POST is public for widget capture, GET is protected)
  app.post("/api/agents/:agentId/leads", async (req, res) => {
    try {
      const data = insertLeadSchema.parse({
        ...req.body,
        agentId: req.params.agentId,
      });
      const lead = await storage.createLead(data);
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/agents/:agentId/leads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const leadsList = await storage.getLeads(req.params.agentId);
      res.json(leadsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics - Protected route
  app.get("/api/agents/:agentId/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!await verifyAgentOwnership(req.params.agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const analytics = await storage.getAnalytics(req.params.agentId);
      res.json({
        total_conversations: analytics.totalConversations,
        total_leads: analytics.totalLeads,
        total_flows_triggered: analytics.totalFlowsTriggered,
        top_event_tags: [],
        recent_conversations: analytics.recentConversations,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Widget Installation Verification - Protected route
  app.post("/api/agents/:agentId/verify-installation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const agentId = req.params.agentId;
      
      if (!await verifyAgentOwnership(agentId, userId)) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL format
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        return res.status(400).json({ 
          error: "Invalid URL format. Please enter a valid HTTP or HTTPS URL." 
        });
      }

      // Fetch the URL with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Narada-Widget-Verifier/1.0',
            'Accept': 'text/html',
          },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          return res.json({
            verified: false,
            status: 'error',
            message: `Could not access the page (HTTP ${response.status}). Make sure the URL is publicly accessible.`,
          });
        }

        const html = await response.text();

        // Check for embed script patterns - look for any embed.js with Narada markers
        const hasAgentId = new RegExp(`data-agent-id=["']${agentId}["']`, 'i').test(html);
        const hasEmbedScript = /embed\.js[^>]*data-agent-id/i.test(html) || 
                               /narada.*embed/i.test(html) || 
                               html.includes('narada-widget-host');

        if (hasAgentId) {
          return res.json({
            verified: true,
            status: 'connected',
            message: 'Widget is properly installed and configured with the correct agent ID.',
          });
        } else if (hasEmbedScript) {
          return res.json({
            verified: false,
            status: 'partial',
            message: 'Narada widget script found, but it may be configured for a different agent ID.',
          });
        } else {
          return res.json({
            verified: false,
            status: 'not_found',
            message: 'Widget script not found on this page. Make sure to add the embed code before the closing </body> tag.',
          });
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          return res.json({
            verified: false,
            status: 'timeout',
            message: 'Request timed out. The website may be slow or blocking verification requests.',
          });
        }
        return res.json({
          verified: false,
          status: 'error',
          message: `Could not connect to the website: ${fetchError.message}`,
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Public API endpoint for widget to fetch agent config (no auth required)
  app.get("/api/widget/agents/:id", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      // Return only public-safe agent config for widget
      res.json({
        id: agent.id,
        name: agent.name,
        persona: agent.persona,
        voiceStyle: agent.voiceStyle,
        widgetDesign: agent.widgetDesign,
        widgetColor: agent.widgetColor,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Serve widget.js bundle for external websites
  app.get("/widget.js", async (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const widgetPath = path.join(process.cwd(), 'dist', 'widget', 'widget.js');
      const widgetBundle = await fs.readFile(widgetPath, 'utf-8');
      res.send(widgetBundle);
    } catch (error) {
      console.error('Widget bundle not found:', error);
      res.status(404).send('// Widget bundle not built. Run: npm run build:widget');
    }
  });

  // Serve widget.css for external websites (if exists)
  app.get("/widget.css", async (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const cssPath = path.join(process.cwd(), 'dist', 'widget', 'style.css');
      const cssBundle = await fs.readFile(cssPath, 'utf-8');
      res.send(cssBundle);
    } catch (error) {
      // CSS is optional, widget uses inline styles as fallback
      res.send('/* No widget CSS bundle */');
    }
  });

  // Serve embed.js loader script for external websites
  app.get("/embed.js", (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const embedScript = `
(function() {
  var currentScript = document.currentScript;
  
  if (!currentScript) {
    console.error('[Narada AI] Could not find script tag');
    return;
  }

  var agentId = currentScript.getAttribute('data-agent-id');
  var apiBase = currentScript.getAttribute('data-api-base') || currentScript.src.replace('/embed.js', '');
  
  if (!agentId) {
    console.error('[Narada AI] Missing data-agent-id attribute');
    return;
  }

  // Load widget bundle
  var widgetScript = document.createElement('script');
  widgetScript.src = apiBase + '/widget.js';
  widgetScript.async = true;
  
  widgetScript.onload = function() {
    if (typeof window.NaradaWidget === 'undefined') {
      console.error('[Narada AI] Widget bundle loaded but NaradaWidget not found');
      return;
    }

    // Create widget container (no positioning - widget components handle their own layout)
    var widgetHost = document.createElement('div');
    widgetHost.id = 'narada-widget-host';
    document.body.appendChild(widgetHost);
    
    // Construct WebSocket URLs
    var wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
    var apiUrl = new URL(apiBase);
    var websocketUrl = wsProtocol + '//' + apiUrl.host + '/ws';
    var streamingWebsocketUrl = wsProtocol + '//' + apiUrl.host + '/ws-stream';

    // Mount React widget with streaming enabled
    window.NaradaWidget.mount(widgetHost, {
      agentId: agentId,
      websocketUrl: websocketUrl,
      streamingWebsocketUrl: streamingWebsocketUrl,
      apiBase: apiBase,
      useStreaming: true
    });

    console.log('[Narada AI] Widget mounted for agent:', agentId);
    
    // Track page view
    console.log('[Narada AI] Page view:', window.location.href);
  };
  
  widgetScript.onerror = function() {
    console.error('[Narada AI] Failed to load widget bundle');
  };
  
  document.head.appendChild(widgetScript);

  // Load widget CSS (optional)
  var widgetCss = document.createElement('link');
  widgetCss.rel = 'stylesheet';
  widgetCss.href = apiBase + '/widget.css';
  document.head.appendChild(widgetCss);
})();
`;
    res.send(embedScript);
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket servers
  setupWebSocket(httpServer);  // Legacy batch processing on /ws
  setupStreamingWebSocket(httpServer);  // Live streaming on /ws-stream

  return httpServer;
}
