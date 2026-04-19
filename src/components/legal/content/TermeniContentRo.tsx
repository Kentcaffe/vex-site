import { Link } from "@/i18n/navigation";
import { h2Class, sectionClass, ulClass } from "@/components/legal/LegalDocumentShell";

/** Conținut juridic — limba română (VEX / vex.md). */
export function TermeniContentRo() {
  return (
    <>
      <section className={sectionClass}>
        <h2 className={h2Class}>1. Informații generale</h2>
        <p>
          <strong>VEX</strong> (denumire comercială, site: <strong>vex.md</strong>) este o platformă online de tip marketplace / site de anunțuri care pune în legătură utilizatorii
          pentru publicarea, căutarea și contactarea privind bunuri, servicii sau alte oferte. Operatorul platformei acționează ca intermediar tehnic și nu este parte în tranzacțiile
          încheiate între utilizatori, decât în măsura prevăzută expres de lege sau de acești termeni.
        </p>
        <p>
          Prin accesarea sau utilizarea serviciilor VEX confirmați că ați citit, înțeles și acceptați acești Termeni și Condiții, precum și Politica de confidențialitate aplicabilă.
          Dacă nu sunteți de acord, vă rugăm să nu utilizați platforma.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2. Definiții</h2>
        <ul className={ulClass}>
          <li>
            <strong>„Platformă”</strong> — website-ul, aplicațiile și serviciile digitale puse la dispoziție sub marca VEX (inclusiv vex.md și subdomeniile aferente).
          </li>
          <li>
            <strong>„Utilizator”</strong> — orice persoană care accesează Platforma, creează un cont, publică anunțuri, trimite mesaje sau folosește orice altă funcționalitate.
          </li>
          <li>
            <strong>„Conținut”</strong> — texte, imagini, date de contact, mesaje, recenzii, anunțuri și orice material încărcat sau transmis prin Platformă.
          </li>
          <li>
            <strong>„Cont”</strong> — spațiul personal asociat unui Utilizator autentificat (profil, setări, istoric de activitate în limita funcțiilor oferite).
          </li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3. Crearea și securitatea contului</h2>
        <p>
          Pentru anumite funcții (publicare, mesagerie, favorite etc.) poate fi necesară crearea unui cont cu date valide (de exemplu e-mail, număr de telefon). Sunteți responsabil(ă)
          pentru păstrarea confidențialității credențialelor și pentru toate acțiunile efectuate prin contul dumneavoastră. Ne puteți notifica imediat la{" "}
          <a href="mailto:asistenta@vex.md" className="font-medium text-[#2563eb] underline hover:no-underline">
            asistenta@vex.md
          </a>{" "}
          dacă suspectați utilizare neautorizată.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4. Obligațiile utilizatorilor</h2>
        <p>Utilizatorii se obligă să:</p>
        <ul className={ulClass}>
          <li>furnizeze informații corecte și să nu inducă în eroare alți utilizatori;</li>
          <li>respecte legislația aplicabilă (inclusiv privind protecția consumatorilor, concurența, datele personale și proprietatea intelectuală);</li>
          <li>nu folosească Platforma în scopuri ilicite sau pentru a prejudicia terți;</li>
          <li>nu încerce să compromită securitatea sistemelor sau să extragă date în mod abuziv (scraping neautorizat, încercări de acces neautorizat etc.).</li>
        </ul>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5. Reguli pentru publicarea anunțurilor</h2>
        <p>Anunțurile trebuie să fie relevante, veridice și să respecte categoriile și formatele Platformei. Este interzisă publicarea repetată a aceluiași conținut în mod abuziv (spam).</p>
        <p>
          Imaginile și descrierile trebuie să corespundă obiectului sau serviciului oferit. Utilizatorul declară că deține drepturile necesare asupra materialelor încărcate sau că
          folosește licențe valide.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6. Conduite interzise</h2>
        <p>Fără a se limita la enumerarea următoare, sunt interzise:</p>
        <ul className={ulClass}>
          <li>fraude, înșelăciuni sau solicitări de plată în scopuri ilegitime;</li>
          <li>spam, mesaje comerciale nesolicitate sau promovare agresivă neconformă;</li>
          <li>conținut ilegal, instigator la ură, violent, obscen sau care încalcă drepturile terților;</li>
          <li>încălcarea drepturilor de proprietate intelectuală ale altora.</li>
        </ul>
        <p>
          Ne rezervăm dreptul de a șterge conținut, de a restricționa funcționalități și de a suspenda conturi în cazul încălcărilor, conform secțiunii de mai jos.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>7. Limitarea răspunderii</h2>
        <p>
          Platforma este oferită „ca atare”, în limite tehnice rezonabile. Nu garantăm disponibilitate neîntreruptă sau absența erorilor. Nu suntem răspunzători pentru calitatea,
          siguranța sau legalitatea tranzacțiilor dintre utilizatori, nici pentru daune indirecte sau pierderi de profit, în măsura permisă de lege.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>8. Suspendare și închidere cont</h2>
        <p>
          Putem suspenda sau închide conturi în caz de încălcare a acestor termeni, la solicitări legale sau pentru protecția utilizatorilor și a Platformei. Utilizatorul poate înceta
          utilizarea serviciului și poate solicita ștergerea datelor conform Politicii de confidențialitate și paginii dedicate{" "}
          <Link href="/stergere-date" className="font-medium text-[#2563eb] underline hover:no-underline">
            Ștergerea datelor
          </Link>
          .
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>9. Proprietate intelectuală</h2>
        <p>
          Elementele de branding, design, cod și documentație aparțin operatorului sau licențiatorilor săi. Conținutul publicat de utilizatori rămâne în responsabilitatea acestora;
          acordați o licență neexclusivă necesară pentru afișare, stocare și operare tehnică pe Platformă.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>10. Modificări ale termenilor</h2>
        <p>
          Putem actualiza periodic acești Termeni. Versiunea publicată pe site, împreună cu data ultimei actualizări, face referință. Continuarea utilizării după modificări poate
          constitui acceptarea noilor condiții, acolo unde legea permite.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>11. Legea aplicabilă și litigii</h2>
        <p>
          Pentru utilizatorii din Republica Moldova, în măsura aplicabilității, se vor aplica prevederile legislației moldovenești. Soluționarea litigiilor urmează procedurile legale
          competente, după epuizarea sau în paralel cu căile amiabile, unde este cazul.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>12. Contact</h2>
        <p>
          Pentru întrebări legate de acești Termeni și Condiții:{" "}
          <a href="mailto:asistenta@vex.md" className="font-semibold text-[#2563eb] underline hover:no-underline">
            asistenta@vex.md
          </a>
        </p>
      </section>
    </>
  );
}
