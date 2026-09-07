import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { EventRow } from "@/components/EventCard";
import { ProjectCard } from "@/components/ProjectCard";
import { RichText } from "@/components/RichText";
import { SectionHeading } from "@/components/SectionHeading";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/locales";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  const payload = await getPayloadClient();

  const [home, projects, workAreas, locations, latestEvents] =
    await Promise.all([
      payload.findGlobal({ slug: "home", locale, depth: 1 }),
      // Featured first, then the most recently started campaigns.
      payload.find({
        collection: "projects",
        locale,
        depth: 1,
        limit: 3,
        sort: ["-featured", "-startDate"],
      }),
      payload.find({
        collection: "work-areas",
        locale,
        depth: 1,
        limit: 4,
        sort: "order",
      }),
      payload.find({ collection: "locations", locale, depth: 1, limit: 2 }),
      payload.find({
        collection: "events",
        locale,
        depth: 0,
        limit: 4,
        sort: "-date",
      }),
    ]);

  const heroImage = mediaUrl(home.heroImage, "hero");
  const stats = home.stats ?? [];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-olive-deep text-white">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={mediaAlt(home.heroImage)}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10 object-cover opacity-40"
          />
        ) : null}
        <Container className="py-20 sm:py-28">
          <h1 className="max-w-3xl text-4xl uppercase leading-[1.05] sm:text-6xl">
            {home.heroHeading}
          </h1>
          {home.heroSubheading ? (
            <p className="mt-5 max-w-xl text-lg text-white/80">
              {home.heroSubheading}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/donate`}
              className="rounded-full bg-gold px-7 py-3 font-bold uppercase text-ink transition-transform hover:scale-105"
            >
              {t.donate}
            </Link>
            <Link
              href={`/${locale}/projects`}
              className="rounded-full border-2 border-white/40 px-7 py-3 font-bold uppercase transition-colors hover:border-white"
            >
              {t.allProjects}
            </Link>
          </div>

          {stats.length > 0 ? (
            <dl className="mt-14 grid gap-6 border-t border-white/20 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.id ?? stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-bold text-gold sm:text-4xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-sm text-white/70">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Container>
      </section>

      {home.aboutText ? (
        <Container className="py-16">
          {home.aboutHeading ? (
            <h2 className="mb-5 text-3xl uppercase sm:text-4xl">
              {home.aboutHeading}
            </h2>
          ) : null}
          <RichText data={home.aboutText} locale={locale} />
        </Container>
      ) : null}

      <Container className="py-8">
        <SectionHeading href={`/${locale}/projects`} linkLabel={t.allProjects}>
          {t.latestProjects}
        </SectionHeading>
        {projects.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.docs.map((project) => (
              <ProjectCard key={project.id} project={project} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-ink-muted">{t.noProjects}</p>
        )}
      </Container>

      {workAreas.docs.length > 0 ? (
        <Container className="py-16">
          <SectionHeading
            href={`/${locale}/work-areas`}
            linkLabel={t.nav_workAreas}
          >
            {t.nav_workAreas}
          </SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {workAreas.docs.map((area) => (
              <Link
                key={area.id}
                href={`/${locale}/work-areas/${area.slug}`}
                className="group rounded-lg border border-line bg-surface p-5 transition-colors hover:border-gold"
              >
                <h3 className="text-lg uppercase group-hover:text-blue">
                  {area.title}
                </h3>
                {area.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-ink-muted">
                    {area.description}
                  </p>
                ) : null}
              </Link>
            ))}
          </div>
        </Container>
      ) : null}

      {latestEvents.docs.length > 0 ? (
        <Container className="py-8">
          <SectionHeading href={`/${locale}/events`} linkLabel={t.nav_events}>
            {t.latestEvents}
          </SectionHeading>
          <ul className="grid gap-3 sm:grid-cols-2">
            {latestEvents.docs.map((event) => (
              <EventRow key={event.id} event={event} locale={locale} />
            ))}
          </ul>
        </Container>
      ) : null}

      {locations.docs.length > 0 ? (
        <Container className="py-16">
          <SectionHeading
            href={`/${locale}/locations`}
            linkLabel={t.nav_locations}
          >
            {t.nav_locations}
          </SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2">
            {locations.docs.map((location) => (
              <div
                key={location.id}
                className="rounded-lg border border-line bg-surface p-6"
              >
                <h3 className="text-xl uppercase">{location.name}</h3>
                {location.address ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    {location.address}
                  </p>
                ) : null}
                {location.openingHours ? (
                  <p className="mt-3 whitespace-pre-line text-sm">
                    {location.openingHours}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}
