'use client';

import { useEffect, useRef, useId, type ReactNode } from 'react';

let openDialogs = 0;
let originalOverflow = '';

/** A native modal keeps focus, Escape handling, and background inertness together. */
export default function Dialog({ children, onClose, label, className = '' }: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  className?: string;
}) {
  const headingId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const element = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (openDialogs === 0) originalOverflow = document.body.style.overflow;
    openDialogs += 1;
    const heading = element?.querySelector('h1, h2, h3, h4');
    if (heading) {
      if (!heading.id) heading.id = headingId;
      element?.setAttribute('aria-labelledby', heading.id);
    }
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      openDialogs -= 1;
      if (openDialogs === 0) document.body.style.overflow = originalOverflow;
      previousFocus?.focus();
    };
  }, [headingId]);
  return (
    <dialog ref={ref} aria-label={label} className={`app-dialog ${className}`}
      onKeyDown={(event) => {
        if (event.key !== 'Tab' || (event.target as HTMLElement).closest('dialog') !== event.currentTarget) return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled):not([type=hidden]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) { event.preventDefault(); event.currentTarget.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}
      onCancel={(event) => { event.preventDefault(); closeRef.current(); }}
      onClick={(event) => { if (event.target === event.currentTarget) closeRef.current(); }}>
      {children}
    </dialog>
  );
}
