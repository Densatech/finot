import { useEffect, useRef, useState, type ReactNode } from "react";
import { LazyMotion, MotionConfig, animate, domAnimation, m, useInView, type Variants } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * App-wide motion setup: the lightweight `domAnimation` feature bundle and
 * automatic reduced motion for users who ask for it in their OS settings.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: EASE }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/** Fade + rise in when mounted (or when scrolled into view with `inView`). */
export function FadeIn({
  children,
  className,
  delay = 0,
  inView = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
}) {
  const trigger = inView
    ? { whileInView: "visible" as const, viewport: { once: true, margin: "-60px" } }
    : { animate: "visible" as const };
  return (
    <m.div className={className} variants={fadeUp} initial="hidden" transition={{ delay }} {...trigger}>
      {children}
    </m.div>
  );
}

/** Staggers the entrance of its <StaggerItem> children. */
export function Stagger({
  children,
  className,
  as = "div",
  inView = false,
  gap = 0.05,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
  inView?: boolean;
  gap?: number;
}) {
  const Comp = m[as];
  const trigger = inView
    ? { whileInView: "visible" as const, viewport: { once: true, margin: "-40px" } }
    : { animate: "visible" as const };
  return (
    <Comp
      className={className}
      initial="hidden"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }}
      {...trigger}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = m[as];
  return (
    <Comp className={className} variants={fadeUp}>
      {children}
    </Comp>
  );
}

/** Route outlet that fades each new page in (no exit delay, so navigation stays instant). */
export function AnimatedOutlet() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  return (
    <m.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }}>
      {outlet}
    </m.div>
  );
}

/** Counts up to a number the first time it scrolls into view. Non-numbers render as-is. */
export function CountUp({ value, suffix = "", decimals = 0 }: { value: number | string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const target = typeof value === "number" ? value : Number.NaN;
  const [display, setDisplay] = useState(Number.isFinite(target) ? 0 : value);

  useEffect(() => {
    if (!inView || !Number.isFinite(target)) {
      if (!Number.isFinite(target)) setDisplay(value);
      return;
    }
    const controls = animate(0, target, {
      duration: 0.9,
      ease: EASE,
      onUpdate: (v) => setDisplay(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, target, value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export { m };
