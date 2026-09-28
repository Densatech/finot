import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { SITE } from "@/config/site";
import PublicHero from "@/components/navigation/PublicHero";
import { TextAreaField, TextField } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

/** Contact form opens the visitor's email app with the message pre-filled (no backend needed). */
export default function ContactPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError(t("required_field", "This field is required."));
      return;
    }
    setError(null);
    const body = `${message.trim()}\n\n— ${name.trim()}`;
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject.trim() || `Message from ${name.trim()}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const details = [
    { icon: EnvelopeIcon, label: t("email_us", "Email us"), value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: PhoneIcon, label: t("call_us", "Call us"), value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
    { icon: MapPinIcon, label: t("our_location", "Our location"), value: SITE.location },
  ];

  return (
    <div className="bg-background">
      <PublicHero title={t("contact_us", "Contact us")} subtitle={t("contact_desc")} />
      <div className="mx-auto max-w-5xl px-4 py-12">

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {details.map((d) => (
              <div key={d.label} className="card flex items-center gap-4 p-5">
                <span className="rounded-xl bg-primary/10 p-3">
                  <d.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{d.label}</p>
                  {d.href ? (
                    <a href={d.href} className="font-semibold text-foreground hover:text-primary">
                      {d.value}
                    </a>
                  ) : (
                    <p className="font-semibold text-foreground">{d.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card space-y-4 lg:col-span-3" noValidate>
            <h2 className="section-title mb-3">{t("send_message", "Send a message")}</h2>
            <TextField label={t("your_name", "Your name")} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <TextField label={t("subject", "Subject")} value={subject} onChange={(e) => setSubject(e.target.value)} />
            <TextAreaField
              label={t("your_message", "Your message")}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              error={error ?? undefined}
            />
            <Button type="submit" className="w-full sm:w-auto">
              <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
              {t("send_message", "Send a message")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t("contact_mailto_note", "This opens your email app with the message ready to send.")}
            </p>
          </form>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <iframe
            title={t("our_location", "Our location")}
            src={SITE.mapEmbedUrl}
            className="h-72 w-full border-0 md:h-96"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
