import { db } from './drizzle';
import { personas, packs, packPersonas } from './schema';
import { stripe } from '../payments/stripe';
import { eq, inArray } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

interface CatalogPersona {
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
  agents: CatalogPersona[];
  packs: CatalogPack[];
}

async function seedPacks() {
  const catalogPath = join(process.cwd(), 'data', 'catalog.json');
  const catalog: Catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));

  console.log(`Catalog: ${catalog.agents.length} personas, ${catalog.packs.length} packs`);

  const existingPersonas = await db.select().from(personas);
  if (existingPersonas.length === 0) {
    console.log('Seeding personas...');
    for (const persona of catalog.agents) {
      await db.insert(personas).values({
        slug: persona.slug,
        name: persona.name,
        description: persona.description,
        division: persona.division,
        emoji: persona.emoji,
        filePath: persona.filePath,
      });
    }
    console.log(`Inserted ${catalog.agents.length} personas`);
  } else {
    console.log(`Personas already seeded (${existingPersonas.length})`);
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

      const personaRows = await db
        .select({ id: personas.id })
        .from(personas)
        .where(
          inArray(
            personas.slug,
            pack.agentSlugs
          )
        );

      for (const persona of personaRows) {
        await db.insert(packPersonas).values({
          packId: insertedPack.id,
          personaId: persona.id,
        });
      }

      console.log(`  ${pack.name}: ${personaRows.length} personas, $${(pack.priceCents / 100).toFixed(2)}`);
    }
    console.log(`Inserted ${catalog.packs.length} packs`);
  } else {
    console.log(`Packs already seeded (${existingPacks.length})`);
  }

  console.log('Seed complete.');
}

seedPacks()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Exiting...');
    process.exit(0);
  });
