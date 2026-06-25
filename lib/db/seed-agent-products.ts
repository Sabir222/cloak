import { db } from './drizzle';
import { agentProducts } from './schema';
import { stripe } from '../payments/stripe';
import { eq } from 'drizzle-orm';

async function seedAgentProducts() {
  const existing = await db.select().from(agentProducts).where(eq(agentProducts.slug, 'trovescout'));
  if (existing.length > 0) {
    console.log('Trovescout agent product already seeded');
    return;
  }

  console.log('Creating TroveScout agent product...');

  const product = await stripe.products.create({
    name: 'TroveScout — Multi-Source Research Agent',
    description: 'Turn any AI agent into a live research engine. Pulls and synthesizes what people actually say across Reddit, X, YouTube, and the web in 30 seconds.',
    metadata: { agent_slug: 'trovescout', product_type: 'agent' },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2900,
    currency: 'usd',
  });

  const [agent] = await db
    .insert(agentProducts)
    .values({
      slug: 'trovescout',
      name: 'TroveScout — Multi-Source Research Agent',
      description: 'A slash command that turns any AI agent into a live research engine — pulling and synthesizing what people actually say across Reddit, X, YouTube, and the web, all in about 30 seconds.',
      version: '3.8.0',
      priceCents: 2900,
      stripePriceId: price.id,
      zipPath: 'data/agents/trovescout/trovescout-skill-v3.8.0.zip',
    })
    .returning();

  console.log(`Created agent product: ${agent.name} — $${(agent.priceCents / 100).toFixed(2)}`);
  console.log(`Stripe product: ${product.id}`);
  console.log(`Stripe price: ${price.id}`);
  console.log('Done.');
}

seedAgentProducts()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
