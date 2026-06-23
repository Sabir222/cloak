'use client';

import { Link } from '@/i18n/navigation';
import { useUser } from '@/hooks/use-user';

type AuthLinkProps = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href?: string;
};

export function AuthLink({ href, ...props }: AuthLinkProps) {
  const { user, isLoading } = useUser();
  return (
    <Link
      {...props}
      href={user && !isLoading ? '/dashboard' : (href ?? '/sign-up')}
    />
  );
}
