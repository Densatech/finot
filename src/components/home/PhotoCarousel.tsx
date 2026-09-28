import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion";

const PHOTOS = [
  { src: "/images/service-groups/group1.webp", alt: "Fellowship group" },
  { src: "/images/service-groups/group2.webp", alt: "Fellowship group" },
  { src: "/images/service-groups/group3.webp", alt: "Fellowship group" },
  { src: "/images/service-groups/group4.webp", alt: "Fellowship group" },
  { src: "/images/service-groups/group5.webp", alt: "Fellowship group" },
  { src: "/images/service-groups/t1.webp", alt: "Teaching session" },
  { src: "/images/service-groups/t2.webp", alt: "Teaching session" },
  { src: "/images/service-groups/m1.webp", alt: "Ministry work" },
  { src: "/images/service-groups/m2.webp", alt: "Ministry work" },
  { src: "/images/service-groups/l1.webp", alt: "Liturgy" },
];

function Row({ photos, reverse, size }: { photos: typeof PHOTOS; reverse?: boolean; size: string }) {
  // Content is duplicated so the CSS marquee loops seamlessly; the copy is hidden from screen readers.
  return (
    <div className="group relative overflow-hidden">
      <div className={`flex w-max gap-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"} group-hover:[animation-play-state:paused]`}>
        {[...photos, ...photos].map((photo, i) => (
          <div key={`${photo.src}-${i}`} className={`flex-shrink-0 overflow-hidden rounded-2xl bg-muted shadow-soft ${size}`} aria-hidden={i >= photos.length}>
            <img
              src={photo.src}
              alt={i >= photos.length ? "" : photo.alt}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two gently scrolling photo rows (pause on hover; stop for reduced motion). */
export default function PhotoCarousel() {
  const { t } = useTranslation();
  return (
    <section className="overflow-hidden bg-background py-16">
      <FadeIn inView className="container mx-auto mb-8 px-4 text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-accent-foreground/80">{t("our_students")}</span>
        <h2 className="mb-2 mt-2 text-3xl font-bold text-foreground sm:text-4xl">
          {t("finot_community_prefix")} <span className="text-primary">{t("finot_community_suffix")}</span>
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground">{t("community_moments")}</p>
      </FadeIn>
      <div className="space-y-4">
        <Row photos={PHOTOS} size="h-52 w-72 md:h-64 md:w-96" />
        <Row photos={[...PHOTOS].reverse()} reverse size="h-40 w-56 md:h-48 md:w-72" />
      </div>
    </section>
  );
}
