import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { EventRow } from "@/components/EventCard";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/locales";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";
import type { Event } from "@/payload-types";

const EVENTS_PER_AREA = 2;

export default async function WorkAreasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  const payload = await getPayloadClient();
  const areas = await payload.find({
    collection: "work-areas",
    locale,
    depth: 1,
    limit: 100,
    sort: "order",
  });

  const areaIds = areas.docs.map((area) => area.id);

  // One query for every area's events, grouped below — rather than a query per
  // card, which would grow linearly as work areas are added.
  const events = areaIds.length
    ? await payload.find({
        collection: "events",
        locale,
        depth: 0,
        limit: 500,
        sort: "-date",
        where: { workArea: { in: areaIds } },
      })
    : { docs: [] as Event[] };

  const eventsByArea = new Map<number | string, Event[]>();
  for (const event of events.docs) {
    const key =
      typeof event.workArea === "object" ? event.workArea.id : event.workArea;
    const bucket = eventsByArea.get(key) ?? [];
    if (bucket.length < EVENTS_PER_AREA) {
      bucket.push(event);
      eventsByArea.set(key, bucket);
    }
  }

  return (
    <Container className="py-12">
      <h1 className="mb-10 text-4xl uppercase sm:text-5xl">
        {t.nav_workAreas}
      </h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {areas.docs.map((area) => {
          const image = mediaUrl(area.image, "card");
          const areaEvents = eventsByArea.get(area.id) ?? [];

          return (
            <section
              key={area.id}
              className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
            >
              {image ? (
                <div className="relative aspect-[3/2] bg-line">
                  <Image
                    src={image}
                    alt={mediaAlt(area.image, area.title)}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col gap-3 p-6">
                <h2 className="text-2xl uppercase leading-tight">
                  <Link
                    href={`/${locale}/work-areas/${area.slug}`}
                    className="hover:text-blue"
                  >
                    {area.title}
                  </Link>
                </h2>
                {area.description ? (
                  <p className="text-sm text-ink-muted">{area.description}</p>
                ) : null}

                <div className="mt-auto pt-4">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-muted">
                    {t.latestEvents}
                  </h3>
                  {areaEvents.length > 0 ? (
                    <ul className="space-y-2">
                      {areaEvents.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          locale={locale}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-muted">{t.noEvents}</p>
                  )}

                  <Link
                    href={`/${locale}/work-areas/${area.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-blue hover:underline"
                  >
                    {t.viewWorkArea} →
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
