import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { DonateBlock } from "@/components/DonateBlock";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/locales";
import { getPayloadClient } from "@/lib/payload";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  return isLocale(locale) ? { title: getDictionary(locale).donate } : {};
};

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  const payload = await getPayloadClient();
  const donate = await payload.findGlobal({ slug: "donate", locale, depth: 0 });

  return (
    <Container className="py-12">
      <h1 className="mb-8 text-4xl uppercase sm:text-5xl">
        {donate.heading || t.donate}
      </h1>
      <div className="max-w-3xl">
        <DonateBlock donate={donate} locale={locale} />
      </div>
    </Container>
  );
}
