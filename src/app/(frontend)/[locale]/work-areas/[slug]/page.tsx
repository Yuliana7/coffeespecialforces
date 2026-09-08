import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { EventCard } from "@/components/EventCard";
import { SectionHeading } from "@/components/SectionHeading";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/locales";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";

type Params = { params: Promise<{ locale: string; slug: string }> };

const findArea = async (locale: "uk" | "en", slug: string) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "work-areas",
    locale,
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  });
  return docs[0] ?? null;
};

export const generateMetadata = async ({
  params,
}: Params): Promise<Metadata> => {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const area = await findArea(locale, slug);
  return area
    ? { title: area.title, description: area.description ?? undefined }
    : {};
};

export default async function WorkAreaPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  const area = await findArea(locale, slug);
  if (!area) notFound();

  const payload = await getPayloadClient();
  const events = await payload.find({
    collection: "events",
    locale,
    depth: 1,
    limit: 200,
    sort: "-date",
    where: { workArea: { equals: area.id } },
  });

  const image = mediaUrl(area.image, "hero");

  return (
    <div className="py-12">
      <Container>
        <Link
          href={`/${locale}/work-areas`}
          className="text-sm font-semibold text-blue hover:underline"
        >
          ← {t.backToWorkAreas}
        </Link>
        <h1 className="mt-4 max-w-3xl text-4xl uppercase leading-tight sm:text-5xl">
          {area.title}
        </h1>
        {area.description ? (
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            {area.description}
          </p>
        ) : null}
      </Container>

      {image ? (
        <Container className="mt-8">
          <div className="relative aspect-[16/7] overflow-hidden rounded-lg bg-line">
            <Image
              src={image}
              alt={mediaAlt(area.image, area.title)}
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      <Container className="mt-12">
        <SectionHeading>{t.nav_events}</SectionHeading>
        {events.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.docs.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-ink-muted">{t.noEvents}</p>
        )}
      </Container>
    </div>
  );
}
