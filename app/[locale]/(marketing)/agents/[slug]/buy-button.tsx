'use client';

import { useTransition } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { buyAgentProduct } from '@/app/[locale]/(marketing)/actions';

export function BuyButton({
  slug,
  label,
  loadingLabel
}: {
  slug: string;
  label: string;
  loadingLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={isPending}
      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
      onClick={() => {
        startTransition(async () => {
          await buyAgentProduct(slug);
        });
      }}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <ShoppingBag className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
