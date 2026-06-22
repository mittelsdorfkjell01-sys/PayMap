import Header from "@/components/Header";

/**
 * Bare placeholder for pages that don't exist yet (Ranking, Guide, Profil,
 * Einstellungen). Intentionally undesigned — just a title + note so the routes
 * resolve and navigation works. Replace with the real page later.
 */
export default function Placeholder({ title, active }: { title: string; active?: string }) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Header active={active} />
        <div className="mt-24 text-center">
          <h1 className="text-3xl font-medium text-navy">{title}</h1>
          <p className="mt-3 text-navy/60">Diese Seite ist noch in Entwicklung — kommt später.</p>
        </div>
      </div>
    </div>
  );
}
