import { useTranslation } from "react-i18next";

const photos = [
  { src: "/images/service-groups/group1.webp", alt: "Fellowship gathering" },
  { src: "/images/service-groups/t1.webp", alt: "Teaching session" },
  { src: "/images/service-groups/m1.webp", alt: "Ministry work" },
  { src: "/images/service-groups/group3.webp", alt: "Fellowship members" },
  { src: "/images/service-groups/l1.webp", alt: "Liturgy" },
  { src: "/images/service-groups/group5.webp", alt: "Fellowship event" },
];

/** Static, lazily loaded photo grid (replaces the endlessly scrolling carousel). */
export default function PhotoGallery() {
  const { t } = useTranslation();
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary/70">{t("our_students")}</span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {t("finot_community_prefix")} <span className="text-primary">{t("finot_community_suffix")}</span>
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">{t("community_moments")}</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {photos.map((photo) => (
            <li key={photo.src} className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
