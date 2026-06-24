import { Webhooks } from '@polar-sh/nextjs';

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log(`Polar webhook received: ${payload.type}`);
  },
  onOrderCreated: async (payload) => {
    console.log(`Order created: ${payload.data.id} - status: ${payload.data.status}`);
  },
  onOrderPaid: async (payload) => {
    console.log(`Order paid: ${payload.data.id} - amount: ${payload.data.totalAmount}`);
  },
  onSubscriptionCreated: async (payload) => {
    console.log(`Subscription created: ${payload.data.id}`);
  },
  onSubscriptionActive: async (payload) => {
    console.log(`Subscription active: ${payload.data.id}`);
  },
  onSubscriptionCanceled: async (payload) => {
    console.log(`Subscription canceled: ${payload.data.id}`);
  },
});
