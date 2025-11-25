import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema, insertKnowledgeItemSchema, insertEventTagSchema, insertFlowSchema, insertStepSchema, insertLeadSchema } from "@shared/schema";
import { setupWebSocket } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  // Agents
  app.post("/api/agents", async (req, res) => {
    try {
      const data = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(data);
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/agents/:id", async (req, res) => {
    try {
      const data = insertAgentSchema.parse(req.body);
      const agent = await storage.updateAgent(req.params.id, data);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const success = await storage.deleteAgent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json({ message: "Agent deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Knowledge Items
  app.post("/api/agents/:agentId/knowledge", async (req, res) => {
    try {
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

  app.get("/api/agents/:agentId/knowledge", async (req, res) => {
    try {
      const items = await storage.getKnowledgeItems(req.params.agentId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/knowledge/:id", async (req, res) => {
    try {
      const success = await storage.deleteKnowledgeItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Knowledge item not found" });
      }
      res.json({ message: "Knowledge item deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Event Tags
  app.post("/api/agents/:agentId/tags", async (req, res) => {
    try {
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

  app.get("/api/agents/:agentId/tags", async (req, res) => {
    try {
      const tags = await storage.getEventTags(req.params.agentId);
      res.json(tags);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tags/:id", async (req, res) => {
    try {
      const success = await storage.deleteEventTag(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Event tag not found" });
      }
      res.json({ message: "Event tag deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Flows
  app.post("/api/agents/:agentId/flows", async (req, res) => {
    try {
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

  app.get("/api/agents/:agentId/flows", async (req, res) => {
    try {
      const flowsList = await storage.getFlows(req.params.agentId);
      res.json(flowsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/flows/:id", async (req, res) => {
    try {
      const success = await storage.deleteFlow(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Flow not found" });
      }
      res.json({ message: "Flow deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Steps
  app.post("/api/flows/:flowId/steps", async (req, res) => {
    try {
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

  app.get("/api/flows/:flowId/steps", async (req, res) => {
    try {
      const stepsList = await storage.getSteps(req.params.flowId);
      res.json(stepsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/steps/:id", async (req, res) => {
    try {
      const success = await storage.deleteStep(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Step not found" });
      }
      res.json({ message: "Step deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Leads
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

  app.get("/api/agents/:agentId/leads", async (req, res) => {
    try {
      const leadsList = await storage.getLeads(req.params.agentId);
      res.json(leadsList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics
  app.get("/api/agents/:agentId/analytics", async (req, res) => {
    try {
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

  const httpServer = createServer(app);
  
  setupWebSocket(httpServer);

  return httpServer;
}
