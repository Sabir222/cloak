import { Checkout } from '@polar-sh/nextjs';
import { polarMode } from '@/lib/payments/polar';

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: `${process.env.BASE_URL}/dashboard?polar_checkout={CHECKOUT_ID}`,
  returnUrl: `${process.env.BASE_URL}/pricing`,
  server: polarMode(),
  includeCheckoutId: true,
});
