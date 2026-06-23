import { db } from './drizzle';
import { packs } from './schema';
import { stripe } from '../payments/stripe';
import { eq } from 'drizzle-orm';

async function seedAgentSkills() {
  const existing = await db.select().from(packs).where(eq(packs.slug, 'agent-skills'));
  if (existing.length > 0) {
    console.log('Agent Skills pack already seeded');
    return;
  }

  console.log('Creating Agent Skills pack...');

  const product = await stripe.products.create({
    name: 'Agent Skills: Your Personal Software Engineer',
    description: '24 production-grade engineering skills + 4 specialist personas + 8 slash commands. Turn any AI coding agent into a senior engineer who specs before coding, tests before shipping, and reviews before merging.',
    metadata: { pack_slug: 'agent-skills', bundle_type: 'skill-pack' },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 9900,
    currency: 'usd',
  });

  const [pack] = await db
    .insert(packs)
    .values({
      slug: 'agent-skills',
      name: 'Agent Skills: Your Personal Software Engineer',
      description: '24 production-grade engineering skills that turn any AI coding agent into a senior engineer. Spec before code, test before ship, review before merge. Includes 4 specialist personas, 8 slash commands, and 6 reference checklists. Works with Claude Code, Cursor, Windsurf, Gemini CLI, and more.',
      priceCents: 9900,
      stripePriceId: price.id,
      isFeatured: true,
      bundleType: 'skill-pack',
      dataPath: 'data/agent-skills',
    })
    .returning();

  console.log(`Created pack: ${pack.name} — $${(pack.priceCents / 100).toFixed(2)}`);
  console.log(`Stripe product: ${product.id}`);
  console.log(`Stripe price: ${price.id}`);
  console.log('Done.');
}

seedAgentSkills()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
