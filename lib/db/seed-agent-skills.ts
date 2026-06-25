import { db } from './drizzle';
import { skills, packs, packSkills, personas, packPersonas } from './schema';
import { stripe } from '../payments/stripe';
import { eq, inArray } from 'drizzle-orm';

const SKILL_DEFS = [
  { slug: 'using-agent-skills', name: 'Using Agent Skills', description: 'Discover and invoke skills by intent matching', priceCents: 500 },
  { slug: 'interview-me', name: 'Interview Me', description: 'Extract true user intent through structured interviews', priceCents: 500 },
  { slug: 'idea-refine', name: 'Idea Refine', description: 'Transform vague ideas into actionable specs', priceCents: 500 },
  { slug: 'spec-driven-development', name: 'Spec-Driven Development', description: 'Write structured specs before writing code', priceCents: 500 },
  { slug: 'planning-and-task-breakdown', name: 'Planning & Task Breakdown', description: 'Break work into ordered, dependency-aware tasks', priceCents: 500 },
  { slug: 'incremental-implementation', name: 'Incremental Implementation', description: 'Build in thin vertical slices with working checkpoints', priceCents: 500 },
  { slug: 'context-engineering', name: 'Context Engineering', description: 'Optimize agent context windows for maximum effectiveness', priceCents: 500 },
  { slug: 'source-driven-development', name: 'Source-Driven Development', description: 'Ground implementation in official documentation', priceCents: 500 },
  { slug: 'doubt-driven-development', name: 'Doubt-Driven Development', description: 'Adversarial cross-examination of design decisions', priceCents: 500 },
  { slug: 'test-driven-development', name: 'Test-Driven Development', description: 'RED-GREEN-REFACTOR cycle with coverage enforcement', priceCents: 500 },
  { slug: 'frontend-ui-engineering', name: 'Frontend UI Engineering', description: 'Build production-quality UI with animation and responsiveness', priceCents: 500 },
  { slug: 'api-and-interface-design', name: 'API & Interface Design', description: 'Design stable interface contracts with type safety', priceCents: 500 },
  { slug: 'browser-testing-with-devtools', name: 'Browser Testing with DevTools', description: 'Chrome DevTools-driven testing workflows', priceCents: 500 },
  { slug: 'debugging-and-error-recovery', name: 'Debugging & Error Recovery', description: 'Systematic root-cause debugging', priceCents: 500 },
  { slug: 'code-review-and-quality', name: 'Code Review & Quality', description: 'Five-axis review for correctness, readability, architecture, security, performance', priceCents: 500 },
  { slug: 'code-simplification', name: 'Code Simplification', description: 'Reduce unnecessary complexity without changing behavior', priceCents: 500 },
  { slug: 'security-and-hardening', name: 'Security & Hardening', description: 'OWASP-informed security prevention and remediation', priceCents: 500 },
  { slug: 'performance-optimization', name: 'Performance Optimization', description: 'Measure-first approach to performance improvements', priceCents: 500 },
  { slug: 'git-workflow-and-versioning', name: 'Git Workflow & Versioning', description: 'Atomic commits with clean history', priceCents: 500 },
  { slug: 'ci-cd-and-automation', name: 'CI/CD & Automation', description: 'Automated quality gates in deployment pipelines', priceCents: 500 },
  { slug: 'deprecation-and-migration', name: 'Deprecation & Migration', description: 'Safely remove old systems and migrate to new ones', priceCents: 500 },
  { slug: 'documentation-and-adrs', name: 'Documentation & ADRs', description: 'Record architectural decisions and rationale', priceCents: 500 },
  { slug: 'observability-and-instrumentation', name: 'Observability & Instrumentation', description: 'RED metrics, traces, and alerts', priceCents: 500 },
  { slug: 'shipping-and-launch', name: 'Shipping & Launch', description: 'Pre-launch checklist with rollback plan', priceCents: 500 },
];

const PERSONA_SLUGS = ['code-reviewer', 'security-auditor', 'test-engineer', 'web-performance-auditor'];

async function seedAgentSkills() {
  const existingPack = await db.select().from(packs).where(eq(packs.slug, 'agent-skills'));
  const packExists = existingPack.length > 0;

  console.log('Seeding individual skills...');
  let insertedCount = 0;
  for (const def of SKILL_DEFS) {
    const existing = await db.select().from(skills).where(eq(skills.slug, def.slug));
    if (existing.length === 0) {
      await db.insert(skills).values({
        slug: def.slug,
        name: def.name,
        description: def.description,
        priceCents: def.priceCents,
        filePath: `data/agent-skills/skills/${def.slug}/SKILL.md`,
      });
      insertedCount++;
    }
  }
  console.log(`Inserted ${insertedCount} new skills (${SKILL_DEFS.length - insertedCount} already existed)`);

  if (!packExists) {
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

    const allSkills = await db
      .select({ id: skills.id })
      .from(skills)
      .where(inArray(skills.slug, SKILL_DEFS.map(s => s.slug)));

    for (const skill of allSkills) {
      await db.insert(packSkills).values({
        packId: pack.id,
        skillId: skill.id,
      });
    }
    console.log(`Linked ${allSkills.length} skills to pack`);

    const personaRows = await db
      .select({ id: personas.id })
      .from(personas)
      .where(inArray(personas.slug, PERSONA_SLUGS));

    for (const persona of personaRows) {
      await db.insert(packPersonas).values({
        packId: pack.id,
        personaId: persona.id,
      });
    }
    console.log(`Linked ${personaRows.length} personas to pack`);
  } else {
    console.log('Agent Skills pack already exists');
  }

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
