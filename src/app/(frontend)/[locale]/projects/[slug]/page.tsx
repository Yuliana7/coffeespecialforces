import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { DonateBlock } from "@/components/DonateBlock";
import { ProgressBar } from "@/components/ProgressBar";
import { RichText } from "@/components/RichText";
import { getDictionary } from "@/lib/dictionary";
import { formatDate } from "@/lib/format";
import { isLocale } from "@/lib/locales";
import { asMediaList, mediaAlt, mediaUrl } from "@/lib/media";
import { getPayloadClient } from "@/lib/payload";

type Params = { params: Promise<{ locale: string; slug: string }> };

const findProject = async (locale: "uk" | "en", slug: string) => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "projects",
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
  const project = await findProject(locale, slug);
  if (!project) return {};
  return { title: project.title, description: project.summary ?? undefined };
};

export default async function ProjectPage({ params }: Params) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  const project = await findProject(locale, slug);
  if (!project) notFound();

  const payload = await getPayloadClient();
  const donate = await payload.findGlobal({ slug: "donate", locale, depth: 0 });

  const cover = mediaUrl(project.coverImage, "hero");
  const gallery = asMediaList(project.gallery);

  return (
    <article className="py-12">
      <Container>
        <Link
          href={`/${locale}/projects`}
          className="text-sm font-semibold text-blue hover:underline"
        >
          ← {t.backToProjects}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
              project.status === "completed"
                ? "bg-olive text-white"
                : "bg-gold text-ink"
            }`}
          >
            {project.status === "completed" ? t.completed : t.active}
          </span>
          {project.startDate ? (
            <time
              dateTime={project.startDate}
              className="text-sm text-ink-muted"
            >
              {formatDate(project.startDate, locale)}
            </time>
          ) : null}
        </div>

        <h1 className="mt-3 max-w-4xl text-4xl uppercase leading-tight sm:text-5xl">
          {project.title}
        </h1>
        {project.summary ? (
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            {project.summary}
          </p>
        ) : null}
      </Container>

      {cover ? (
        <Container className="mt-8">
          <div className="relative aspect-[16/7] overflow-hidden rounded-lg bg-line">
            <Image
              src={cover}
              alt={mediaAlt(project.coverImage, project.title)}
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
        </Container>
      ) : null}

      <Container className="mt-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <RichText data={project.content} locale={locale} />

            {gallery.length > 0 ? (
              <section className="mt-12">
                <h2 className="mb-4 text-2xl uppercase">{t.gallery}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-line"
                    >
                      <Image
                        src={mediaUrl(image, "card") ?? ""}
                        alt={image.alt ?? ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {project.goalAmount ? (
              <div className="rounded-lg border border-line bg-surface p-6">
                <ProgressBar
                  raised={project.raisedAmount}
                  goal={project.goalAmount}
                  currency={project.currency}
                  locale={locale}
                />
              </div>
            ) : null}
            <DonateBlock donate={donate} locale={locale} compact />
          </aside>
        </div>
      </Container>
    </article>
  );
}
