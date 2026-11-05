import { Printer } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-2 px-4 py-10 dark:bg-neutral-950">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg shadow-navy/5 sm:p-8">
        <div className="mb-7 text-center">
          <Link
            href="/"
            className="mx-auto mb-6 flex w-fit items-center gap-2 text-primary"
            aria-label="NF Printers home"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-white">
              <Printer className="size-6" />
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              NF Printers
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {children}

        {footer && (
          <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </section>
    </main>
  );
}
