import { CustomerPortal } from '@polar-sh/nextjs';
import { polarMode } from '@/lib/payments/polar';
import { NextRequest } from 'next/server';
import { getUser } from '@/lib/db/queries';

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: polarMode(),
  returnUrl: `${process.env.BASE_URL}/dashboard`,
  getExternalCustomerId: async (req: NextRequest) => {
    const user = await getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id.toString();
  },
});
