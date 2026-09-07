import Image from 'next/image'
import Link from 'next/link'

import { getDictionary } from '../lib/dictionary'
import type { Locale } from '../lib/locales'
import { mediaAlt, mediaUrl } from '../lib/media'
import type { Project } from '../payload-types'
import { ProgressBar } from './ProgressBar'

export const ProjectCard = ({ project, locale }: { project: Project; locale: Locale }) => {
  const t = getDictionary(locale)
  const cover = mediaUrl(project.coverImage, 'card')
  const href = `/${locale}/projects/${project.slug}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-lg">
      {cover ? (
        <Link href={href} className="relative block aspect-[3/2] overflow-hidden bg-line">
          <Image
            src={cover}
            alt={mediaAlt(project.coverImage, project.title)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col items-start gap-3 p-5">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
            project.status === 'completed' ? 'bg-olive text-white' : 'bg-gold text-ink'
          }`}
        >
          {project.status === 'completed' ? t.completed : t.active}
        </span>
        <h3 className="text-xl leading-tight">
          <Link href={href} className="hover:text-blue">
            {project.title}
          </Link>
        </h3>
        {project.summary ? (
          <p className="line-clamp-3 text-sm text-ink-muted">{project.summary}</p>
        ) : null}

        <div className="mt-auto w-full pt-2">
          <ProgressBar
            raised={project.raisedAmount}
            goal={project.goalAmount}
            currency={project.currency}
            locale={locale}
          />
        </div>
      </div>
    </article>
  )
}
