'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { randomUUID } from 'crypto';
import { getUser, getPackById, getSkillBySlug, getAgentProductBySlug, createPurchase } from '@/lib/db/queries';
import {
  createPackCheckoutSession,
  createCustomCheckoutSession,
  createSkillCheckoutSession,
  createAgentProductCheckoutSession
} from '@/lib/payments/stripe';

export async function buyPack(packId: number) {
  const user = await getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/sign-up?redirect=pack&packId=${packId}`);
  }

  const pack = await getPackById(packId);
  if (!pack) {
    return { error: 'Pack not found' };
  }

  if (!pack.stripePriceId) {
    return { error: 'Pack is not available for purchase' };
  }

  const downloadToken = randomUUID();

  await createPurchase({
    userId: user.id,
    type: 'pack',
    packId: pack.id,
    amountCents: pack.priceCents,
    downloadToken
  });

  const url = await createPackCheckoutSession({
    userId: user.id,
    packId: pack.id,
    priceId: pack.stripePriceId,
    amountCents: pack.priceCents,
    downloadToken
  });

  redirect(url);
}

export async function buyCustomPersonas(personaIds: number[]) {
  const user = await getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/sign-up?redirect=custom`);
  }

  if (!personaIds || personaIds.length === 0) {
    return { error: 'No personas selected' };
  }

  const downloadToken = randomUUID();
  const amountCents = personaIds.length * 500;

  await createPurchase({
    userId: user.id,
    type: 'custom',
    personaIds,
    amountCents,
    downloadToken
  });

  const url = await createCustomCheckoutSession({
    userId: user.id,
    agentCount: personaIds.length,
    agentIds: personaIds,
    downloadToken
  });

  redirect(url);
}
export const buyCustomAgents = buyCustomPersonas;

export async function buySkill(slug: string) {
  const user = await getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/sign-up?redirect=skill&slug=${slug}`);
  }

  const skill = await getSkillBySlug(slug);
  if (!skill) {
    return { error: 'Skill not found' };
  }

  if (!skill.stripePriceId) {
    return { error: 'Skill is not available for purchase' };
  }

  const downloadToken = randomUUID();

  await createPurchase({
    userId: user.id,
    type: 'skill',
    skillId: skill.id,
    amountCents: skill.priceCents,
    downloadToken
  });

  const url = await createSkillCheckoutSession({
    userId: user.id,
    skillId: skill.id,
    priceId: skill.stripePriceId,
    amountCents: skill.priceCents,
    downloadToken
  });

  redirect(url);
}

export async function buyAgentProduct(slug: string) {
  const user = await getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/sign-up?redirect=agent&slug=${slug}`);
  }

  const agent = await getAgentProductBySlug(slug);
  if (!agent) {
    return { error: 'Agent product not found' };
  }

  if (!agent.stripePriceId) {
    return { error: 'Agent product is not available for purchase' };
  }

  const downloadToken = randomUUID();

  await createPurchase({
    userId: user.id,
    type: 'agent',
    agentProductId: agent.id,
    amountCents: agent.priceCents,
    downloadToken
  });

  const url = await createAgentProductCheckoutSession({
    userId: user.id,
    agentProductId: agent.id,
    priceId: agent.stripePriceId,
    amountCents: agent.priceCents,
    downloadToken
  });

  redirect(url);
}
