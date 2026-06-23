'use client';

import Image from 'next/image';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

const TOOLS = [
  { name: 'Claude Code', domain: 'anthropic.com' },
  { name: 'Cursor', domain: 'cursor.com' },
  { name: 'Windsurf', domain: 'codeium.com' },
  { name: 'OpenCode', domain: 'opencode.ai' },
  { name: 'VS Code', domain: 'code.visualstudio.com' },
  { name: 'Kilo Code', domain: 'kilocode.ai' },
  { name: 'OpenClaw', domain: 'openclaw.ai' },
  { name: 'Hermes', domain: 'hermes.dev' },
  { name: 'Gemini CLI', domain: 'gemini.google.com' },
  { name: 'GitHub Copilot', domain: 'github.com' },
  { name: 'Codex', domain: 'openai.com' },
];

function LogoItem({ name, domain }: { name: string; domain: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 rounded-xl hover:bg-muted/50 transition-colors shrink-0">
      <Image
        src={`https://img.logo.dev/${domain}?token=pk_euSmmEzBSfCQ-Ji0YuzmaQ`}
        alt={`${name} logo`}
        width={32}
        height={32}
        className="size-8 rounded object-contain"
      />
      <span className="text-sm font-semibold text-gray-400 whitespace-nowrap">{name}</span>
    </div>
  );
}

export function ToolLogos() {
  return (
    <InfiniteSlider speed={50} speedOnHover={10} gap={24} className="w-full">
      {TOOLS.map(({ name, domain }) => (
        <LogoItem key={name} name={name} domain={domain} />
      ))}
    </InfiniteSlider>
  );
}