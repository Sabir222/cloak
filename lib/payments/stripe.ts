import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription
} from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia'
});

export async function createCheckoutSession({
  team,
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  const user = await getUser();

  if (!team || !user) {
    const locale = await getLocale();
    redirect(`/${locale}/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14
    }
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    const locale = await getLocale();
    redirect(`/${locale}/pricing`);
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const price = subscription.items.data[0]?.price;
    const productId = price?.product as string | undefined;

    let planName: string | null = null;
    if (productId) {
      const product = await stripe.products.retrieve(productId);
      planName = product.name;
    }

    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: productId ?? null,
      planName,
      subscriptionStatus: status
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status
    });
  }
}

export async function createPackCheckoutSession({
  userId,
  packId,
  priceId,
  amountCents,
  downloadToken
}: {
  userId: number;
  packId: number;
  priceId: string;
  amountCents: number;
  downloadToken: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/packs`,
    client_reference_id: userId.toString(),
    metadata: {
      purchase_type: 'pack',
      pack_id: packId.toString(),
      download_token: downloadToken
    }
  });

  return session.url!;
}

export async function createSkillCheckoutSession({
  userId,
  skillId,
  priceId,
  amountCents,
  downloadToken
}: {
  userId: number;
  skillId: number;
  priceId: string;
  amountCents: number;
  downloadToken: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/skills`,
    client_reference_id: userId.toString(),
    metadata: {
      purchase_type: 'skill',
      skill_id: skillId.toString(),
      download_token: downloadToken
    }
  });

  return session.url!;
}

export async function createAgentProductCheckoutSession({
  userId,
  agentProductId,
  priceId,
  amountCents,
  downloadToken
}: {
  userId: number;
  agentProductId: number;
  priceId: string;
  amountCents: number;
  downloadToken: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/agents`,
    client_reference_id: userId.toString(),
    metadata: {
      purchase_type: 'agent',
      agent_product_id: agentProductId.toString(),
      download_token: downloadToken
    }
  });

  return session.url!;
}

export async function createCustomCheckoutSession({
  userId,
  agentCount,
  agentIds,
  downloadToken
}: {
  userId: number;
  agentCount: number;
  agentIds: number[];
  downloadToken: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Custom Agent Pack'
          },
          unit_amount: 500
        },
        quantity: agentCount
      }
    ],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/packs`,
    client_reference_id: userId.toString(),
    metadata: {
      purchase_type: 'custom',
      agent_ids: agentIds.join(','),
      download_token: downloadToken
    }
  });

  return session.url!;
}

export async function handlePackPayment(session: Stripe.Checkout.Session) {
  const purchaseType = session.metadata?.purchase_type;
  const packId = session.metadata?.pack_id;
  const agentIds = session.metadata?.agent_ids;
  const skillId = session.metadata?.skill_id;
  const agentProductId = session.metadata?.agent_product_id;
  const downloadToken = session.metadata?.download_token;

  let userEmail: string | undefined;
  if (session.customer_email) {
    userEmail = session.customer_email;
  } else if (
    session.customer &&
    typeof session.customer !== 'string' &&
    'email' in session.customer
  ) {
    userEmail = (session.customer as Stripe.Customer).email ?? undefined;
  } else if (session.customer_details) {
    userEmail = session.customer_details.email ?? undefined;
  }

  return {
    downloadToken: downloadToken!,
    userEmail: userEmail!,
    purchaseType: purchaseType!,
    packId: packId ? Number(packId) : undefined,
    agentIds: agentIds ? agentIds.split(',').map(Number) : undefined,
    skillId: skillId ? Number(skillId) : undefined,
    agentProductId: agentProductId ? Number(agentProductId) : undefined
  };
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}
