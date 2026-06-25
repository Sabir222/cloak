import { desc, and, eq, isNull, inArray } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, teamMembers, teams, users, personas, skills, agentProducts, packs, packSkills, packPersonas, purchases } from './schema';
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

export async function getAllPersonas() {
  return await db.select().from(personas).orderBy(personas.division, personas.name);
}

export async function getPersonasByDivision(division: string) {
  return await db
    .select()
    .from(personas)
    .where(eq(personas.division, division))
    .orderBy(personas.name);
}

export async function getPersonaBySlug(slug: string) {
  const result = await db
    .select()
    .from(personas)
    .where(eq(personas.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getPersonasBySlugs(slugs: string[]) {
  return await db
    .select()
    .from(personas)
    .where(inArray(personas.slug, slugs));
}

export async function getAllSkills() {
  return await db.select().from(skills).orderBy(skills.name);
}

export async function getSkillBySlug(slug: string) {
  const result = await db
    .select()
    .from(skills)
    .where(eq(skills.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getAllAgentProducts() {
  return await db.select().from(agentProducts).orderBy(agentProducts.name);
}

export async function getAgentProductBySlug(slug: string) {
  const result = await db
    .select()
    .from(agentProducts)
    .where(eq(agentProducts.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getAllPacks() {
  const allPacks = await db.select().from(packs).orderBy(desc(packs.isFeatured), packs.name);
  const result = [];
  for (const pack of allPacks) {
    const skillCount = await db
      .select({ count: packSkills.packId })
      .from(packSkills)
      .where(eq(packSkills.packId, pack.id));
    const personaCount = await db
      .select({ count: packPersonas.packId })
      .from(packPersonas)
      .where(eq(packPersonas.packId, pack.id));
    result.push({ ...pack, skillCount: skillCount.length, personaCount: personaCount.length });
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

  const personasList = await db
    .select({
      id: personas.id,
      slug: personas.slug,
      name: personas.name,
      description: personas.description,
      division: personas.division,
      emoji: personas.emoji,
    })
    .from(packPersonas)
    .innerJoin(personas, eq(packPersonas.personaId, personas.id))
    .where(eq(packPersonas.packId, pack[0].id))
    .orderBy(personas.name);

  const skillsList = await db
    .select({
      id: skills.id,
      slug: skills.slug,
      name: skills.name,
      description: skills.description,
    })
    .from(packSkills)
    .innerJoin(skills, eq(packSkills.skillId, skills.id))
    .where(eq(packSkills.packId, pack[0].id))
    .orderBy(skills.name);

  return { ...pack[0], personas: personasList, skills: skillsList };
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
  personaIds?: number[];
  skillId?: number | null;
  agentProductId?: number | null;
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
      personaIds: data.personaIds || null,
      skillId: data.skillId || null,
      agentProductId: data.agentProductId || null,
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
      personaIds: purchases.personaIds,
      skillId: purchases.skillId,
      agentProductId: purchases.agentProductId,
      amountCents: purchases.amountCents,
      status: purchases.status,
      downloadToken: purchases.downloadToken,
      createdAt: purchases.createdAt,
      packName: packs.name,
      packSlug: packs.slug,
      skillName: skills.name,
      skillSlug: skills.slug,
      agentProductName: agentProducts.name,
      agentProductSlug: agentProducts.slug,
    })
    .from(purchases)
    .leftJoin(packs, eq(purchases.packId, packs.id))
    .leftJoin(skills, eq(purchases.skillId, skills.id))
    .leftJoin(agentProducts, eq(purchases.agentProductId, agentProducts.id))
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
