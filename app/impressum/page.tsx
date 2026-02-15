export const metadata = {
  title: "Impressum",
  description: "Impressum und rechtliche Informationen",
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#e8e6e0]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#3d6aff] to-transparent" />

      <div className="mx-auto max-w-2xl px-6 py-20">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6b7aff] hover:text-[#9aaafe] transition-colors mb-12 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Zurück zur Startseite
        </a>

        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6b7aff] mb-3 font-medium">
            Rechtliches
          </p>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Impressum
          </h1>
          <div className="mt-4 h-px w-16 bg-[#3d6aff]" />
        </div>

        <div
          className="space-y-10 text-[#c4c0b8] leading-relaxed"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              Angaben gemäß § 5 TMG
            </h2>
            <address className="not-italic space-y-1">
              <p className="font-medium text-[#e8e6e0]">
                {/* TODO: Ihren vollständigen Namen eintragen */}
                Stephan Gilger
              </p>
              <p>
                {/* TODO: Straße und Hausnummer */}
                Stöberlstr. 93
              </p>
              <p>
                {/* TODO: PLZ und Stadt */}
                80686 München
              </p>
              <p>Deutschland</p>
            </address>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              Kontakt
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="text-[#8a8680]">E-Mail: </span>
                {/* TODO: Ihre E-Mail-Adresse */}
                <a
                  href="mailto:kontakt@example.com"
                  className="text-[#6b7aff] hover:text-[#9aaafe] transition-colors"
                >
                  stephangilger@web.de
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <address className="not-italic space-y-1">
              <p className="font-medium text-[#e8e6e0]">
                {/* TODO: Name der verantwortlichen Person */}
                Stephan Gilger
              </p>
              <p>Stöberlstr, 93</p>
              <p>80686 München</p>
            </address>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              Haftungsausschluss
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
                  Haftung für Inhalte
                </h3>
                <p className="text-sm leading-7">
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene
                  Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                  verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
                  Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
                  gespeicherte fremde Informationen zu überwachen oder nach
                  Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                  hinweisen.
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
                  Haftung für Links
                </h3>
                <p className="text-sm leading-7">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf
                  deren Inhalte wir keinen Einfluss haben. Deshalb können wir
                  für diese fremden Inhalte auch keine Gewähr übernehmen. Für
                  die Inhalte der verlinkten Seiten ist stets der jeweilige
                  Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>
              <div>
                <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
                  Urheberrecht
                </h3>
                <p className="text-sm leading-7">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
                  diesen Seiten unterliegen dem deutschen Urheberrecht. Die
                  Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
                  Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen
                  der schriftlichen Zustimmung des jeweiligen Autors bzw.
                  Erstellers.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              Streitschlichtung
            </h2>
            <p className="text-sm leading-7">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b7aff] hover:text-[#9aaafe] transition-colors"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              . Wir sind nicht bereit oder verpflichtet, an
              Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>

        <p className="mt-16 text-xs text-[#5a5650]">
          Zuletzt aktualisiert: {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}