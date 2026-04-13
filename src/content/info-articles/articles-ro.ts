import type { InfoArticle } from "./types";

export const ARTICLES_RO: Record<string, InfoArticle> = {
  "cum-functioneaza": {
    slug: "cum-functioneaza",
    category: "ajutor",
    metaTitle: "Cum funcționează VEX — ghid complet",
    metaDescription:
      "Află cum funcționează platforma VEX: căutare anunțuri, publicare, contact cu vânzătorii și gestionarea contului.",
    title: "Cum funcționează platforma",
    intro:
      "VEX este o piață online unde persoane fizice și firme pot publica anunțuri și pot intra în legătură directă cu potențialii cumpărători. Platforma pune accent pe simplitate: găsești rapid ce cauți, contactezi vânzătorul prin canalul pus la dispoziție și îți gestionezi activitatea din contul tău.",
    sections: [
      {
        heading: "Ce poți face pe VEX",
        paragraphs: [
          "Ca vizitator sau utilizator înregistrat poți naviga prin categorii, filtra rezultatele după criterii relevante (locație, preț, stare) și deschide anunțurile care te interesează. Fiecare anunț prezintă informațiile esențiale: descriere, fotografii acolo unde sunt disponibile, preț și date de contact sau buton de mesaj, conform setărilor vânzătorului.",
          "Dacă ai un cont, poți salva anunțuri, publica propriile oferte și primi mesaje de la cei interesați. Contul îți centralizează anunțurile active, istoricul și setările de notificări, astfel încât să ai control asupra modului în care ești contactat.",
        ],
        bullets: [
          "Căutare și filtrare în categorii diverse",
          "Vizualizare detalii anunț și fotografii",
          "Contact direct cu vânzătorul (conform regulilor platformei)",
          "Publicare și administrare anunțuri din cont",
        ],
      },
      {
        heading: "Cum găsești rapid ce cauți",
        paragraphs: [
          "Începe prin a alege categoria potrivită sau folosește câmpul de căutare cu cuvinte cheie concrete (model, dimensiune, an). Combină filtrele pentru a reduce numărul de rezultate: de exemplu, interval de preț și localitate te ajută să vezi doar oferte fezabile pentru tine.",
          "Citește cu atenție descrierea și verifică dacă starea produsului, garanția sau modalitatea de predare sunt clar specificate. Dacă ceva lipsește, poți cere clarificări vânzătorului înainte de a te deplasa sau de a plăti.",
        ],
      },
      {
        heading: "Rolul platformei și limitele sale",
        paragraphs: [
          "VEX facilitează punerea în legătură a utilizatorilor și afișarea anunțurilor conform politicilor site-ului. Tranzacția în sine (plată, predare, garanție) are loc între cumpărător și vânzător, în afara platformei, deci este important să aplici regulile de siguranță recomandate și să verifici identitatea și bunul înainte de orice plată.",
          "Echipa poate modera anunțurile raportate sau care încalcă regulile, dar nu înlocuiește obligația ta de a verifica oferta. Raportează anunțurile suspecte pentru a proteja și alți utilizatori.",
        ],
      },
      {
        heading: "Contul tău și preferințele",
        paragraphs: [
          "După înregistrare poți actualiza datele de profil, parola și preferințele de comunicare. Este recomandat să folosești o adresă de e-mail activă și, unde este cazul, să activezi notificările pentru mesaje noi sau pentru modificări la anunțurile tale.",
          "Dacă îți schimbi numărul de telefon sau zona, actualizează aceste informații pentru ca potențialii cumpărători să te poată contacta corect.",
        ],
      },
      {
        heading: "Unde găsești ajutor suplimentar",
        paragraphs: [
          "Pentru pași concreți despre publicarea unui anunț, contactarea unui vânzător sau gestionarea contului, consultă articolele dedicate din secțiunea Ajutor. Pentru situații cu risc de fraudă sau escrocherie, citește materialele din Siguranță și raportează orice anunț care pare înșelător.",
        ],
      },
    ],
  },

  "cum-publici-anunt": {
    slug: "cum-publici-anunt",
    category: "ajutor",
    metaTitle: "Cum publici un anunț pe VEX",
    metaDescription:
      "Ghid pas cu pas: cum creezi un anunț clar, adaugi fotografii, setezi prețul și îți gestionezi oferta pe VEX.",
    title: "Cum publici un anunț",
    intro:
      "Un anunț bine structurat se vinde mai repede și atrage întrebări pertinente. Mai jos găsești pașii practici pentru a publica o ofertă completă și conformă cu regulile platformei.",
    sections: [
      {
        heading: "Pregătire înainte de publicare",
        paragraphs: [
          "Notează caracteristicile reale ale produsului sau serviciului: stare (nou, folosit, cu defecte minore), accesorii incluse, garanție rămasă, factură sau documente disponibile. Fotografiază obiectul în lumină bună, din mai unghiuri, inclusiv eventuale defecte — transparența reduce disputele ulterioare.",
          "Stabilește un preț realist comparând oferte similare pe site și ținând cont de uzură și sezon. Dacă ești deschis la negociere, menționează acest lucru în descriere.",
        ],
        bullets: [
          "Descriere honestă despre stare și accesorii",
          "Fotografii clare, relevante, fără filtre înșelătoare",
          "Preț și, opțional, posibilitate de negociere",
        ],
      },
      {
        heading: "Crearea anunțului în cont",
        paragraphs: [
          "Autentifică-te și accesează fluxul de publicare anunț. Alege categoria corectă: o plasare greșită îngreunează căutarea și poate duce la respingerea anunțului. Completează titlul astfel încât să conțină tipul produsului și detalii esențiale (ex.: mărime, model, capacitate).",
          "În câmpul de descriere, folosește paragrafe scurte sau liste cu puncte pentru specificații tehnice. Evită CAPS excesiv sau promisiuni vagi („cel mai bun din lume”). Include condițiile de predare: ridicare personală, livrare locală sau curier — și cine suportă costurile.",
        ],
      },
      {
        heading: "Fotografii și date de contact",
        paragraphs: [
          "Încarcă imagini sub limita de mărime indicată de platformă. Prima imagine este de obicei cea afișată în listă; alege-o pe cea mai reprezentativă. Nu folosi imagini preluate de pe internet dacă nu reprezintă exact produsul vândut.",
          "Verifică ce date de contact sunt afișate public (telefon, mesagerie). Dacă preferi doar mesaje prin platformă, setează opțiunile în consecință înainte de a publica.",
        ],
      },
      {
        heading: "După publicare: moderare și modificări",
        paragraphs: [
          "Anunțul poate fi verificat automat sau manual pentru conținut interzis, duplicate sau categorii greșite. Dacă primești o solicitare de modificare, actualizează textul sau imaginile conform indicațiilor pentru a evita dezactivarea anunțului.",
          "Poți edita anunțul când prețul se schimbă sau produsul a fost reparat — păstrează descrierea sincronizată cu realitatea pentru a menține încrederea cumpărătorilor.",
        ],
      },
      {
        heading: "Bune practici pentru vizibilitate",
        paragraphs: [
          "Răspunde prompt la mesaje și marchează anunțul ca vândut când tranzacția s-a încheiat; astfel eviți contacte inutile și ajuți statisticile platformei. Reînnoiește anunțul doar dacă regulile permit, fără a crea duplicate care încalcă politica anti-spam.",
        ],
      },
    ],
  },

  "cum-contactezi-vanzatorul": {
    slug: "cum-contactezi-vanzatorul",
    category: "ajutor",
    metaTitle: "Cum contactezi un vânzător pe VEX",
    metaDescription:
      "Cum trimiți primul mesaj, ce întrebări să pui, cum negociezi politicos și cum eviți neînțelegerile.",
    title: "Cum contactezi un vânzător",
    intro:
      "Prima impresie contează. Un mesaj clar și respectuos crește șansele să primești răspunsuri utile și să programezi o întâlnire sau o livrare fără confuzii.",
    sections: [
      {
        heading: "Primul mesaj: ce să incluzi",
        paragraphs: [
          "Prezintă-te sumar și menționează anunțul la care te referi (titlu sau link). Întreabă direct despre disponibilitate, starea produsului și posibilitatea de vizionare în persoană. Dacă negociezi, propune un interval de preț realist, nu presiuni agresive.",
          "Evită mesaje copy-paste trimise la zeci de vânzători fără personalizare — pot fi ignorate sau considerate spam.",
        ],
        bullets: [
          "Confirmă că anunțul este încă valabil",
          "Cere detalii despre defecte sau accesorii",
          "Propune un interval orar pentru întâlnire sau un loc public sigur",
        ],
      },
      {
        heading: "Canale de comunicare",
        paragraphs: [
          "Folosește canalul pus la dispoziție de platformă (mesaj intern, buton de contact) acolo unde există. Dacă ți se oferă număr de telefon, sună în ore rezonabile și rezumă conversația în scris după ce v-ați înțeles asupra prețului și locului de predare — ajută la evitarea neînțelegerilor.",
          "Nu continua conversația pe aplicații neoficiale imediat ce ai fost contactat de un cont suspect sau dacă ți se cere plata în avans fără justificare.",
        ],
      },
      {
        heading: "Negocierea și limitele sănătoase",
        paragraphs: [
          "Este normal să negociezi, dar păstrează un ton profesionist. Acceptă refuzul politicos dacă prețul nu este negociabil. Nu condiționa vizionarea de plăți în avans; pentru produse second-hand, verificarea fizică este esențială acolo unde este posibil.",
        ],
      },
      {
        heading: "Întâlnirea pentru predare-primire",
        paragraphs: [
          "Stabilește locul și ora în avans. Preferă spații publice, luminate, pentru bunuri mici; pentru obiecte voluminoase sau mașini, verifică identitatea și documentele la fața locului. Nu merge singur(ă) în locuri izolate cu persoane necunoscute.",
          "Dacă vânzătorul amână repetat sau schimbă brusc condițiile, reconsideră tranzacția și consultă materialele despre recunoașterea escrocheriilor.",
        ],
      },
      {
        heading: "Dacă ceva nu pare în regulă",
        paragraphs: [
          "Încheie conversația dacă ți se cere cod SMS, plată prin metode neobișnuite sau transfer către terți. Raportează anunțul din pagina de detalii și păstrează capturi ale conversației dacă ai nevoie de dovezi ulterioare.",
        ],
      },
    ],
  },

  "gestioneaza-contul": {
    slug: "gestioneaza-contul",
    category: "ajutor",
    metaTitle: "Cum îți gestionezi contul VEX",
    metaDescription:
      "Setări cont, securitate, anunțuri, date personale și notificări — cum le controlezi pe VEX.",
    title: "Cum îți gestionezi contul",
    intro:
      "Contul tău este centrul de control pentru anunțuri, mesaje și preferințe. O configurare corectă îți economisește timp și reduce riscul de acces neautorizat.",
    sections: [
      {
        heading: "Date de profil și autentificare",
        paragraphs: [
          "Asigură-te că adresa de e-mail și numărul de telefon sunt actualizate — sunt folosite pentru recuperarea contului și notificări importante. Folosește o parolă lungă, unică pentru acest site, și nu o reutiliza de la alte servicii.",
          "Dacă platforma oferă autentificare în doi pași sau verificări suplimentare, activează-le pentru un strat extra de protecție.",
        ],
        bullets: [
          "Parolă unică, schimbată la orice suspiciune de compromitere",
          "E-mail valid pentru resetare și alerte",
          "Delogare de pe dispozitive împrumutate",
        ],
      },
      {
        heading: "Anunțurile tale",
        paragraphs: [
          "Din panoul de cont poți vedea anunțurile active, expirate sau în moderare. Editează textul sau imaginile când produsul se schimbă și închide anunțul după vânzare pentru a nu primi solicitări inutile.",
          "Respectă politica privind duplicatele: nu republica același produs în zeci de categorii sau cu titluri diferite doar pentru vizibilitate — poate duce la restricții.",
        ],
      },
      {
        heading: "Mesaje și notificări",
        paragraphs: [
          "Configurează ce tip de notificări primești (e-mail, push dacă există) pentru mesaje noi sau actualizări la anunțuri. Dezactivează doar ce te încarcă inutil, dar păstrează alertele legate de securitate și autentificare.",
        ],
      },
      {
        heading: "Confidențialitate și vizibilitate",
        paragraphs: [
          "Verifică ce informații sunt publice pe profilul tău și cum apar în anunțuri. Dacă lucrezi cu date sensibile, evită să le incluzi în descrieri publice. Șterge din conversații date cu caracter personal dacă le-ai trimis din greșeală și solicită suportului ștergerea dacă legislația îți dă acest drept.",
        ],
      },
      {
        heading: "Probleme de acces și suport",
        paragraphs: [
          "Dacă nu te poți autentifica, folosește fluxul „Am uitat parola” și verifică folderul spam pentru e-mailuri de resetare. La activitate suspectă, schimbă parola imediat și contactează suportul platformei cu detalii despre mesajele sau IP-urile neobișnuite.",
        ],
      },
    ],
  },

  "intrebari-frecvente": {
    slug: "intrebari-frecvente",
    category: "ajutor",
    metaTitle: "Întrebări frecvente — VEX",
    metaDescription:
      "Răspunsuri la cele mai comune întrebări despre cont, anunțuri, plăți și siguranță pe VEX.",
    title: "Întrebări frecvente",
    intro:
      "Mai jos găsești răspunsuri la întrebări frecvente. Dacă nu găsești ce cauți, consultă articolele din Ajutor sau Siguranță sau raportează o problemă prin canalele oficiale.",
    sections: [
      {
        heading: "Cont și înregistrare",
        paragraphs: [
          "Pentru a publica anunțuri și a gestiona mesajele este necesar un cont valid. Folosește o adresă de e-mail la care ai acces — vei primi confirmări și alerte de securitate. Un singur cont per persoană este suficient; crearea multiplă pentru a ocoli limite poate duce la suspendare.",
        ],
        bullets: [
          "Cum recuperez parola? — Folosește opțiunea de resetare din pagina de autentificare.",
          "Pot schimba e-mailul? — Da, din setările contului, după confirmarea noului e-mail.",
        ],
      },
      {
        heading: "Publicare și costuri",
        paragraphs: [
          "Publicarea anunțurilor standard este gratuită: VEX nu percepe taxe pentru listări și nu oferă spații publicitare sau promovări plătite către terți. Nu există „pachete” comerciale pentru vizibilitate — contează descrierea sinceră, fotografiile clare și un preț potrivit pieței.",
        ],
      },
      {
        heading: "Plăți și tranzacții",
        paragraphs: [
          "În multe cazuri platforma doar pune în legătură părțile; plata se face direct între voi. Nu trimite bani unor persoane pe care nu le-ai verificat și nu accepta „garanții” neoficiale. Pentru produse scumpe, preferă verificarea la fața locului sau metode de plată cu protecții acolo unde există.",
        ],
      },
      {
        heading: "Moderare și anunț respins",
        paragraphs: [
          "Un anunț poate fi respins dacă încalcă regulile (categorie greșită, conținut interzis, imagini inadecvate). Citește mesajul de respingere, corectează și retrimite. Dacă consideri că a fost o eroare, folosește calea de contestare indicată de suport.",
        ],
      },
      {
        heading: "Siguranță și raportări",
        paragraphs: [
          "Dacă observi phishing, prețuri absurd de mici sau solicitări de plată în avans pentru bunuri neverificate, raportează anunțul. Nu divulga coduri SMS sau date bancare către „cumpărători” care nu au inspectat produsul.",
        ],
      },
      {
        heading: "Date personale și ștergere cont",
        paragraphs: [
          "Poți solicita actualizarea sau ștergerea datelor conform politicii de confidențialitate și legislației aplicabile. Ștergerea contului poate elimina istoricul anunțurilor și mesajelor — confirmă înainte dacă ai nevoie de dovezi pentru dispute.",
        ],
      },
    ],
  },

  "sfaturi-anti-frauda": {
    slug: "sfaturi-anti-frauda",
    category: "siguranta",
    metaTitle: "Sfaturi anti-fraudă — VEX",
    metaDescription:
      "Cum te protejezi la cumpărături și vânzări online: plăți, verificări, date personale și semnale de alarmă.",
    title: "Sfaturi anti-fraudă",
    intro:
      "Fraudatorii exploatează graba, încrederea naivă și lipsa verificărilor. Câteva reguli simple reduc drastic riscul de a pierde bani sau date personale.",
    sections: [
      {
        heading: "Principiul verificării în două etape",
        paragraphs: [
          "Înainte de plată, verifică că persoana există și că bunul este real. Înainte de predarea banilor sau a bunului, verifică că plata este autentică și că nu ești victima unei scheme de chargeback sau a unui fals ordin de plată.",
          "Nu te baza exclusiv pe capturi de ecran: pot fi falsificate. Când este posibil, folosește întâlniri în locuri publice și verifică identitatea pentru tranzacții mai mari.",
        ],
      },
      {
        heading: "Plăți și transferuri",
        paragraphs: [
          "Fii suspicios față de solicitările de plată înainte de a vedea produsul, mai ales dacă suma este integrală și metoda este ireversibilă (transfer bancar către persoane fizice necunoscute, card cadou, crypto către adrese anonime).",
          "Metodele cu protecție pentru cumpărător (unde există și sunt aplicabile tipului tău de tranzacție) sunt preferabile pentru sume mari. Orice presiune pentru „plata acum sau pierzi oferta” este un semnal roșu.",
        ],
        bullets: [
          "Evită plăți către conturi ale unor terți „pentru transport”",
          "Nu trimite coduri SMS sau parole",
          "Verifică că IBAN-ul corespunde vânzătorului verificat verbal",
        ],
      },
      {
        heading: "Date personale și phishing",
        paragraphs: [
          "Nu introduce date pe site-uri care imită VEX. Verifică domeniul din browser și folosește mereu linkuri oficiale. Băncile și platformele nu îți cer niciodată parola sau codul complet pe chat sau telefon.",
          "Dacă primești e-mailuri despre „cont suspendat” cu linkuri urgente, accesează site-ul tastând adresa manual sau din marcajele tale, nu din e-mail.",
        ],
      },
      {
        heading: "Oferte prea bune ca să fie adevărate",
        paragraphs: [
          "Prețuri mult sub piață, aceeași fotografie folosită în zeci de anunțuri sau refuzul întâlnirii pentru verificare sunt indicii clare. Caută imaginea pe internet (căutare inversă) și compară descrierea cu alte site-uri.",
        ],
      },
      {
        heading: "Ce faci dacă ai fost țintă",
        paragraphs: [
          "Oprește orice plată în curs dacă încă se poate, notifică banca și depune plângere la autorități unde este cazul. Raportează anunțul și utilizatorul pe VEX și păstrează dovada conversațiilor.",
        ],
      },
    ],
  },

  "cum-recunosti-un-scam": {
    slug: "cum-recunosti-un-scam",
    category: "siguranta",
    metaTitle: "Cum recunoști un scam online",
    metaDescription:
      "Semnale tipice ale escrocheriilor la anunțuri: presiune, plăți ciudate, identități false și cum reacționezi.",
    title: "Cum recunoști un scam",
    intro:
      "Escrocii folosesc tipare repetate. Învață semnele ca să le recunoști înainte să pierzi bani sau să expui date sensibile.",
    sections: [
      {
        heading: "Presiune emoțională și urgență artificială",
        paragraphs: [
          "Mesaje care spun că „alții așteaptă”, că trebuie să plătești în câteva minute sau că oferta dispare azi sunt concepute să îți scurteze gândirea critică. Deciziile financiare nu ar trebui luate sub presiune.",
        ],
      },
      {
        heading: "Refuzul verificării în persoană",
        paragraphs: [
          "Pentru bunuri locale, un vânzator serios acceptă de obicei inspectarea. Scuze repetate, livrări doar prin curieri dubioși sau cereri de plată înainte de orice probă reală trebuie tratate cu scepticism.",
        ],
        bullets: [
          "„Trimite avansul și îți trimit mâine” fără dovezi solide",
          "Refuzul unui apel video pentru produse mici când distanța permite",
        ],
      },
      {
        heading: "Metode de plată neobișnuite",
        paragraphs: [
          "Transferuri către portofele anonime, carduri cadou, reîncărcări de telefon sau „taxe de înregistrare” pentru a primi coletul sunt tehnici frecvente. O tranzacție legitimă folosește de obicei metode uzuale și verificabile.",
        ],
      },
      {
        heading: "Identități și documente false",
        paragraphs: [
          "Profiluri noi, fără istoric, cu poze generice sau duplicate între anunțuri diferite merită verificare suplimentară. Cere detalii specifice despre produs (număr serie, mic defect) — un vânzător real le știe.",
        ],
      },
      {
        heading: "Phishing și linkuri externe",
        paragraphs: [
          "Dacă ești redirecționat rapid spre chat-uri pe alte platforme cu promisiuni de plată „protejată” de servicii necunoscute, oprește-te. Verifică reputația acelui serviciu independent de mesajul vânzătorului.",
        ],
      },
      {
        heading: "Pași practici când bănuiești un scam",
        paragraphs: [
          "Nu plăti, nu trimite documente cu CNP vizibil, raportează utilizatorul și anunțul. Avertizează-i pe alții lăsând o recenzie sau raport clar dacă platforma permite.",
        ],
      },
    ],
  },

  "reguli-siguranta-cumparare": {
    slug: "reguli-siguranta-cumparare",
    category: "siguranta",
    metaTitle: "Reguli de siguranță la cumpărare",
    metaDescription:
      "Checklist pentru cumpărători: verificare produs, loc întâlnire, plată sigură și evitarea fraudelor.",
    title: "Reguli de siguranță la cumpărare",
    intro:
      "Cumpărătorul poate controla multe riscuri prin verificări simple înainte și în timpul tranzacției. Urmează regulile de mai jos pentru experiențe mai sigure.",
    sections: [
      {
        heading: "Înainte de a merge la întâlnire",
        paragraphs: [
          "Citește întreg anunțul și pune întrebări punctuale: garanție, factură, kilometraj real, testare la fața locului. Dacă răspunsurile sunt evazive, reconsideră.",
        ],
        bullets: [
          "Compară prețul cu piața; abateri mari necesită explicații",
          "Cere poze suplimentare dacă ceva nu se potrivește",
        ],
      },
      {
        heading: "Locul întâlnirii",
        paragraphs: [
          "Preferă zone publice, aglomerate, în ore de zi. Pentru telefoane sau electronice, verifică funcțiile în prezența vânzătorului. Nu urma în spații private la prima întâlnire.",
        ],
      },
      {
        heading: "Plata",
        paragraphs: [
          "Evită cash-uri foarte mari în locuri nepotrivite; pentru sume mari, discută cu banca despre opțiuni sigure. Nu plăti integral înainte să ai controlul asupra bunului sau fără contract unde este cazul (auto, imobiliare).",
        ],
      },
      {
        heading: "Documente și garanție",
        paragraphs: [
          "Pentru vehicule sau electronice, verifică seria, istoricul de blocare și documentele de proprietate. La produse cu garanție, cere dovada achiziției originale.",
        ],
      },
      {
        heading: "După cumpărare",
        paragraphs: [
          "Schimbă parolele la dispozitive second-hand, resetează la setările din fabrică unde e cazul și verifică că nu există obligații ascunse (rate, leasing).",
        ],
      },
    ],
  },

  "reguli-siguranta-vanzare": {
    slug: "reguli-siguranta-vanzare",
    category: "siguranta",
    metaTitle: "Reguli de siguranță la vânzare",
    metaDescription:
      "Cum vinzi în siguranță: verificarea cumpărătorului, predarea bunului, plata și evitarea înșelăciunilor.",
    title: "Reguli de siguranță la vânzare",
    intro:
      "Vânzătorii sunt ținte pentru înșelăciuni cu plăți false sau „cumpărători” care vor să obțină produsul fără plată reală. Iată cum te protejezi.",
    sections: [
      {
        heading: "Filtrarea contactelor",
        paragraphs: [
          "Răspunde celor care pun întrebări concrete. Ignoră mesajele cu text generic sau care cer imediat numărul pe alte aplicații fără context. Nu trimite coduri de verificare către „curieri”.",
        ],
      },
      {
        heading: "Verificarea plății",
        paragraphs: [
          "Pentru transfer bancar, confirmă în aplicația băncii că suma a intrat și este disponibilă, nu doar o promisiune. Fii atent la mailuri false care pretind confirmarea plății.",
        ],
        bullets: [
          "Nu predai bunul pe baza unui screenshot",
          "Pentru numerar, numără și verifică bancnotele în loc sigur",
        ],
      },
      {
        heading: "Predarea bunului",
        paragraphs: [
          "Întâlnire în loc public pentru obiecte mici; pentru volume mari, poate fi necesară vizionarea la domiciliu — evaluează riscul și, dacă e posibil, nu ești singur(ă).",
        ],
      },
      {
        heading: "Evitarea „supra-plății”",
        paragraphs: [
          "Schemă clasică: cumpărătorul trimite prea mulți bani și cere returnarea diferenței. Transferul inițial poate fi fraudulos sau reversibil. Nu returna nimic până nu ai certitudinea absolută a plății reale și a fondurilor disponibile.",
        ],
      },
      {
        heading: "Date personale",
        paragraphs: [
          "Nu trimite copii după buletin necenzurate în chat public. Dacă e nevoie de contract, partajează doar ce este legal necesar și prin canale sigure.",
        ],
      },
    ],
  },

  "raporteaza-anunt": {
    slug: "raporteaza-anunt",
    category: "siguranta",
    metaTitle: "Raportează un anunț suspect — VEX",
    metaDescription:
      "Cum și când raportezi un anunț: motive, dovezi, ce se întâmplă după raportare și cum ajuți comunitatea.",
    title: "Raportează un anunț suspect",
    intro:
      "Raportările ajută la menținerea unei piețe curate. Folosește instrumentul de raportare când observi încălcări ale regulilor sau comportament periculos.",
    sections: [
      {
        heading: "Când să raportezi",
        paragraphs: [
          "Raportează dacă vezi produse interzise, conținut ofensator, duplicate abuzive, prețuri folosite ca momeală sau solicitări de plată frauduloase. Fiecare raport serios contribuie la verificări mai rapide.",
        ],
        bullets: [
          "Anunțuri înșelătoare sau identități furate",
          "Hărțuire sau discriminare în text sau imagini",
          "Spam sau phishing mascat drept ofertă",
        ],
      },
      {
        heading: "Cum raportezi",
        paragraphs: [
          "Deschide pagina anunțului și folosește opțiunea de semnalare indicată pe site. Selectează motivul cel mai potrivit și descrie faptele pe scurt: ce anume nu corespunde sau de ce crezi că este fraudulos.",
        ],
      },
      {
        heading: "Ce informații să incluzi",
        paragraphs: [
          "Menționează dacă ai fost solicitat la plată în avans, dacă fotografia pare furată sau dacă utilizatorul a refuzat verificarea. Dacă ai capturi de ecran, urmează instrucțiunile platformei pentru atașare — fără date personale sensibile ale tale în exces.",
        ],
      },
      {
        heading: "După raportare",
        paragraphs: [
          "Moderatorii pot ascunde temporar anunțul, cere clarificări vânzătorului sau închide contul în cazuri grave. Nu primești întotdeauna răspuns individual din motive de volum, dar raportul este înregistrat.",
        ],
      },
      {
        heading: "Limite și abuz de raportare",
        paragraphs: [
          "Nu folosi raportările pentru a ataca concurența sau din motive subiective nefondate. Raportările false repetate pot afecta propriul cont.",
        ],
      },
      {
        heading: "Situații grave",
        paragraphs: [
          "Dacă ai fost victima unei infracțiuni (furt prin înșelăciune), adresează-te autorităților competente și păstrează toate dovezile. Raportarea pe platformă nu înlocuiește plângerea penală unde este cazul.",
        ],
      },
    ],
  },
};
