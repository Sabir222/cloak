import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';

const AGENCY_ROOT = join(__dirname, '..', '..', 'agency-agents');
const OUTPUT_DIR = join(__dirname, '..', 'data', 'agents');
const CATALOG_PATH = join(__dirname, '..', 'data', 'catalog.json');

const NON_DIVISION_DIRS = ['integrations', 'examples', 'strategy', 'scripts'];
const DIVISIONS = JSON.parse(
  readFileSync(join(AGENCY_ROOT, 'divisions.json'), 'utf-8')
).divisions;

interface AgentMeta {
  slug: string;
  name: string;
  description: string;
  division: string;
  emoji: string;
  filePath: string;
}

interface PackDef {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  isFeatured: boolean;
  agentSlugs: string[];
}

function parseFrontmatter(content: string): { name: string; description: string; emoji: string } {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { name: '', description: '', emoji: '' };

  const fm = fmMatch[1];
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  const emojiMatch = fm.match(/^emoji:\s*(.+)$/m);

  return {
    name: nameMatch?.[1]?.trim() || '',
    description: descMatch?.[1]?.trim() || '',
    emoji: emojiMatch?.[1]?.trim() || '',
  };
}

function findAgentFiles(dir: string, base = dir): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findAgentFiles(fullPath, base));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function slugify(filename: string): string {
  return filename.replace(/\.md$/, '');
}

const agents: AgentMeta[] = [];

for (const [divisionDir, divisionInfo] of Object.entries(DIVISIONS) as [string, { label: string; icon: string; color: string }][]) {
  const divisionPath = join(AGENCY_ROOT, divisionDir);
  if (!existsSync(divisionPath)) {
    console.warn(`Division directory not found: ${divisionDir}`);
    continue;
  }

  const files = findAgentFiles(divisionPath);

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const meta = parseFrontmatter(content);

    if (!meta.name) {
      console.warn(`Skipping (no name in frontmatter): ${file}`);
      continue;
    }

    const relPath = relative(AGENCY_ROOT, file);
    const filename = relPath.split('/').pop()!;
    const slug = slugify(filename);

    const destDir = join(OUTPUT_DIR, dirname(relPath));
    mkdirSync(destDir, { recursive: true });
    copyFileSync(file, join(OUTPUT_DIR, relPath));

    agents.push({
      slug,
      name: meta.name,
      description: meta.description,
      division: divisionDir,
      emoji: meta.emoji,
      filePath: relPath,
    });
  }

  console.log(`${divisionInfo.label}: ${files.length} agents`);
}

