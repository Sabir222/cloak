import { db } from './drizzle';
import { agents, packs, packAgents } from './schema';
import { stripe } from '../payments/stripe';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CatalogAgent {
  slug: string;
  name: string;
  description: string;
  division: string;
  emoji: string;
  filePath: string;
}

interface CatalogPack {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  isFeatured: boolean;
  agentSlugs: string[];
  agentCount: number;
}

interface Catalog {
  agents: CatalogAgent[];
  packs: CatalogPack[];
}

async function seedPacks() {
  const catalogPath = join(process.cwd(), 'data', 'catalog.json');
  const catalog: Catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));

  console.log(`Catalog: ${catalog.agents.length} agents, ${catalog.packs.length} packs`);

  const existingAgents = await db.select().from(agents);
  if (existingAgents.length === 0) {
    console.log('Seeding agents...');
    for (const agent of catalog.agents) {
      await db.insert(agents).values({
        slug: agent.slug,
        name: agent.name,
        description: agent.description,
        division: agent.division,
        emoji: agent.emoji,
        filePath: agent.filePath,
      });
    }
    console.log(`Inserted ${catalog.agents.length} agents`);
  } else {
    console.log(`Agents already seeded (${existingAgents.length})`);
  }

  const existingPacks = await db.select().from(packs);
  if (existingPacks.length === 0) {
    console.log('Seeding packs and creating Stripe products...');

    for (const pack of catalog.packs) {
      const product = await stripe.products.create({
        name: pack.name,
        description: pack.description,
        metadata: { pack_slug: pack.slug },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pack.priceCents,
        currency: 'usd',
      });

      const [insertedPack] = await db
        .insert(packs)
        .values({
          slug: pack.slug,
          name: pack.name,
          description: pack.description,
          priceCents: pack.priceCents,
          stripePriceId: price.id,
          isFeatured: pack.isFeatured,
        })
        .returning();

      const agentRows = await db
        .select({ id: agents.id })
        .from(agents)
        .where(
          inArray(
            agents.slug,
            pack.agentSlugs
          )
        );

      for (const agent of agentRows) {
        await db.insert(packAgents).values({
          packId: insertedPack.id,
          agentId: agent.id,
        });
      }

      console.log(`  ${pack.name}: ${agentRows.length} agents, $${(pack.priceCents / 100).toFixed(2)}`);
    }
    console.log(`Inserted ${catalog.packs.length} packs`);
  } else {
    console.log(`Packs already seeded (${existingPacks.length})`);
  }

  console.log('Seed complete.');
}

import { inArray } from 'drizzle-orm';

seedPacks()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Exiting...');
    process.exit(0);
  });
