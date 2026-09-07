import { notFound } from 'next/navigation'

import { Container } from '../../../../components/Container'
import { ProjectCard } from '../../../../components/ProjectCard'
import { SectionHeading } from '../../../../components/SectionHeading'
import { getDictionary } from '../../../../lib/dictionary'
import { isLocale } from '../../../../lib/locales'
import { getPayloadClient } from '../../../../lib/payload'

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const t = getDictionary(locale)

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    locale,
    depth: 1,
    limit: 200,
    sort: ['-featured', '-startDate'],
  })

  const active = docs.filter((project) => project.status === 'active')
  const completed = docs.filter((project) => project.status === 'completed')

  return (
    <Container className="py-12">
      <h1 className="mb-10 text-4xl uppercase sm:text-5xl">{t.nav_projects}</h1>

      {docs.length === 0 ? <p className="text-ink-muted">{t.noProjects}</p> : null}

      {active.length > 0 ? (
        <section className="mb-16">
          <SectionHeading>{t.activeProjects}</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((project) => (
              <ProjectCard key={project.id} project={project} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <section>
          <SectionHeading>{t.completedProjects}</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((project) => (
              <ProjectCard key={project.id} project={project} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  )
}
