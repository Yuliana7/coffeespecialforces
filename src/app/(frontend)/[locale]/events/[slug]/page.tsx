import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { RichText } from "@/components/RichText";
import { getDictionary } from "@/lib/dictionary";
import { formatDateTime } from "@/lib/format";
import { isLocale } from "@/lib/locales";
import { asMediaList, mediaAlt, mediaUrl } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";

type Params = { params: Promise<{ locale: string; slug: string }> };

const findEvent = async (locale: "uk" | "en", slug: string) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "events",
    locale,
    depth: 2,
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
  const event = await findEvent(locale, slug);
  return event
    ? { title: event.title, description: event.summary ?? undefined }
    : {};
};

export default async function EventPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  const event = await findEvent(locale, slug);
  if (!event) notFound();

  const cover = mediaUrl(event.coverImage, "hero");
  const gallery = asMediaList(event.gallery);
  const workArea = typeof event.workArea === "object" ? event.workArea : null;
  const location = typeof event.location === "object" ? event.location : null;

  return (
    <article className="py-12">
      <Container>
        {workArea ? (
          <Link
            href={`/${locale}/work-areas/${workArea.slug}`}
            className="text-sm font-semibold text-blue hover:underline"
          >
            ← {workArea.title}
          </Link>
        ) : null}

        <time
          dateTime={event.date}
          className="mt-4 block text-sm font-bold uppercase tracking-wide text-blue"
        >
          {formatDateTime(event.date, locale)}
        </time>
        <h1 className="mt-2 max-w-4xl text-4xl uppercase leading-tight sm:text-5xl">
          {event.title}
        </h1>
        {location ? (
          <p className="mt-3 text-sm text-ink-muted">
            {location.name}
            {location.address ? ` — ${location.address}` : ""}
          </p>
        ) : null}
        {event.summary ? (
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            {event.summary}
          </p>
        ) : null}
      </Container>

      {cover ? (
        <Container className="mt-8">
          <div className="relative aspect-[16/7] overflow-hidden rounded-lg bg-line">
            <Image
              src={cover}
              alt={mediaAlt(event.coverImage, event.title)}
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      <Container className="mt-10">
        <RichText data={event.content} locale={locale} />

        {gallery.length > 0 ? (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl uppercase">{t.gallery}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg bg-line"
                >
                  <Image
                    src={image.sizes?.card?.url ?? image.url ?? ""}
                    alt={image.alt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
