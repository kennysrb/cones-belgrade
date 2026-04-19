export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <main>Cones Belgrade — {locale.toUpperCase()} placeholder</main>;
}
