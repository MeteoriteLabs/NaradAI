import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const WIDGET_DESIGNS = ["voice-bar", "floating-bubble", "corner-card"] as const;
export type WidgetDesign = typeof WIDGET_DESIGNS[number];

export const EVENT_TYPES = ["view", "click", "scroll", "custom"] as const;
export type EventType = typeof EVENT_TYPES[number];

export const VOICE_STYLES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
export type VoiceStyle = typeof VOICE_STYLES[number];

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  companyName: varchar("company_name"),
  companyWebsite: varchar("company_website"),
  role: varchar("role"),
  useCase: varchar("use_case"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Agents table
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  persona: text("persona"),
  voiceStyle: text("voice_style").default("alloy"),
  widgetDesign: text("widget_design").default("voice-bar"), // "voice-bar" | "floating-bubble" | "corner-card"
  widgetColor: text("widget_color").default("#8b5cf6"), // Primary color for widget
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Knowledge items table
export const knowledgeItems = pgTable("knowledge_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event tags table
export const eventTags = pgTable("event_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  selector: text("selector").notNull(),
  eventType: text("event_type").notNull(), // "view" | "click" | "scroll" | "custom"
  pagePattern: text("page_pattern"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Flows table
export const flows = pgTable("flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  pageUrl: text("page_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Steps table
export const steps = pgTable("steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flowId: varchar("flow_id").notNull().references(() => flows.id, { onDelete: "cascade" }),
  selector: text("selector").notNull(),
  title: text("title").notNull(),
  tooltipText: text("tooltip_text"),
  voiceScript: text("voice_script"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leads table
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  context: jsonb("context"), // Store URL, tags, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Conversations/Analytics table
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  transcript: jsonb("transcript").notNull(), // Array of {role, text, timestamp}
  context: jsonb("context"), // URL, tags, etc.
  flowsTriggered: text("flows_triggered").array(),
  leadCaptured: boolean("lead_captured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const agentsRelations = relations(agents, ({ many }) => ({
  knowledgeItems: many(knowledgeItems),
  eventTags: many(eventTags),
  flows: many(flows),
  leads: many(leads),
  conversations: many(conversations),
}));

export const knowledgeItemsRelations = relations(knowledgeItems, ({ one }) => ({
  agent: one(agents, {
    fields: [knowledgeItems.agentId],
    references: [agents.id],
  }),
}));

export const eventTagsRelations = relations(eventTags, ({ one }) => ({
  agent: one(agents, {
    fields: [eventTags.agentId],
    references: [agents.id],
  }),
}));

export const flowsRelations = relations(flows, ({ one, many }) => ({
  agent: one(agents, {
    fields: [flows.agentId],
    references: [agents.id],
  }),
  steps: many(steps),
}));

export const stepsRelations = relations(steps, ({ one }) => ({
  flow: one(flows, {
    fields: [steps.flowId],
    references: [flows.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  agent: one(agents, {
    fields: [leads.agentId],
    references: [agents.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  agent: one(agents, {
    fields: [conversations.agentId],
    references: [agents.id],
  }),
}));

// Insert schemas
export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const updateAgentSchema = insertAgentSchema.partial();

export const insertKnowledgeItemSchema = createInsertSchema(knowledgeItems).omit({
  id: true,
  createdAt: true,
});

export const insertEventTagSchema = createInsertSchema(eventTags).omit({
  id: true,
  createdAt: true,
});

export const insertFlowSchema = createInsertSchema(flows).omit({
  id: true,
  createdAt: true,
});

export const insertStepSchema = createInsertSchema(steps).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

// Types
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type UpdateAgent = z.infer<typeof updateAgentSchema>;

export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type InsertKnowledgeItem = z.infer<typeof insertKnowledgeItemSchema>;

export type EventTag = typeof eventTags.$inferSelect;
export type InsertEventTag = z.infer<typeof insertEventTagSchema>;

export type Flow = typeof flows.$inferSelect;
export type InsertFlow = z.infer<typeof insertFlowSchema>;

export type Step = typeof steps.$inferSelect;
export type InsertStep = z.infer<typeof insertStepSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
