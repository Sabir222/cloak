import { desc, and, eq, isNull, inArray } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, agents, packs, packAgents, purchases } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

export async function getAllAgents() {
  return await db.select().from(agents).orderBy(agents.division, agents.name);
}

export async function getAgentsByDivision(division: string) {
  return await db
    .select()
    .from(agents)
    .where(eq(agents.division, division))
    .orderBy(agents.name);
}

export async function getAgentBySlug(slug: string) {
  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getAgentsBySlugs(slugs: string[]) {
  return await db
    .select()
    .from(agents)
    .where(inArray(agents.slug, slugs));
}

export async function getAllPacks() {
  const allPacks = await db.select().from(packs).orderBy(desc(packs.isFeatured), packs.name);
  const result = [];
  for (const pack of allPacks) {
    const agentCount = await db
      .select({ count: packAgents.packId })
      .from(packAgents)
      .where(eq(packAgents.packId, pack.id));
    result.push({ ...pack, agentCount: agentCount.length });
  }
  return result;
}

export async function getPackBySlug(slug: string) {
  const pack = await db
    .select()
    .from(packs)
    .where(eq(packs.slug, slug))
    .limit(1);
  if (pack.length === 0) return null;

  const packAgentsList = await db
    .select({
      id: agents.id,
      slug: agents.slug,
      name: agents.name,
      description: agents.description,
      division: agents.division,
      emoji: agents.emoji,
    })
    .from(packAgents)
    .innerJoin(agents, eq(packAgents.agentId, agents.id))
    .where(eq(packAgents.packId, pack[0].id))
    .orderBy(agents.name);

  return { ...pack[0], agents: packAgentsList };
}

export async function getFeaturedPacks() {
  return await db
    .select()
    .from(packs)
    .where(eq(packs.isFeatured, true))
    .orderBy(packs.name);
}

export async function createPurchase(data: {
  userId: number;
  type: string;
  packId?: number | null;
  agentIds?: number[];
  stripeSessionId?: string;
  amountCents: number;
  downloadToken: string;
}) {
  const [purchase] = await db
    .insert(purchases)
    .values({
      userId: data.userId,
      type: data.type,
      packId: data.packId || null,
      agentIds: data.agentIds || null,
      stripeSessionId: data.stripeSessionId,
      amountCents: data.amountCents,
      status: 'pending',
      downloadToken: data.downloadToken,
    })
    .returning();
  return purchase;
}

export async function updatePurchaseStatus(
  id: number,
  status: string,
  paymentIntentId?: string
) {
  await db
    .update(purchases)
    .set({
      status,
      stripePaymentIntentId: paymentIntentId || undefined,
    })
    .where(eq(purchases.id, id));
}

export async function getPurchaseByToken(token: string) {
  const result = await db
    .select()
    .from(purchases)
    .where(eq(purchases.downloadToken, token))
    .limit(1);
  return result[0] || null;
}

export async function getPurchaseBySessionId(sessionId: string) {
  const result = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripeSessionId, sessionId))
    .limit(1);
  return result[0] || null;
}

export async function markEmailSent(purchaseId: number) {
  await db
    .update(purchases)
    .set({ emailSent: true })
    .where(eq(purchases.id, purchaseId));
}

export async function getPurchasesByUser(userId: number) {
  return await db
    .select({
      id: purchases.id,
      type: purchases.type,
      packId: purchases.packId,
      agentIds: purchases.agentIds,
      amountCents: purchases.amountCents,
      status: purchases.status,
      downloadToken: purchases.downloadToken,
      createdAt: purchases.createdAt,
      packName: packs.name,
      packSlug: packs.slug,
    })
    .from(purchases)
    .leftJoin(packs, eq(purchases.packId, packs.id))
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.createdAt));
}

export async function getPackById(id: number) {
  const result = await db
    .select()
    .from(packs)
    .where(eq(packs.id, id))
    .limit(1);
  return result[0] || null;
}
