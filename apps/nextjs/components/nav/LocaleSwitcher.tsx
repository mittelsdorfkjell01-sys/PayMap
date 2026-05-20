'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(nextLocale: string) {
    if (nextLocale === locale) return;

    // Replace the current locale prefix in the pathname
    const segments = pathname.split('/');
    // segments[0] is '', segments[1] is the locale
    segments[1] = nextLocale;
    const newPath = segments.join('/') || '/';

    startTransition(() => {
      router.push(newPath);
    });
  }

  return (
    <div className="flex items-center rounded-md border border-gray-200 overflow-hidden text-sm">
      {(['de', 'en'] as const).map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={isPending}
          className={cn(
            'px-2.5 py-1 font-medium uppercase transition-colors',
            locale === loc
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
