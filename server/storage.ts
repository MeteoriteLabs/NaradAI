import {
  users,
  agents,
  knowledgeItems,
  eventTags,
  flows,
  steps,
  leads,
  conversations,
  type User,
  type UpsertUser,
  type Agent,
  type InsertAgent,
  type UpdateAgent,
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
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserOnboarding(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;

  // Agents
  getAgent(id: string): Promise<Agent | undefined>;
  getAgentsByUser(userId: string): Promise<Agent[]>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  createAgentWithId(agent: InsertAgent & { id: string }): Promise<Agent>;
  updateAgent(id: string, agent: UpdateAgent): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Knowledge Items
  getKnowledgeItem(id: string): Promise<KnowledgeItem | undefined>;
  getKnowledgeItems(agentId: string): Promise<KnowledgeItem[]>;
  createKnowledgeItem(item: InsertKnowledgeItem): Promise<KnowledgeItem>;
  deleteKnowledgeItem(id: string): Promise<boolean>;

  // Event Tags
  getEventTag(id: string): Promise<EventTag | undefined>;
  getEventTags(agentId: string): Promise<EventTag[]>;
  createEventTag(tag: InsertEventTag): Promise<EventTag>;
  deleteEventTag(id: string): Promise<boolean>;

  // Flows
  getFlow(id: string): Promise<Flow | undefined>;
  getFlows(agentId: string): Promise<Flow[]>;
  createFlow(flow: InsertFlow): Promise<Flow>;
  deleteFlow(id: string): Promise<boolean>;

  // Steps
  getStep(id: string): Promise<Step | undefined>;
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
  // Users
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

  async updateUserOnboarding(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Agents
  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAgentsByUser(userId: string): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.userId, userId));
  }

  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async createAgentWithId(agent: InsertAgent & { id: string }): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgent(id: string, agent: UpdateAgent): Promise<Agent | undefined> {
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
  async getKnowledgeItem(id: string): Promise<KnowledgeItem | undefined> {
    const [item] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, id));
    return item || undefined;
  }

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
  async getEventTag(id: string): Promise<EventTag | undefined> {
    const [tag] = await db.select().from(eventTags).where(eq(eventTags.id, id));
    return tag || undefined;
  }

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
  async getFlow(id: string): Promise<Flow | undefined> {
    const [flow] = await db.select().from(flows).where(eq(flows.id, id));
    return flow || undefined;
  }

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
  async getStep(id: string): Promise<Step | undefined> {
    const [step] = await db.select().from(steps).where(eq(steps.id, id));
    return step || undefined;
  }

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
