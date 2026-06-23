import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, Terminal, Users, Zap, BookOpen, Shield, Rocket } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { getPackBySlug } from '@/lib/db/queries';
import { BuyButton } from './buy-button';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

const SKILL_PACK_CONTENT = {
  skills: [
    'spec-driven-development', 'idea-refine', 'interview-me',
    'planning-and-task-breakdown', 'incremental-implementation',
    'test-driven-development', 'context-engineering',
    'source-driven-development', 'doubt-driven-development',
    'frontend-ui-engineering', 'api-and-interface-design',
    'browser-testing-with-devtools', 'debugging-and-error-recovery',
    'code-review-and-quality', 'code-simplification',
    'security-and-hardening', 'performance-optimization',
    'git-workflow-and-versioning', 'ci-cd-and-automation',
    'deprecation-and-migration', 'documentation-and-adrs',
    'observability-and-instrumentation', 'shipping-and-launch',
    'using-agent-skills',
  ],
  personas: [
    { name: 'Code Reviewer', role: 'Senior Staff Engineer', desc: 'Five-axis code review with "would a staff engineer approve this?" standard' },
    { name: 'Test Engineer', role: 'QA Specialist', desc: 'Test strategy, coverage analysis, and the Prove-It pattern' },
    { name: 'Security Auditor', role: 'Security Engineer', desc: 'Vulnerability detection, threat modeling, OWASP assessment' },
    { name: 'Web Performance Auditor', role: 'Web Performance Engineer', desc: 'Core Web Vitals audit with Quick/Deep modes' },
  ],
  commands: ['/spec', '/plan', '/build', '/test', '/review', '/webperf', '/code-simplify', '/ship'],
  references: ['testing-patterns', 'security-checklist', 'performance-checklist', 'accessibility-checklist', 'observability-checklist', 'orchestration-patterns'],
};

export default async function PackDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'packs' });
  const pack = await getPackBySlug(slug);

  if (!pack) {
    notFound();
  }

  const isSkillPack = pack.bundleType === 'skill-pack';
  const perAgent =
    !isSkillPack && pack.agents.length > 0
      ? Math.round(pack.priceCents / 100 / pack.agents.length)
      : null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/packs"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backToPacks')}
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm mb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="sm:max-w-xl">
            {isSkillPack && (
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium mb-3">
                {t('skillPack')}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{pack.name}</h1>
            <p className="mt-2 text-gray-500">{pack.description}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-sm text-gray-500">{t('price')}</span>
            <span className="text-3xl font-semibold text-gray-900">
              ${pack.priceCents / 100}
            </span>
            {perAgent !== null && (
              <span className="mt-1 text-xs text-gray-500">
                ≈ ${perAgent} {t('perAgent')}
              </span>
            )}
            <div className="mt-4">
              <BuyButton
                packId={pack.id}
                label={t('buyPack')}
                loadingLabel={t('loading')}
              />
            </div>
          </div>
        </div>
      </div>

      {isSkillPack ? (
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('skillsIncluded')}
              </h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {SKILL_PACK_CONTENT.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <Check className="size-4 text-orange-500 flex-shrink-0" />
                  <code className="text-sm text-gray-700">{skill}</code>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('personasIncluded')}
              </h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4">
              {SKILL_PACK_CONTENT.personas.map((persona) => (
                <li
                  key={persona.name}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <h3 className="font-medium text-gray-900">{persona.name}</h3>
                  <p className="text-xs text-orange-600 font-medium mt-0.5">{persona.role}</p>
                  <p className="mt-2 text-sm text-gray-500">{persona.desc}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('commandsIncluded')}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILL_PACK_CONTENT.commands.map((cmd) => (
                <span
                  key={cmd}
                  className="inline-flex items-center rounded-lg bg-gray-900 text-gray-100 px-3 py-1.5 text-sm font-mono"
                >
                  {cmd}
                </span>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('referencesIncluded')}
              </h2>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {SKILL_PACK_CONTENT.references.map((ref) => (
                <li
                  key={ref}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <Check className="size-4 text-orange-500 flex-shrink-0" />
                  <code className="text-sm text-gray-700">{ref}</code>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('agentsIncluded')}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {pack.agents.map((agent) => (
              <li
                key={agent.id}
                className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-white p-4"
              >
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                      {agent.division}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{agent.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
