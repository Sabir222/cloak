import { NextRequest, NextResponse } from 'next/server';
import * as archiverLib from 'archiver';
import { getPurchaseByToken, getPackById } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { personas, packPersonas, packs, skills, agentProducts } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { Writable } from 'stream';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing download token' }, { status: 400 });
  }

  const purchase = await getPurchaseByToken(token);
  if (!purchase) {
    return NextResponse.json({ error: 'Invalid download token' }, { status: 404 });
  }

  if (purchase.status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 403 });
  }

  // Agent product (zip) — return the stored zip directly
  if (purchase.type === 'agent' && purchase.agentProductId) {
    const agent = await db
      .select()
      .from(agentProducts)
      .where(eq(agentProducts.id, purchase.agentProductId))
      .limit(1);

    if (agent.length === 0) {
      return NextResponse.json({ error: 'Agent product not found' }, { status: 404 });
    }

    const zipPath = join(process.cwd(), agent[0].zipPath);
    const zipBuffer = readFileSync(zipPath);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${agent[0].slug}-v${agent[0].version || '1.0.0'}.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  }

  // Individual skill — return the SKILL.md file
  if (purchase.type === 'skill' && purchase.skillId) {
    const skill = await db
      .select()
      .from(skills)
      .where(eq(skills.id, purchase.skillId))
      .limit(1);

    if (skill.length === 0) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const skillPath = join(process.cwd(), skill[0].filePath);
    const content = readFileSync(skillPath, 'utf-8');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${skill[0].slug}.md"`,
      },
    });
  }

  const chunks: Buffer[] = [];
  const writableStream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  const archive = (archiverLib as any)('zip', { zlib: { level: 9 } });
  archive.pipe(writableStream);

  let packName = 'Agent Pack';
  let pack: typeof packs.$inferSelect | null = null;

  if (purchase.packId) {
    pack = await getPackById(purchase.packId);
    if (pack) packName = pack.name;
  }

  if (pack && pack.bundleType === 'skill-pack' && pack.dataPath) {
    const skillPackDir = join(process.cwd(), pack.dataPath);

    const readmeContent = `# ${pack.name}

## Installation

### Claude Code (Recommended)
\`\`\`bash
claude --plugin-dir /path/to/${pack.slug}

# Or copy skills manually
cp -r skills/* ~/.claude/skills/
cp -r personas/* ~/.claude/agents/
cp -r .claude/commands/* ~/.claude/commands/
\`\`\`

### Cursor
\`\`\`bash
cp skills/*/SKILL.md ~/.cursor/rules/
\`\`\`

### Gemini CLI
\`\`\`bash
gemini skills install ./skills/
\`\`\`

### OpenCode / Other Tools
Skills are plain Markdown — they work with any agent that accepts instruction files.

## Contents

- 24 engineering skills (spec → plan → build → test → review → ship)
- 4 specialist personas (code-reviewer, test-engineer, security-auditor, web-performance-auditor)
- 8 slash commands (/spec, /plan, /build, /test, /review, /webperf, /code-simplify, /ship)
- 6 reference checklists (testing, security, performance, accessibility, observability, orchestration)

## Support

If you have any issues, please contact support.
`;

    archive.append(readmeContent, { name: 'README.md' });
    addDirectoryToArchive(archive, skillPackDir, pack.dataPath, '');
  } else {
    let personaFiles: { name: string; filePath: string }[] = [];

    if (purchase.type === 'pack' && purchase.packId) {
      const packPersonaRows = await db
        .select({ slug: personas.slug, name: personas.name, filePath: personas.filePath })
        .from(packPersonas)
        .innerJoin(personas, eq(packPersonas.personaId, personas.id))
        .where(eq(packPersonas.packId, purchase.packId));

      personaFiles = packPersonaRows.map((a) => ({
        name: `${a.slug}.md`,
        filePath: a.filePath,
      }));
    } else if (purchase.type === 'custom' && purchase.personaIds) {
      const ids = purchase.personaIds as number[];
      const customPersonas = await db
        .select({ slug: personas.slug, name: personas.name, filePath: personas.filePath })
        .from(personas)
        .where(inArray(personas.id, ids));

      personaFiles = customPersonas.map((a) => ({
        name: `${a.slug}.md`,
        filePath: a.filePath,
      }));
    }

    if (personaFiles.length === 0) {
      return NextResponse.json({ error: 'No personas found for this purchase' }, { status: 404 });
    }

    const agentsDir = join(process.cwd(), 'data', 'agents');

    const readmeContent = `# ${packName}

## Installation

### Claude Code
\`\`\`bash
cp *.md ~/.claude/agents/
\`\`\`

### OpenCode
\`\`\`bash
cp *.md ~/.config/opencode/agents/
\`\`\`

## Personas Included

${personaFiles.map((a) => `- ${a.name}`).join('\n')}
`;

    archive.append(readmeContent, { name: 'README.md' });

    for (const persona of personaFiles) {
      const fullPath = join(agentsDir, persona.filePath);
      try {
        const content = readFileSync(fullPath, 'utf-8');
        archive.append(content, { name: persona.name });
      } catch (err) {
        console.error(`Failed to read persona file: ${persona.filePath}`, err);
      }
    }
  }

  await archive.finalize();

  const zipBuffer = Buffer.concat(chunks);
  const filename = `${packName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': zipBuffer.length.toString(),
    },
  });
}

function addDirectoryToArchive(
  archive: any,
  basePath: string,
  dataPath: string,
  prefix: string
) {
  const entries = readdirSync(basePath);
  for (const entry of entries) {
    const fullPath = join(basePath, entry);
    const entryName = prefix ? `${prefix}/${entry}` : entry;
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      addDirectoryToArchive(archive, fullPath, dataPath, entryName);
    } else {
      try {
        const content = readFileSync(fullPath);
        archive.append(content, { name: entryName });
      } catch (err) {
        console.error(`Failed to read file: ${fullPath}`, err);
      }
    }
  }
}
