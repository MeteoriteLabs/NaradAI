import {
  agents,
  knowledgeItems,
  eventTags,
  flows,
  steps,
  leads,
  conversations,
  type Agent,
  type InsertAgent,
  type KnowledgeItem,
  type InsertKnowledgeItem,
  type EventTag,
  type InsertEventTag,
  type Flow,
  type InsertFlow,
  type Step,
  type InsertStep,
  type Lead,
  type InsertLead,
  type Conversation,
  type InsertConversation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNotNull, count } from "drizzle-orm";

export interface IStorage {
  // Agents
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: InsertAgent): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Knowledge Items
  getKnowledgeItems(agentId: string): Promise<KnowledgeItem[]>;
  createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem>;
  deleteKnowledgeItem(id: string): Promise<boolean>;

  // Event Tags
  getEventTags(agentId: string): Promise<EventTag[]>;
  createEventTag(tag: InsertEventTag): Promise<EventTag>;
  deleteEventTag(id: string): Promise<boolean>;

  // Flows
  getFlows(agentId: string): Promise<Flow[]>;
  createFlow(flow: InsertFlow): Promise<Flow>;
  deleteFlow(id: string): Promise<boolean>;

  // Steps
  getSteps(flowId: string): Promise<Step[]>;
  createStep(step: InsertStep): Promise<Step>;
  deleteStep(id: string): Promise<boolean>;

  // Leads
  getLeads(agentId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;

  // Conversations
  getConversations(agentId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Analytics
  getAnalytics(agentId: string): Promise<{
    totalConversations: number;
    totalLeads: number;
    totalFlowsTriggered: number;
    recentConversations: Conversation[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Agents
  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: string, agent: InsertAgent): Promise<Agent | undefined> {
    const [updated] = await db
      .update(agents)
      .set(agent)
      .where(eq(agents.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Knowledge Items
  async getKnowledgeItems(agentId: string): Promise<KnowledgeItem[]> {
    return await db
      .select()
      .from(knowledgeItems)
      .where(eq(knowledgeItems.agentId, agentId));
  }

  async createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem> {
    const [newItem] = await db.insert(knowledgeItems).values(item).returning();
    return newItem;
  }

  async deleteKnowledgeItem(id: string): Promise<boolean> {
    const result = await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Event Tags
  async getEventTags(agentId: string): Promise<EventTag[]> {
    return await db
      .select()
      .from(eventTags)
      .where(eq(eventTags.agentId, agentId));
  }

  async createEventTag(tag: InsertEventTag): Promise<EventTag> {
    const [newTag] = await db.insert(eventTags).values(tag).returning();
    return newTag;
  }

  async deleteEventTag(id: string): Promise<boolean> {
    const result = await db.delete(eventTags).where(eq(eventTags.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Flows
  async getFlows(agentId: string): Promise<Flow[]> {
    return await db
      .select()
      .from(flows)
      .where(eq(flows.agentId, agentId));
  }

  async createFlow(flow: InsertFlow): Promise<Flow> {
    const [newFlow] = await db.insert(flows).values(flow).returning();
    return newFlow;
  }

  async deleteFlow(id: string): Promise<boolean> {
    const result = await db.delete(flows).where(eq(flows.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Steps
  async getSteps(flowId: string): Promise<Step[]> {
    return await db
      .select()
      .from(steps)
      .where(eq(steps.flowId, flowId))
      .orderBy(steps.order);
  }

  async createStep(step: InsertStep): Promise<Step> {
    const [newStep] = await db.insert(steps).values(step).returning();
    return newStep;
  }

  async deleteStep(id: string): Promise<boolean> {
    const result = await db.delete(steps).where(eq(steps.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Leads
  async getLeads(agentId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.agentId, agentId))
      .orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  // Conversations
  async getConversations(agentId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.agentId, agentId))
      .orderBy(desc(conversations.createdAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  // Analytics
  async getAnalytics(agentId: string): Promise<{
    totalConversations: number;
    totalLeads: number;
    totalFlowsTriggered: number;
    recentConversations: Conversation[];
  }> {
    const [conversationsCount] = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.agentId, agentId));

    const [leadsCount] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.agentId, agentId));

    const [flowsCount] = await db
      .select({ count: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.agentId, agentId),
          isNotNull(conversations.flowsTriggered)
        )
      );

    const recentConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.agentId, agentId))
      .orderBy(desc(conversations.createdAt))
      .limit(10);

    return {
      totalConversations: conversationsCount?.count || 0,
      totalLeads: leadsCount?.count || 0,
      totalFlowsTriggered: flowsCount?.count || 0,
      recentConversations,
    };
  }
}

export const storage = new DatabaseStorage();
