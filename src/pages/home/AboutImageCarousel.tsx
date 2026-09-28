import { useEffect, useRef, useState } from "react";
import { AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { m } from "@/components/motion";

const IMAGES = [
  { src: "/images/gibi1.webp", alt: "Gibi Gubae gathering" },
  { src: "/images/gibi2.webp", alt: "Fellowship members" },
  { src: "/images/gibi3.webp", alt: "Worship service" },
  { src: "/images/gibi4.webp", alt: "Community event" },
];

const INTERVAL_MS = 5200;

/** Auto-advancing photo slider; pauses when hovered, off-screen, or when reduced motion is requested. */
export default function AboutImageCarousel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || hovered || reduceMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % IMAGES.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [inView, hovered, reduceMotion]);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted shadow-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence initial={false}>
        <m.img
          key={IMAGES[index].src}
          src={IMAGES[index].src}
          alt={IMAGES[index].alt}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          decoding="async"
        />
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
        {IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-accent" : "w-2 bg-white/70 hover:bg-white"}`}
          />
        ))}
      </div>
    </div>
  );
}
