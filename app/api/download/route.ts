import { NextRequest, NextResponse } from 'next/server';
import * as archiverLib from 'archiver';
import { getPurchaseByToken, getPackById } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { agents, packAgents, packs } from '@/lib/db/schema';
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

  const chunks: Buffer[] = [];
  const writableStream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  const archive = (archiverLib as any)('zip', { zlib: { level: 9 } });
  archive.pipe(writableStream);

  let packName = 'Custom Agent Pack';
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
# Install as a plugin
claude --plugin-dir /path/to/${pack.slug}

# Or copy skills manually
cp -r skills/* ~/.claude/skills/
cp -r agents/* ~/.claude/agents/
cp -r .claude/commands/* ~/.claude/commands/
\`\`\`

### Cursor
\`\`\`bash
# Copy SKILL.md files into Cursor rules
cp skills/*/SKILL.md ~/.cursor/rules/
\`\`\`

### Antigravity CLI
\`\`\`bash
agy plugin install /path/to/${pack.slug}
\`\`\`

### Gemini CLI
\`\`\`bash
gemini skills install ./skills/
\`\`\`

### OpenCode / Other Tools
Skills are plain Markdown — they work with any agent that accepts instruction files.
Copy the SKILL.md files into your tool's rules/skills directory.

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
    let agentFiles: { name: string; filePath: string }[] = [];

    if (purchase.type === 'pack' && purchase.packId) {
      const packAgentRows = await db
        .select({ slug: agents.slug, name: agents.name, filePath: agents.filePath })
        .from(packAgents)
        .innerJoin(agents, eq(packAgents.agentId, agents.id))
        .where(eq(packAgents.packId, purchase.packId));

      agentFiles = packAgentRows.map((a) => ({
        name: `${a.slug}.md`,
        filePath: a.filePath,
      }));
    } else if (purchase.type === 'custom' && purchase.agentIds) {
      const ids = purchase.agentIds as number[];
      const customAgents = await db
        .select({ slug: agents.slug, name: agents.name, filePath: agents.filePath })
        .from(agents)
        .where(inArray(agents.id, ids));

      agentFiles = customAgents.map((a) => ({
        name: `${a.slug}.md`,
        filePath: a.filePath,
      }));
    }

    if (agentFiles.length === 0) {
      return NextResponse.json({ error: 'No agents found for this purchase' }, { status: 404 });
    }

    const agentsDir = join(process.cwd(), 'data', 'agents');

    const readmeContent = `# ${packName}

## Installation

### Claude Code
\`\`\`bash
cp *.md ~/.claude/agents/
\`\`\`

### Cursor
\`\`\`bash
cp *.md ~/.cursor/rules/
\`\`\`

### OpenCode / Other Tools
\`\`\`bash
cp *.md ~/.config/opencode/agents/
\`\`\`

## Agents Included

${agentFiles.map((a) => `- ${a.name}`).join('\n')}
`;

    archive.append(readmeContent, { name: 'README.md' });

    for (const agent of agentFiles) {
      const fullPath = join(agentsDir, agent.filePath);
      try {
        const content = readFileSync(fullPath, 'utf-8');
        archive.append(content, { name: agent.name });
      } catch (err) {
        console.error(`Failed to read agent file: ${agent.filePath}`, err);
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
