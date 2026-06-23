'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { randomUUID } from 'crypto';
import { getUser, getPackById, createPurchase } from '@/lib/db/queries';
import {
  createPackCheckoutSession,
  createCustomCheckoutSession
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

export async function buyCustomAgents(agentIds: number[]) {
  const user = await getUser();

  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/sign-up?redirect=custom`);
  }

  if (!agentIds || agentIds.length === 0) {
    return { error: 'No agents selected' };
  }

  const downloadToken = randomUUID();
  const amountCents = agentIds.length * 500;

  await createPurchase({
    userId: user.id,
    type: 'custom',
    agentIds,
    amountCents,
    downloadToken
  });

  const url = await createCustomCheckoutSession({
    userId: user.id,
    agentCount: agentIds.length,
    agentIds,
    downloadToken
  });

  redirect(url);
}