const packs: PackDef[] = [
  {
    slug: 'startup-mvp',
    name: 'Startup MVP Pack',
    description: 'Everything you need to build, launch, and grow your startup MVP — from frontend to growth hacking to quality assurance.',
    priceCents: 5900,
    isFeatured: true,
    agentSlugs: [
      'engineering-frontend-developer',
      'engineering-backend-architect',
      'engineering-rapid-prototyper',
      'marketing-growth-hacker',
      'testing-reality-checker',
      'product-manager',
    ],
  },
  {
    slug: 'marketing-agency',
    name: 'Marketing Agency Pack',
    description: 'Run a full-service marketing agency with content creators, social media strategists, paid media experts, and designers.',
    priceCents: 7900,
    isFeatured: true,
    agentSlugs: [],
  },
  {
    slug: 'devsecops',
    name: 'DevSecOps Pack',
    description: 'Secure your entire pipeline — from threat modeling and penetration testing to CI/CD automation, SRE, and quality gates.',
    priceCents: 6900,
    isFeatured: true,
    agentSlugs: [],
  },
  {
    slug: 'china-market',
    name: 'China Market Pack',
    description: 'Dominate the Chinese market with specialized agents for Douyin, Xiaohongshu, WeChat, Baidu, Bilibili, Kuaishou, and Weibo.',
    priceCents: 4900,
    isFeatured: false,
    agentSlugs: [
      'marketing-douyin-strategist',
      'marketing-xiaohongshu-specialist',
      'marketing-wechat-official-account',
      'marketing-baidu-seo-specialist',
      'marketing-bilibili-content-strategist',
      'marketing-kuaishou-strategist',
      'marketing-weibo-strategist',
      'marketing-china-ecommerce-operator',
      'marketing-china-market-localization-strategist',
      'marketing-private-domain-operator',
      'marketing-livestream-commerce-coach',
      'marketing-short-video-editing-coach',
      'marketing-podcast-strategist',
      'marketing-multi-platform-publisher',
      'engineering-wechat-mini-program-developer',
      'engineering-feishu-integration-developer',
    ],
  },
  {
    slug: 'sales-machine',
    name: 'Sales Machine Pack',
    description: 'Turn your pipeline into revenue with outbound strategists, deal architects, discovery coaches, and proposal writers.',
    priceCents: 4900,
    isFeatured: false,
    agentSlugs: [],
  },
  {
    slug: 'legal-compliance',
    name: 'Legal & Compliance Pack',
    description: 'Law firms and compliance teams — document review, client intake, billing, regulatory compliance, and data privacy.',
    priceCents: 3900,
    isFeatured: false,
    agentSlugs: [
      'legal-document-review',
      'legal-client-intake',
      'legal-billing-time-tracking',
      'security-compliance-auditor',
      'data-privacy-officer',
      'healthcare-marketing-compliance',
      'support-legal-compliance-checker',
    ],
  },
  {
    slug: 'game-studio',
    name: 'Game Studio Pack',
    description: 'Build worlds across every major engine — Unity, Unreal, Godot, Blender, Roblox — plus worldbuilding academics for narrative depth.',
    priceCents: 5900,
    isFeatured: true,
    agentSlugs: [],
  },
];

const marketingAgentSlugs = agents
  .filter((a) => a.division === 'marketing' || a.division === 'design' || a.division === 'paid-media')
  .map((a) => a.slug);

const devsecopsAgentSlugs = agents
  .filter(
    (a) =>
      a.division === 'security' ||
      a.division === 'testing' ||
      a.slug === 'engineering-devops-automator' ||
      a.slug === 'engineering-sre' ||
      a.slug === 'engineering-incident-response-commander' ||
      a.slug === 'engineering-code-reviewer'
  )
  .map((a) => a.slug);

const salesAgentSlugs = agents
  .filter((a) => a.division === 'sales')
  .map((a) => a.slug);

const gameStudioAgentSlugs = agents
  .filter((a) => a.division === 'game-development' || a.division === 'academic')
  .map((a) => a.slug);

for (const pack of packs) {
  if (pack.agentSlugs.length === 0) {
    if (pack.slug === 'marketing-agency') pack.agentSlugs = marketingAgentSlugs;
    else if (pack.slug === 'devsecops') pack.agentSlugs = devsecopsAgentSlugs;
    else if (pack.slug === 'sales-machine') pack.agentSlugs = salesAgentSlugs;
    else if (pack.slug === 'game-studio') pack.agentSlugs = gameStudioAgentSlugs;
  }
}

for (const pack of packs) {
  const valid = pack.agentSlugs.every((s) => agents.some((a) => a.slug === s));
  if (!valid) {
    const missing = pack.agentSlugs.filter((s) => !agents.some((a) => a.slug === s));
    console.warn(`Pack "${pack.slug}" has missing agents: ${missing.join(', ')}`);
  }
  console.log(`Pack: ${pack.name} — ${pack.agentSlugs.length} agents — $${(pack.priceCents / 100).toFixed(2)}`);
}

const catalog = {
  generatedAt: new Date().toISOString(),
  totalAgents: agents.length,
  agents,
  packs: packs.map((p) => ({
    ...p,
    agentCount: p.agentSlugs.length,
  })),
};

writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
console.log(`\nCatalog written to ${relative(process.cwd(), CATALOG_PATH)}`);
console.log(`Total agents: ${agents.length}`);
console.log(`Total packs: ${packs.length}`);
console.log(`Agent files copied to ${relative(process.cwd(), OUTPUT_DIR)}/`);
