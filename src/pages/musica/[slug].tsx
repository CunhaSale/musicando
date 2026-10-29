import Link from "next/link";
import { useRouter } from "next/router";
import { SONGS, SongPlayer } from "@/components/songs";

export default function SongPage() {
  const router = useRouter();
  const slug = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;

  if (!router.isReady) {
    return null;
  }

  const song = SONGS.find((s) => s.slug === slug);

  if (!song) {
    return (
      <main className="min-h-screen font-sans">
        <header className="mx-auto max-w-5xl px-6 pt-10">
          <Link href="/" className="font-display text-2xl font-extrabold text-primary">← Musicando</Link>
        </header>
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="font-display text-4xl font-extrabold text-foreground">Música não encontrada</h1>
          <p className="mt-3 text-muted-foreground">O slug informado não corresponde a uma partitura disponível.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen font-sans">
      <header className="mx-auto max-w-5xl px-6 pt-10">
        <Link href="/" className="font-display text-2xl font-extrabold text-primary">← Musicando</Link>
      </header>
      <SongPlayer song={song} full />
    </main>
  );
}