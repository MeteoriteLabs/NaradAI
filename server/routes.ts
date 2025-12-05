import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertKnowledgeItemSchema, insertEventTagSchema, insertFlowSchema, insertStepSchema, insertLeadSchema } from "@shared/schema";
import { setupWebSocket } from "./websocket";
import { setupAuth, isAuthenticated } from "./replitAuth";

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
      const data = insertAgentSchema.parse(req.body);
      const agent = await storage.updateAgent(req.params.id, { ...data, userId });
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

  // Serve embed.js script for external websites
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

  // Create widget container with Shadow DOM
  var widgetHost = document.createElement('div');
  widgetHost.id = 'narada-widget-host';
  document.body.appendChild(widgetHost);

  var shadowRoot = widgetHost.attachShadow({ mode: 'open' });
  
  // Add widget styles
  var style = document.createElement('style');
  style.textContent = \`
    #narada-widget-root {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .narada-fab {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .narada-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
    }
    .narada-fab svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    .narada-chat {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 350px;
      max-height: 500px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .narada-chat.open {
      display: flex;
    }
    .narada-chat-header {
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .narada-chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .narada-chat-header p {
      margin: 4px 0 0;
      font-size: 12px;
      opacity: 0.9;
    }
    .narada-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      min-height: 200px;
    }
    .narada-message {
      margin-bottom: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 85%;
      font-size: 14px;
      line-height: 1.4;
    }
    .narada-message.assistant {
      background: #f0f0f0;
      color: #333;
    }
    .narada-message.user {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-left: auto;
    }
    .narada-chat-input {
      padding: 12px 16px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
    }
    .narada-chat-input input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
    }
    .narada-chat-input input:focus {
      border-color: #667eea;
    }
    .narada-chat-input button {
      padding: 10px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
  \`;
  shadowRoot.appendChild(style);

  var widgetContainer = document.createElement('div');
  widgetContainer.id = 'narada-widget-root';
  widgetContainer.innerHTML = \`
    <div class="narada-chat" id="narada-chat-panel">
      <div class="narada-chat-header">
        <h3>Narada AI Assistant</h3>
        <p>How can I help you today?</p>
      </div>
      <div class="narada-chat-messages" id="narada-messages">
        <div class="narada-message assistant">Hello! I'm your AI assistant. How can I help you navigate this website?</div>
      </div>
      <div class="narada-chat-input">
        <input type="text" placeholder="Type a message..." id="narada-input" />
        <button id="narada-send">Send</button>
      </div>
    </div>
    <button class="narada-fab" id="narada-toggle">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
    </button>
  \`;
  shadowRoot.appendChild(widgetContainer);

  // Toggle chat
  var toggleBtn = shadowRoot.getElementById('narada-toggle');
  var chatPanel = shadowRoot.getElementById('narada-chat-panel');
  toggleBtn.addEventListener('click', function() {
    chatPanel.classList.toggle('open');
  });

  // Handle send
  var input = shadowRoot.getElementById('narada-input');
  var sendBtn = shadowRoot.getElementById('narada-send');
  var messages = shadowRoot.getElementById('narada-messages');
  
  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    
    var userMsg = document.createElement('div');
    userMsg.className = 'narada-message user';
    userMsg.textContent = text;
    messages.appendChild(userMsg);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
    
    // Connect to WebSocket for real responses
    var wsProtocol = apiBase.startsWith('https') ? 'wss' : 'ws';
    var wsHost = apiBase.replace(/^https?:\\/\\//, '');
    var sessionId = 'session_' + Date.now();
    
    fetch(apiBase + '/api/agents/' + agentId)
      .then(function(r) { return r.json(); })
      .then(function(agent) {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'narada-message assistant';
        aiMsg.textContent = 'Thanks for your message! I\\'m ' + (agent.name || 'Narada AI') + '. This is a demo response.';
        messages.appendChild(aiMsg);
        messages.scrollTop = messages.scrollHeight;
      })
      .catch(function() {
        var aiMsg = document.createElement('div');
        aiMsg.className = 'narada-message assistant';
        aiMsg.textContent = 'Thanks for reaching out! Our team will get back to you soon.';
        messages.appendChild(aiMsg);
        messages.scrollTop = messages.scrollHeight;
      });
  }
  
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendMessage();
  });

  // Track page view
  console.log('[Narada AI] Widget loaded for agent:', agentId);
  console.log('[Narada AI] Page view:', window.location.href);
})();
`;
    res.send(embedScript);
  });

  const httpServer = createServer(app);
  
  setupWebSocket(httpServer);

  return httpServer;
}
