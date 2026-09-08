import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { DonateBlock } from "@/components/DonateBlock";
import { RichText } from "@/components/RichText";
import { SectionHeading } from "@/components/SectionHeading";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/locales";
import { asMedia } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";

export default async function FoundationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  const payload = await getPayloadClient();
  const [foundation, donate] = await Promise.all([
    payload.findGlobal({ slug: "foundation", locale, depth: 1 }),
    payload.findGlobal({ slug: "donate", locale, depth: 0 }),
  ]);

  const reports = [...(foundation.reports ?? [])].sort(
    (a, b) => b.year - a.year,
  );

  const legal: Array<[string, string | null | undefined]> = [
    [t.recipient, foundation.legalName],
    [t.taxId, foundation.registrationNumber],
    [t.address, foundation.legalAddress],
  ];

  return (
    <Container className="py-12">
      <h1 className="text-4xl uppercase sm:text-5xl">
        {foundation.heading || t.nav_foundation}
      </h1>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_22rem]">
        <div>
          <RichText data={foundation.story} locale={locale} />

          <section className="mt-12">
            <SectionHeading>{t.legalDetails}</SectionHeading>
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
              {legal
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="font-bold uppercase tracking-wider text-ink-muted">
                      {label}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              {foundation.contactEmail ? (
                <div className="contents">
                  <dt className="font-bold uppercase tracking-wider text-ink-muted">
                    {t.contact}
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${foundation.contactEmail}`}
                      className="text-blue hover:underline"
                    >
                      {foundation.contactEmail}
                    </a>
                    {foundation.contactPhone
                      ? ` · ${foundation.contactPhone}`
                      : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {reports.length > 0 ? (
            <section className="mt-12">
              <SectionHeading>{t.reports}</SectionHeading>
              <ul className="divide-y divide-line border-y border-line">
                {reports.map((report) => {
                  const file = asMedia(report.file);
                  return (
                    <li
                      key={report.id ?? `${report.year}-${report.title}`}
                      className="flex flex-wrap items-center justify-between gap-3 py-4"
                    >
                      <span>
                        <span className="font-semibold">{report.title}</span>
                        <span className="ml-2 text-sm text-ink-muted">
                          {report.year}
                        </span>
                      </span>
                      {file?.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm font-bold uppercase text-blue hover:underline"
                        >
                          {t.download} ↓
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <DonateBlock donate={donate} locale={locale} compact />
        </aside>
      </div>
    </Container>
  );
}
