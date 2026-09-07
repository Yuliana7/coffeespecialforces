import { notFound } from 'next/navigation'

import { Container } from '../../../../components/Container'
import { EventCard } from '../../../../components/EventCard'
import { SectionHeading } from '../../../../components/SectionHeading'
import { getDictionary } from '../../../../lib/dictionary'
import { isLocale } from '../../../../lib/locales'
import { getPayloadClient } from '../../../../lib/payload'

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const t = getDictionary(locale)

  const payload = await getPayloadClient()

  // "Upcoming" is relative to the request; the route is force-dynamic, so this
  // is evaluated once per request.
  const now = new Date().toISOString()

  // Let the database do the split, so neither list is capped by the other.
  const [upcoming, past] = await Promise.all([
    payload.find({
      collection: 'events',
      locale,
      depth: 1,
      limit: 200,
      sort: 'date',
      where: { date: { greater_than_equal: now } },
    }),
    payload.find({
      collection: 'events',
      locale,
      depth: 1,
      limit: 200,
      sort: '-date',
      where: { date: { less_than: now } },
    }),
  ])

  const total = upcoming.totalDocs + past.totalDocs

  return (
    <Container className="py-12">
      <h1 className="mb-10 text-4xl uppercase sm:text-5xl">{t.nav_events}</h1>

      {total === 0 ? <p className="text-ink-muted">{t.noEvents}</p> : null}

      {upcoming.docs.length > 0 ? (
        <section className="mb-16">
          <SectionHeading>{t.upcomingEvents}</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.docs.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      {past.docs.length > 0 ? (
        <section>
          <SectionHeading>{t.pastEvents}</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.docs.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  )
}
