import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/locales";
import { mediaAlt, mediaUrl } from "@/lib/media";
import type { Event } from "@/payload-types";

export const EventCard = ({
  event,
  locale,
}: {
  event: Event;
  locale: Locale;
}) => {
  const cover = mediaUrl(event.coverImage, "card");
  const href = `/${locale}/events/${event.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-shadow hover:shadow-lg">
      {cover ? (
        <Link
          href={href}
          className="relative block aspect-[3/2] overflow-hidden bg-line"
        >
          <Image
            src={cover}
            alt={mediaAlt(event.coverImage, event.title)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <time
          dateTime={event.date}
          className="text-xs font-bold uppercase tracking-wide text-blue"
        >
          {formatDate(event.date, locale)}
        </time>
        <h3 className="text-lg leading-tight">
          <Link href={href} className="hover:text-blue">
            {event.title}
          </Link>
        </h3>
        {event.summary ? (
          <p className="line-clamp-2 text-sm text-ink-muted">{event.summary}</p>
        ) : null}
      </div>
    </article>
  );
};

/** Compact one-line variant used to list an area's latest events. */
export const EventRow = ({
  event,
  locale,
}: {
  event: Event;
  locale: Locale;
}) => (
  <li>
    <Link
      href={`/${locale}/events/${event.slug}`}
      className="group flex flex-col gap-0.5 border-l-2 border-line py-1.5 pl-3 transition-colors hover:border-gold"
    >
      <time
        dateTime={event.date}
        className="text-xs font-semibold uppercase text-ink-muted"
      >
        {formatDate(event.date, locale)}
      </time>
      <span className="text-sm font-medium leading-snug group-hover:text-blue">
        {event.title}
      </span>
    </Link>
  </li>
);
