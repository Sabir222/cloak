import { Polar } from '@polar-sh/sdk';

export function getPolarClient() {
  return new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: (process.env.POLAR_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  });
}

export function polarMode(): 'sandbox' | 'production' {
  return (process.env.POLAR_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
}
