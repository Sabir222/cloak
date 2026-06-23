export const siteConfig = {
  name: 'ACME',
  description: 'Get started quickly with Next.js, Postgres, and Stripe.',
  docsUrl: 'https://nextjs.org/docs',
  githubUrl: 'https://github.com/nextjs/saas-starter',
} as const;

export type SiteConfig = typeof siteConfig;
