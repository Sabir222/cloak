import Stripe from 'stripe';
import { handleSubscriptionChange, handlePackPayment, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { updatePurchaseStatus, getPurchaseByToken, getPackById, getSkillBySlug, getAgentProductBySlug } from '@/lib/db/queries';
import { sendProductEmail } from '@/lib/email/resend';
import { db } from '@/lib/db/drizzle';
import { purchases, skills, agentProducts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.purchase_type === 'pack' || session.metadata?.purchase_type === 'custom') {
        const purchaseDetails = await handlePackPayment(session);
        const purchase = await getPurchaseByToken(purchaseDetails.downloadToken);

        if (purchase) {
          await updatePurchaseStatus(purchase.id, 'paid', session.payment_intent as string);

          let packName = 'Custom Agent Pack';
          if (purchaseDetails.purchaseType !== 'custom' && purchaseDetails.packId) {
            const pack = await getPackById(purchaseDetails.packId);
            if (pack) packName = pack.name;
          }

          const itemCount =
            purchaseDetails.agentIds?.length ?? 1;

          await sendProductEmail({
            email: purchaseDetails.userEmail,
            downloadToken: purchaseDetails.downloadToken,
            productName: packName,
            itemCount
          });
        }
      } else if (session.metadata?.purchase_type === 'skill') {
        const purchaseDetails = await handlePackPayment(session);
        const purchase = await getPurchaseByToken(purchaseDetails.downloadToken);

        if (purchase) {
          await updatePurchaseStatus(purchase.id, 'paid', session.payment_intent as string);

          const skill = purchaseDetails.skillId
            ? await db.select().from(skills).where(eq(skills.id, purchaseDetails.skillId)).limit(1).then(r => r[0])
            : null;

          await sendProductEmail({
            email: purchaseDetails.userEmail,
            downloadToken: purchaseDetails.downloadToken,
            productName: skill?.name || 'Skill',
            itemCount: 1
          });
        }
      } else if (session.metadata?.purchase_type === 'agent') {
        const purchaseDetails = await handlePackPayment(session);
        const purchase = await getPurchaseByToken(purchaseDetails.downloadToken);

        if (purchase) {
          await updatePurchaseStatus(purchase.id, 'paid', session.payment_intent as string);

          const agent = purchaseDetails.agentProductId
            ? await db.select().from(agentProducts).where(eq(agentProducts.id, purchaseDetails.agentProductId)).limit(1).then(r => r[0])
            : null;

          await sendProductEmail({
            email: purchaseDetails.userEmail,
            downloadToken: purchaseDetails.downloadToken,
            productName: agent?.name || 'Agent Product',
            itemCount: 1
          });
        }
      }
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
