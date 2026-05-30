'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * Modal / Bottom-Sheet (Spec §6/§8).
 * Desktop: zentriertes Modal (max-w 640), Surface + Hairline + shadow-float.
 * Mobile: Bottom-Sheet mit 4px Drag-Handle, Radius oben --r-xl.
 * Backdrop rgba(14,14,14,0.4) OHNE Blur. Fokus-Trap, ESC schließt,
 * Body-Scroll-Lock, Fokus-Rückgabe beim Schließen.
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** ARIA-Label, falls kein sichtbarer Titel */
  ariaLabel?: string;
  className?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, ariaLabel, className }: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const titleId = React.useId();

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Initialer Fokus in den Dialog
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      // Backdrop OHNE Blur (Spec §6/§9)
      style={{ backgroundColor: 'rgba(14,14,14,0.4)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={cn(
          'focus-ring w-full bg-surface shadow-float outline-none',
          // Mobile: Bottom-Sheet
          'rounded-t-xl border-t border-line',
          // Desktop: zentriertes Modal
          'sm:max-w-[640px] sm:rounded-xl sm:border',
          'max-h-[90vh] overflow-y-auto',
          'motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out',
          className
        )}
      >
        {/* Drag-Handle nur mobil */}
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <span className="h-1 w-9 rounded-full bg-line-strong" />
        </div>

        {title && (
          <div className="flex items-start justify-between gap-4 px-6 pt-4 pb-3">
            <h2 id={titleId} className="text-h2 text-text">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="focus-ring -mr-1 rounded-md p-1 text-text-3 transition-colors hover:text-text"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        <div className={cn('px-6 pb-6', !title && 'pt-4')}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
