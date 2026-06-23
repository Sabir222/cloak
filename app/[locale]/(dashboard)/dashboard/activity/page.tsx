import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  type LucideIcon
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle
};

type TranslationFunc = (key: string, values?: Record<string, string | number | Date>) => string;

function getRelativeTime(date: Date, t: TranslationFunc) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return t('justNow');
  if (diffInSeconds < 3600)
    return t('minutesAgo', { count: Math.floor(diffInSeconds / 60) });
  if (diffInSeconds < 86400)
    return t('hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
  if (diffInSeconds < 604800)
    return t('daysAgo', { count: Math.floor(diffInSeconds / 86400) });
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType, t: TranslationFunc): string {
  const key = `actions.${action}`;
  const known = [
    'actions.SIGN_UP',
    'actions.SIGN_IN',
    'actions.SIGN_OUT',
    'actions.UPDATE_PASSWORD',
    'actions.DELETE_ACCOUNT',
    'actions.UPDATE_ACCOUNT',
    'actions.CREATE_TEAM',
    'actions.REMOVE_TEAM_MEMBER',
    'actions.INVITE_TEAM_MEMBER',
    'actions.ACCEPT_INVITATION'
  ];
  if (known.includes(key)) return t(key);
  return t('actions.UNKNOWN');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return {
    title: t('activity.title'),
    description: t('activity.description'),
  };
}

export default async function ActivityPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'activity' });
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        {t('activityLog')}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = iconMap[log.action as ActivityType] || Settings;
                const formattedAction = formatAction(
                  log.action as ActivityType,
                  t
                );

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                        {log.ipAddress &&
                          ` ${t('fromIp', { ip: log.ipAddress })}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp), t)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('noActivityTitle')}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {t('noActivityDescription')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
