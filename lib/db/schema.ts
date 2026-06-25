import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const personas = pgTable('personas', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  division: varchar('division', { length: 100 }).notNull(),
  emoji: varchar('emoji', { length: 10 }),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const agentProducts = pgTable('agent_products', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 50 }),
  priceCents: integer('price_cents').notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  zipPath: varchar('zip_path', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const packs = pgTable('packs', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  isFeatured: boolean('is_featured').notNull().default(false),
  bundleType: varchar('bundle_type', { length: 20 }).notNull().default('skill-pack'),
  dataPath: varchar('data_path', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const packSkills = pgTable('pack_skills', {
  packId: integer('pack_id')
    .notNull()
    .references(() => packs.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id')
    .notNull()
    .references(() => skills.id, { onDelete: 'cascade' }),
});

export const packPersonas = pgTable('pack_personas', {
  packId: integer('pack_id')
    .notNull()
    .references(() => packs.id, { onDelete: 'cascade' }),
  personaId: integer('persona_id')
    .notNull()
    .references(() => personas.id, { onDelete: 'cascade' }),
});

export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 20 }).notNull(),
  packId: integer('pack_id').references(() => packs.id),
  personaIds: jsonb('persona_ids'),
  skillId: integer('skill_id').references(() => skills.id),
  agentProductId: integer('agent_product_id').references(() => agentProducts.id),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  amountCents: integer('amount_cents').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  downloadToken: varchar('download_token', { length: 255 }).unique(),
  emailSent: boolean('email_sent').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  purchases: many(purchases),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const personasRelations = relations(personas, ({ many }) => ({
  packPersonas: many(packPersonas),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  packSkills: many(packSkills),
}));

export const agentProductsRelations = relations(agentProducts, ({ many }) => ({
  purchases: many(purchases),
}));

export const packsRelations = relations(packs, ({ many }) => ({
  packSkills: many(packSkills),
  packPersonas: many(packPersonas),
  purchases: many(purchases),
}));

export const packSkillsRelations = relations(packSkills, ({ one }) => ({
  pack: one(packs, {
    fields: [packSkills.packId],
    references: [packs.id],
  }),
  skill: one(skills, {
    fields: [packSkills.skillId],
    references: [skills.id],
  }),
}));

export const packPersonasRelations = relations(packPersonas, ({ one }) => ({
  pack: one(packs, {
    fields: [packPersonas.packId],
    references: [packs.id],
  }),
  persona: one(personas, {
    fields: [packPersonas.personaId],
    references: [personas.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  pack: one(packs, {
    fields: [purchases.packId],
    references: [packs.id],
  }),
  skill: one(skills, {
    fields: [purchases.skillId],
    references: [skills.id],
  }),
  agentProduct: one(agentProducts, {
    fields: [purchases.agentProductId],
    references: [agentProducts.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Persona = typeof personas.$inferSelect;
export type NewPersona = typeof personas.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type AgentProduct = typeof agentProducts.$inferSelect;
export type NewAgentProduct = typeof agentProducts.$inferInsert;
export type Pack = typeof packs.$inferSelect;
export type NewPack = typeof packs.$inferInsert;
export type PackSkill = typeof packSkills.$inferSelect;
export type NewPackSkill = typeof packSkills.$inferInsert;
export type PackPersona = typeof packPersonas.$inferSelect;
export type NewPackPersona = typeof packPersonas.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
