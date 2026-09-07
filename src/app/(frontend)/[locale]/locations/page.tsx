import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Container } from '../../../../components/Container'
import { getDictionary } from '../../../../lib/dictionary'
import { isLocale } from '../../../../lib/locales'
import { asMediaList } from '../../../../lib/media'
import { getPayloadClient } from '../../../../lib/payload'

export default async function LocationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const t = getDictionary(locale)

  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'locations', locale, depth: 1, limit: 50 })

  return (
    <Container className="py-12">
      <h1 className="mb-10 text-4xl uppercase sm:text-5xl">{t.nav_locations}</h1>

      <div className="space-y-12">
        {docs.map((location) => {
          const photos = asMediaList(location.photos)

          return (
            <section key={location.id} className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl uppercase">{location.name}</h2>
                {location.description ? (
                  <p className="mt-3 text-ink-muted">{location.description}</p>
                ) : null}

                <dl className="mt-6 space-y-4 text-sm">
                  {location.address ? (
                    <div>
                      <dt className="font-bold uppercase tracking-wider text-ink-muted">
                        {t.address}
                      </dt>
                      <dd className="mt-1">{location.address}</dd>
                    </div>
                  ) : null}
                  {location.openingHours ? (
                    <div>
                      <dt className="font-bold uppercase tracking-wider text-ink-muted">
                        {t.openingHours}
                      </dt>
                      <dd className="mt-1 whitespace-pre-line">{location.openingHours}</dd>
                    </div>
                  ) : null}
                  {location.phone ? (
                    <div>
                      <dt className="font-bold uppercase tracking-wider text-ink-muted">
                        {t.phone}
                      </dt>
                      <dd className="mt-1">
                        <a href={`tel:${location.phone}`} className="text-blue hover:underline">
                          {location.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {location.mapUrl ? (
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-6 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-bold uppercase text-ink"
                  >
                    {t.openInMaps}
                  </a>
                ) : null}
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-line"
                    >
                      <Image
                        src={photo.sizes?.card?.url ?? photo.url ?? ''}
                        alt={photo.alt ?? ''}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </Container>
  )
}
