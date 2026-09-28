import type { ReactNode } from "react";
import { fadeUp, m } from "@/components/motion";

interface PublicHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/** Light page header for public pages (Contact, Donate, Q&A…), with a soft entrance. */
export default function PublicHero({ title, subtitle, eyebrow, children }: PublicHeroProps) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-primary/[0.06] to-background">
      <m.div initial="hidden" animate="visible" variants={stagger} className="container mx-auto px-4 py-12 text-center sm:py-16">
        {eyebrow && (
          <m.p variants={fadeUp} className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-foreground/80">
            {eyebrow}
          </m.p>
        )}
        <m.h1 variants={fadeUp} className="text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
          {title}
        </m.h1>
        <m.span variants={fadeUp} className="mx-auto mt-4 block h-1 w-14 rounded-full bg-accent" aria-hidden="true" />
        {subtitle && (
          <m.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {subtitle}
          </m.p>
        )}
        {children && (
          <m.div variants={fadeUp} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {children}
          </m.div>
        )}
      </m.div>
    </section>
  );
}
