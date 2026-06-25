'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import Image from 'next/image';

import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { RoughButton } from '@/components/ui/rough-button';
import { signIn, signUp } from './actions';
import { ActionState } from '@/lib/auth/middleware';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  return (
    <div className="min-h-[100dvh] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src={mode === 'signin' ? '/square.svg' : '/triangle.svg'}
              alt=""
              width={48}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'signin' ? t('signInTitle') : t('signUpTitle')}
          </h2>
        </div>

        <div className="mt-8">
          <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={state.email}
                  required
                  maxLength={50}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  defaultValue={state.password}
                  required
                  minLength={8}
                  maxLength={100}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
            </div>

            {state?.error && (
              <div className="text-red-500 text-sm">{state.error}</div>
            )}

            <div>
              <RoughButton type="submit" disabled={pending} fill="#fff7ed" className="w-full">
                {pending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    {t('loading')}
                  </>
                ) : mode === 'signin' ? (
                  t('signInButton')
                ) : (
                  t('signUpButton')
                )}
              </RoughButton>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  {mode === 'signin' ? t('newToPlatform') : t('alreadyHaveAccount')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <RoughButton
                href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${redirect ? `?redirect=${redirect}` : ''}${priceId ? `&priceId=${priceId}` : ''}`}
                className="w-full"
              >
                {mode === 'signin' ? t('createAccount') : t('signInExisting')}
              </RoughButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
