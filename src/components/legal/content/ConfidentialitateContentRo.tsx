import { h2Class, sectionClass, ulClass } from "@/components/legal/LegalDocumentShell";

export function ConfidentialitateContentRo() {
  return (
    <>
      <section className={sectionClass}>
        <h2 className={h2Class}>1. Introducere</h2>
        <p>
          Această Politică de confidențialitate descrie modul în care <strong>VEX</strong> (vex.md) prelucrează datele personale în legătură cu utilizarea platformei de anunțuri /
          marketplace. Ne angajăm să respectăm principiile transparenței, limitării scopului și securității datelor, în conformitate cu legislația aplicabilă, inclusiv cerințele GDPR
          acolo unde sunt aplicabile.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2. Ce date colectăm</h2>
        <p>În funcție de modul în care interacționați cu Platforma, putem prelucra, printre altele:</p>
        <ul className={ulClass}>
          <li>
            <strong>Adresă de e-mail</strong> — pentru crearea contului, autentificare, notificări tehnice și comunicări legate de cont;
          </li>
          <li>
            <strong>Nume / pseudonim</strong> — dacă îl furnizați în profil sau în anunțuri;
          </li>
          <li>
            <strong>Număr de telefon</strong> — când este necesar pentru contact sau verificări, conform setărilor și cerințelor categoriei de anunț;
          </li>
          <li>
            <strong>Activitate pe site</strong> — date tehnice și de utilizare (ex.: mesaje trimise prin Platformă, favorite, raportări, jurnale de securitate anonimizate sau pseudonimizate
            acolo unde este posibil).
          </li>
        </ul>
        <p>De asemenea, pot fi prelucrate date tehnice standard: adresă IP, tip de browser, fus orar, identificatori de sesiune, în scopuri de securitate și funcționare.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3. Cum folosim datele</h2>
        <ul className={ulClass}>
          <li>
            <strong>Creare și administrare cont</strong> — pentru a vă permite să publicați anunțuri, să salvați favorite și să folosiți mesageria;
          </li>
          <li>
            <strong>Comunicare</strong> — pentru mesaje legate de cont, securitate, moderare sau răspunsuri la solicitările dumneavoastră;
          </li>
          <li>
            <strong>Securitate și prevenire abuz</strong> — detectarea activităților frauduloase, respectarea obligațiilor legale și protejarea utilizatorilor.
          </li>
        </ul>
        <p>Baza legală poate include executarea unui contract (furnizarea serviciului), interesul legitim (securitate, îmbunătățirea serviciului) sau consimțământul, unde este necesar.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4. Cookie-uri și tehnologii similare</h2>
        <p>
          Folosim cookie-uri și tehnologii similare pentru sesiuni, preferințe esențiale și, după caz, pentru analize agregate. Puteți controla cookie-urile din setările browserului;
          dezactivarea anumitor cookie-uri poate limita funcționalitatea Platformei.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5. Stocarea datelor</h2>
        <p>
          Păstrăm datele atât timp cât este necesar pentru scopurile declarate sau conform obligațiilor legale (ex.: evidențe contabile, apărare în litigii). La expirare, datele sunt
          șterse sau anonimizate în mod rezonabil.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6. Drepturile dumneavoastră (GDPR)</h2>
        <p>În condițiile legii, aveți dreptul la:</p>
        <ul className={ulClass}>
          <li>
            <strong>Acces</strong> — să obțineți confirmarea și o copie a datelor prelucrate;
          </li>
          <li>
            <strong>Rectificare</strong> — să corectați datele inexacte;
          </li>
          <li>
            <strong>Ștergere</strong> („dreptul de a fi uitat”) — în situațiile prevăzute de lege;
          </li>
          <li>
            <strong>Restricționare, portabilitate, opoziție</strong> — unde este cazul.
          </li>
        </ul>
        <p>
          Cererile pot fi trimise la adresa de contact de mai jos. De asemenea, puteți iniția ștergerea din cont sau prin procedura descrisă la pagina{" "}
          <strong>Ștergerea datelor</strong>.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>7. Securitatea datelor</h2>
        <p>
          Implementăm măsuri tehnice și organizatorice rezonabile (criptare acolo unde este fezabil, control acces, monitorizare). Niciun sistem nu este însă fără risc; vă rugăm să
          protejați credențialele contului.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>8. Terți (hosting, furnizori)</h2>
        <p>
          Putem apela la furnizori de infrastructură (hosting), e-mail tranzacțional, sau servicii de analiză, în calitate de persoane împuternicite de prelucrare, pe baza clauzelor
          contractuale și a obligațiilor de confidențialitate. Nu vindem datele personale către terți în scopuri comerciale directe în sensul tradițional al termenului.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>9. Modificări</h2>
        <p>Vom actualiza această politică când este necesar; data ultimei revizuiri este afișată în partea superioară a paginii.</p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>10. Contact confidențialitate</h2>
        <p>
          Pentru întrebări privind prelucrarea datelor personale:{" "}
          <a href="mailto:contact@vex.md" className="font-semibold text-[#2563eb] underline hover:no-underline">
            contact@vex.md
          </a>
        </p>
      </section>
    </>
  );
}
