import { Link } from "@/i18n/navigation";
import { h2Class, sectionClass, ulClass } from "@/components/legal/LegalDocumentShell";

export function StergereDateContentRo() {
  return (
    <>
      <section className={sectionClass}>
        <h2 className={h2Class}>1. Dreptul la ștergerea datelor</h2>
        <p>
          În conformitate cu principiile GDPR și cu legislația aplicabilă, puteți solicita ștergerea datelor personale prelucrate în cadrul <strong>VEX</strong> (vex.md), în măsura în
          care nu există obligații legale sau interese legitime care impun păstrarea anumitor informații (ex.: evidențe fiscale, apărare în litigii).
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>2. Cum puteți solicita ștergerea</h2>
        <h3 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-200">a) Din contul de utilizator</h3>
        <p className="mt-2">
          Dacă aveți cont autentificat, puteți folosi funcțiile disponibile în zona de setări cont (inclusiv opțiuni de export și ștergere cont), acolo unde sunt implementate în
          Platformă. Ștergerea contului poate duce la eliminarea sau anonimizarea datelor asociate profilului și activității în limita tehnică și legală.
        </p>
        <h3 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-200">b) Prin e-mail</h3>
        <p className="mt-2">
          Puteți trimite o cerere la{" "}
          <a href="mailto:support@vex.md" className="font-semibold text-[#2563eb] underline hover:no-underline">
            support@vex.md
          </a>{" "}
          folosind adresa de e-mail asociată contului (sau identificarea necesară pentru a vă verifica identitatea). Includeți subiectul clar, de exemplu: „Cerere ștergere date GDPR
          — VEX”.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>3. Ce date pot fi șterse</h2>
        <p>În mod tipic, după soluționarea cererii, pot fi eliminate sau anonimizate:</p>
        <ul className={ulClass}>
          <li>datele de profil (nume, telefon, e-mail, unde legea permite ștergerea completă);</li>
          <li>anunțurile și mesajele asociate contului, în măsura tehnicii și a obligațiilor de păstrare;</li>
          <li>preferințe și setări stocate în cont;</li>
          <li>datele de autentificare care nu mai sunt necesare.</li>
        </ul>
        <p>
          Anumite jurnale tehnice pot fi păstrate în formă agregată sau anonimizată pentru securitate. Documentele justificative pot fi reținute dacă legea impune un termen de
          arhivare.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>4. Timp de procesare</h2>
        <p>
          Ne propunem să confirmăm primirea cererii în termen rezonabil și să finalizăm ștergerea sau anonimizarea în intervalul de{" "}
          <strong>7–30 de zile calendaristice</strong>, în funcție de complexitate, volumul datelor și verificările de securitate necesare. În cazuri excepționale (litigii, solicitări
          ale autorităților), termenul poate fi prelungit cu notificare, acolo unde legea o permite.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>5. Documente conexe</h2>
        <p>
          Pentru context complet, consultați și{" "}
          <Link href="/termeni" className="font-medium text-[#2563eb] underline hover:no-underline">
            Termenii și Condițiile
          </Link>{" "}
          și{" "}
          <Link href="/confidentialitate" className="font-medium text-[#2563eb] underline hover:no-underline">
            Politica de confidențialitate
          </Link>
          .
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={h2Class}>6. Contact</h2>
        <p>
          Pentru cereri de ștergere și întrebări legate de prelucrarea datelor:{" "}
          <a href="mailto:support@vex.md" className="font-semibold text-[#2563eb] underline hover:no-underline">
            support@vex.md
          </a>
        </p>
      </section>
    </>
  );
}
