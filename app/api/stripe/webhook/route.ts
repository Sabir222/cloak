import Stripe from 'stripe';
import { handleSubscriptionChange, handlePackPayment, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { updatePurchaseStatus, getPurchaseByToken, getPackById } from '@/lib/db/queries';
import { sendAgentEmail } from '@/lib/email/resend';

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

          const agentCount =
            purchaseDetails.agentIds?.length ?? 1;

          await sendAgentEmail({
            email: purchaseDetails.userEmail,
            downloadToken: purchaseDetails.downloadToken,
            packName,
            agentCount
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
