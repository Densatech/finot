import type { ReactNode } from "react";

interface PublicHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
}

/** Full-width navy band that opens every public page, matching the homepage hero. */
export default function PublicHero({ title, subtitle, eyebrow, children }: PublicHeroProps) {
  return (
    <section className="bg-primary">
      <div className="container mx-auto px-4 py-12 text-center sm:py-16">
        {eyebrow && (
          <p className="mb-4 inline-block rounded-full border border-white/20 px-4 py-1.5 text-sm font-medium text-white/85">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">{title}</h1>
        <span className="mx-auto mt-4 block h-1 w-14 rounded-full bg-accent" aria-hidden="true" />
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">{subtitle}</p>}
        {children && <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{children}</div>}
      </div>
    </section>
  );
}
