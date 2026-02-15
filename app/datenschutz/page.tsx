export const metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zum Datenschutz und zur Verarbeitung personenbezogener Daten",
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#e8e6e0]">
      {/* Subtle top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#3d6aff] to-transparent" />

      <div className="mx-auto max-w-2xl px-6 py-20">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6b7aff] hover:text-[#9aaafe] transition-colors mb-12 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Zurück zur Startseite
        </a>

        {/* Heading */}
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

        {/* Content */}
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
              denen Sie persönlich identifiziert werden können. Ausführliche
              Informationen zum Thema Datenschutz entnehmen Sie unserer unter
              diesem Text aufgeführten Datenschutzerklärung.
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
            <p className="text-sm leading-7 mt-4">
              Verantwortliche Stelle ist die natürliche oder juristische Person,
              die allein oder gemeinsam mit anderen über die Zwecke und Mittel
              der Verarbeitung von personenbezogenen Daten entscheidet.
            </p>
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
                  Der Provider der Seiten erhebt und speichert automatisch
                  Informationen in sogenannten Server-Log-Dateien, die Ihr
                  Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul className="mt-3 space-y-1 text-sm pl-4 border-l border-[#3d6aff]/30">
                  <li className="pl-3">Browsertyp und Browserversion</li>
                  <li className="pl-3">verwendetes Betriebssystem</li>
                  <li className="pl-3">Referrer URL</li>
                  <li className="pl-3">Hostname des zugreifenden Rechners</li>
                  <li className="pl-3">Uhrzeit der Serveranfrage</li>
                  <li className="pl-3">IP-Adresse</li>
                </ul>
                <p className="text-sm leading-7 mt-3">
                  Eine Zusammenführung dieser Daten mit anderen Datenquellen
                  wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf
                  Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
                  Cookies
                </h3>
                <p className="text-sm leading-7">
                  Diese Website verwendet keine Cookies, die eine persönliche
                  Identifizierung ermöglichen.{" "}
                  {/* TODO: Anpassen falls Sie Cookies (z.B. für Auth via Supabase) verwenden */}
                  Technisch notwendige Cookies können für die Funktionalität
                  der Website gesetzt werden.
                </p>
              </div>

              <div>
                <h3 className="text-base font-medium text-[#d6d2ca] mb-2">
                  Kontaktformular & Kommentare
                </h3>
                <p className="text-sm leading-7">
                  {/* TODO: Anpassen je nach den Features Ihres Blogs */}
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen
                  oder Kommentare hinterlassen, werden Ihre Angaben aus dem
                  Formular inklusive der von Ihnen dort angegebenen Kontaktdaten
                  zwecks Bearbeitung der Anfrage und für den Fall von
                  Anschlussfragen bei uns gespeichert. Die Verarbeitung der in
                  das Formular eingegebenen Daten erfolgt ausschließlich auf
                  Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
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
              San Francisco, California 94104, USA gehostet. Details entnehmen
              Sie der Datenschutzerklärung von Vercel:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6b7aff] hover:text-[#9aaafe] transition-colors"
              >
                vercel.com/legal/privacy-policy
              </a>
              . Die Nutzung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1
              lit. f DSGVO. Es besteht ein Auftragsverarbeitungsvertrag mit
              Vercel.
            </p>
          </section>

          {/* Supabase section – falls genutzt */}
          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-4 tracking-wide">
              5. Datenbank – Supabase
            </h2>
            <p className="text-sm leading-7">
              Diese Website verwendet Supabase (Supabase Inc.) als
              Datenbankdienst. Dabei können personenbezogene Daten (z.B.
              E-Mail-Adressen bei einer Registrierung) auf Servern von Supabase
              gespeichert werden. Die Verarbeitung erfolgt auf Grundlage von
              Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO. Weitere Informationen
              finden Sie in der Datenschutzerklärung von Supabase:{" "}
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
            <p className="text-sm leading-7 mb-4">
              Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie
              betreffenden personenbezogenen Daten:
            </p>
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
            <p className="text-sm leading-7 mt-4">
              Außerdem haben Sie das Recht, sich bei einer
              Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
              personenbezogenen Daten durch uns zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#e8e6e0] mb-3 tracking-wide">
              7. Datensicherheit
            </h2>
            <p className="text-sm leading-7">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der
              Übertragung vertraulicher Inhalte eine SSL- bzw.
              TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
              daran, dass die Adresszeile des Browsers von „http://" auf
              „https://" wechselt.
            </p>
          </section>
        </div>

        {/* Footer note */}
        <p className="mt-16 text-xs text-[#5a5650]">
          Zuletzt aktualisiert: {new Date().getFullYear()} · Diese Datenschutzerklärung wurde nach bestem Wissen
          erstellt. Eine Rechtsberatung ersetzt sie nicht.
        </p>
      </div>
    </main>
  );
}