export const metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zum Datenschutz und zur Verarbeitung personenbezogener Daten",
};

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>
          <div className="mt-4 h-px w-16 bg-[#3d6aff]" />
        </div>

        <div
          className="space-y-10 text-[#c4c0b8] leading-relaxed"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              1. Datenschutz auf einen Blick
            </h2>
            <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
              Allgemeine Hinweise
            </h3>
            <p className="text-sm leading-7">
              Die folgenden Hinweise geben einen einfachen Überblick darüber,
              was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
              Website besuchen. Personenbezogene Daten sind alle Daten, mit
              denen Sie persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-4 tracking-wide">
              2. Verantwortliche Stelle
            </h2>
            <p className="text-sm leading-7 mb-3">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser
              Website ist:
            </p>
            <address className="not-italic space-y-1 text-sm bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="font-medium text-[#e8e6e0]">
                {/* TODO: Ihren vollständigen Namen eintragen */}
                Vorname Nachname
              </p>
              <p>Musterstraße 1</p>
              <p>12345 Musterstadt</p>
              <p className="pt-2">
                <span className="text-[#8a8680]">E-Mail: </span>
                <a
                  href="mailto:kontakt@example.com"
                  className="text-[#6b7aff] hover:text-[#9aaafe] transition-colors"
                >
                  kontakt@example.com
                </a>
              </p>
            </address>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-4 tracking-wide">
              3. Datenerfassung auf dieser Website
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
                  Server-Log-Dateien
                </h3>
                <p className="text-sm leading-7">
                  Der Provider erhebt automatisch Informationen in
                  Server-Log-Dateien, die Ihr Browser übermittelt:
                </p>
                <ul className="mt-3 space-y-1 text-sm pl-4 border-l border-[#3d6aff]/30">
                  <li className="pl-3">Browsertyp und Browserversion</li>
                  <li className="pl-3">Verwendetes Betriebssystem</li>
                  <li className="pl-3">Referrer URL</li>
                  <li className="pl-3">Hostname des zugreifenden Rechners</li>
                  <li className="pl-3">Uhrzeit der Serveranfrage</li>
                  <li className="pl-3">IP-Adresse</li>
                </ul>
                <p className="text-sm leading-7 mt-3">
                  Die Erfassung dieser Daten erfolgt auf Grundlage von
                  Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
                  Cookies
                </h3>
                <p className="text-sm leading-7">
                  Diese Website verwendet keine Cookies, die eine persönliche
                  Identifizierung ermöglichen. Technisch notwendige Cookies
                  können für die Funktionalität der Website gesetzt werden.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-4 tracking-wide">
              4. Hosting – Vercel
            </h2>
            <p className="text-sm leading-7">
              Diese Website wird bei Vercel Inc., 340 Pine Street, Suite 701,
              San Francisco, California 94104, USA gehostet. Details:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b7aff] hover:text-[#9aaafe] transition-colors"
              >
                vercel.com/legal/privacy-policy
              </a>
              . Grundlage: Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-4 tracking-wide">
              5. Datenbank – Supabase
            </h2>
            <p className="text-sm leading-7">
              Diese Website verwendet Supabase als Datenbankdienst. Weitere
              Informationen:{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b7aff] hover:text-[#9aaafe] transition-colors"
              >
                supabase.com/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-4 tracking-wide">
              6. Ihre Rechte
            </h2>
            <ul className="space-y-2 text-sm">
              {[
                "Recht auf Auskunft (Art. 15 DSGVO)",
                "Recht auf Berichtigung (Art. 16 DSGVO)",
                "Recht auf Löschung (Art. 17 DSGVO)",
                "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)",
                "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)",
                "Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)",
                "Recht auf Widerruf einer erteilten Einwilligung (Art. 7 Abs. 3 DSGVO)",
              ].map((right) => (
                <li key={right} className="flex items-start gap-2 pl-4 border-l border-[#3d6aff]/30">
                  <span className="text-[#6b7aff] mt-0.5">—</span>
                  <span className="pl-1">{right}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              7. Datensicherheit
            </h2>
            <p className="text-sm leading-7">
              Diese Seite nutzt SSL- bzw. TLS-Verschlüsselung. Eine
              verschlüsselte Verbindung erkennen Sie daran, dass die
              Adresszeile des Browsers von „http://" auf „https://" wechselt.
            </p>
          </section>
        </div>

        <p className="mt-16 text-xs text-[#5a5650]">
          Zuletzt aktualisiert: {new Date().getFullYear()} · Diese
          Datenschutzerklärung wurde nach bestem Wissen erstellt. Eine
          Rechtsberatung ersetzt sie nicht.
        </p>
      </div>
    </main>
  );
}