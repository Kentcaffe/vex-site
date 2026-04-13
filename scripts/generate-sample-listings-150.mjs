/**
 * Generează 150 anunțuri demo pentru VEX (Moldova).
 * Rulează: node scripts/generate-sample-listings-150.mjs
 * Ieșire: data/vex-sample-listings-150.json
 *
 * Imagini: images.unsplash.com (source.unsplash.com este depreciat).
 */
import fs from "node:fs";

const locations = ["Chișinău", "Bălți", "Cahul", "Comrat", "Orhei", "Ungheni"];

/** Câte 2 URL-uri per anunț, rotite după index ca să nu fie toate la fel */
const unsplashPairs = [
  ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80", "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80"],
  ["https://images.unsplash.com/photo-1523206489230-c012c64b2c48?w=800&q=80", "https://images.unsplash.com/photo-1565849904461-04ed58b46ca4?w=800&q=80"],
  ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80", "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80"],
  ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80", "https://images.unsplash.com/photo-1489827744965-c1b318a149b4?w=800&q=80"],
  ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"],
  ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80", "https://images.unsplash.com/photo-1525547719571-a2d4ac8944e2?w=800&q=80"],
  ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80"],
  ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"],
  ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80", "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"],
  ["https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&q=80", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"],
  ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80", "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80"],
  ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"],
  ["https://images.unsplash.com/photo-1631889993959-41b4e9edf7c5?w=800&q=80", "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80"],
];

function imagesFor(i) {
  const pair = unsplashPairs[i % unsplashPairs.length];
  return [...pair];
}

function rnd(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function priceBetween(seed, min, max) {
  const j = rnd(seed) * (max - min) + min;
  return Math.round(j / 50) * 50;
}

/** 25 × 6 = 150 intrări: titlu, interval preț MDL, descriere (2–4 rânduri) */
const blocks = {
  Telefoane: [
    ["iPhone 11 64GB alb", [3200, 4800], "Face ID merge. Bateria 78% zice, tine o zi lejer.\nCutia nu mai am, cablu lightning dau unul universal.\nLivrare doar Botanica sau ridicare."],
    ["Samsung Galaxy A34 5G", [2800, 4200], "Luat de la Unite acum 8 luni, am bon.\nEcran protector pus din prima.\nVând că am trecut pe iphone."],
    ["Xiaomi Redmi Note 11 128gb", [1600, 2400], "Merge bine, uneori se restartează la update-uri — nu deranjează rau.\nDual sim, slot card.\nSchimb nu fac."],
    ["iPhone SE 2020 negru", [2200, 3500], "Mic și încă rapid pentru mesagerie.\nHome button ok, jack păstrat.\nNegociabil serios dacă iei azi."],
    ["Samsung S21 FE", [3800, 5600], "Ecran superb, am folosit husa mereu.\nLa spate mică zgârietură lângă cameră — în poze nu se vede.\nDoar cash."],
    ["Huawei P30 lite (fara google nou)", [900, 1600], "Pentru cine știe să pună apk-uri merge ok.\nBaterie încă decentă.\nVând urgent plec în armata — glumesc, dar chiar plec."],
    ["Google Pixel 6a", [3400, 4800], "Pozele sunt top, bateria medie.\nAm resetat de curând.\nÎntâlnire în centru lângă parc."],
    ["Telefon Nokia clasic cu taste", [250, 550], "Baterie 5 zile. Ideal bunică.\nSunet tare.\nNu trimit prin poștă."],
    ["OnePlus Nord 2", [2100, 3200], "Gaming merge, se încălzește vara normal.\nÎncărcător original inclus.\nPreț fix aproape."],
    ["iPhone 12 mini 128", [4500, 6200], "Îmi e prea mic pentru degete — serios.\nHealth baterie 86%.\n[URGENT] mutare apartament trebuie bani."],
    ["Realme 9 pro+", [1900, 2900], "Cameră bună noaptea.\nHusa bonus, fără folie pe ecran acum.\nVizionare Cahul."],
    ["Samsung flip vechi (model 2019)", [1200, 2200], "Nostalgie, merge pentru apeluri.\nEcran interior cu linii — știți ce cumpărați.\nNegociabil."],
    ["iPhone 13 Pro 256 graphite", [7200, 9800], "Stare foarte bună, folosit cu grijă.\nCutie + accesorii parțial.\nNu schimb cu nimic."],
    ["Motorola g60", [1100, 1800], "Baterie mare, merge 2 zile.\nSpeaker tare pentru muzică.\nRidicare din Râșcani."],
    ["Telefon pentru piese — iPhone X", [600, 1200], "Ecran spart, placa cred că merge — nu garantez.\nPentru service sau hobbiști.\nNu returnez."],
    ["Samsung A52 waterproof zice", [2000, 3100], "Scăpat o dată în apă — încă merge :)\nFace id ok.\nPreț negociabil la fata locului."],
    ["Xiaomi 13 lite", [3200, 4500], "Subțire, ușor, design frumos.\nAm pierdut încărcătorul în tren — preț mai mic din cauza asta.\nWhatsApp răspund repede."],
    ["iPhone 14 plus galben", [8800, 11500], "Aproape nou, garanție până primăvară.\nHusa Apple originală bonus.\nDoar Chișinău."],
    ["Blackview rugged — pt muncă", [1400, 2300], "Rezistent la șocuri, baterie uriașă.\nGreu dar util pe șantier.\nVând că am desk job acum."],
    ["OPPO Reno 8", [2600, 3900], "Selfie bun, ecran OLED.\nSoftware cu reclame la unele aplicații — se dezactivează.\nSună după 18:00."],
    ["Samsung Z Flip 3", [4200, 6500], "Plierea are mic șuierat când e rece — după încălzire dispare.\nArată bine.\nSchimb doar cu cash + diferență."],
    ["iPhone 7 32gb", [800, 1400], "Telefon vechi dar pentru copil sau rezervă ok.\nButon home merge.\nNu trimit curier."],
    ["Poco X5 Pro", [2400, 3600], "Ecran 120hz, baterie ok.\nLa spate sticker de la operator — se dă jos.\nBălți centru."],
    ["Telefon Allview — Android curat", [400, 800], "Pentru cine nu are pretenții.\nMerge youtube, facebook.\nBateria nu ține mult."],
    ["Sony Xperia compact", [700, 1300], "Pasionat de audio — jack 3.5 păstrat.\nCameră slabă comparativ cu 2024.\nColectori sau piese."],
  ],
  Mașini: [
    ["Dacia Logan 2010 1.4", [18000, 26000], "Rulaj mare dar întreținută la mecanic cunoscut.\nConsum mic, ideal oraș.\nITP valabil, RCA ok.\nMici rugini aripi."],
    ["VW Passat B6 2.0 TDI", [24000, 36000], "Cutie automată merge bine.\nInterior piele uzată pe șofer.\nVând deoarece am luat SUV."],
    ["Skoda Fabia 2014", [28000, 38000], "Prima mașină perfectă.\nParcare senzori spate nu mereu.\nNegociabil dacă vii cu mecanic."],
    ["Mercedes E220 2005", [32000, 48000], "Confort maxim, suspensie aer cu erori uneori.\nPiese nu sunt ieftine — știți la ce vă înhămați.\nActe curate."],
    ["Toyota Corolla 2008", [26000, 38000], "Fiabilitate legendară, consum mixt 7l.\nClimatronic merge.\nVizionare weekend Ungheni."],
    ["Ford Focus 2011 benzina", [15000, 24000], "Ambreiaj nou schimbat vara trecută.\nZgomot la relanti — injectoare?\nPreț mic din cauza asta."],
    ["Hyundai Tucson 2016", [52000, 72000], "4x4, familie mare — ne trebuie monovolum.\nRevizie la reprezentanță ultima dată.\n[URGENT] ofertă până joi."],
    ["BMW 320d E90", [28000, 42000], "Plăcere de condus, dar întreținere scumpă.\nLumină motor aprinsă — citit cod: EGR.\nPentru cunoscători."],
    ["Dacia Duster 2015 4x2", [38000, 52000], "Pentru drumuri proaste ok.\nPortbagaj mare.\nCuloare alb murdar ușor — spălat des."],
    ["Opel Astra H caravan", [12000, 20000], "Spațiu mult, ideal mutări.\nTrapa câteodată intră apă la spălătorie — am pus silicon.\nNegociabil."],
    ["Mazda 3 2012", [22000, 32000], "Design încă frumos, volan piele.\nRadio original fără bluetooth — am pus modulator FM.\nOrhei."],
    ["Renault Megane 2009", [14000, 22000], "Mașină de oraș.\nGeam electric șofer încet.\nPreț pentru cine repară singur."],
    ["Audi A4 B7 2.0 TDI", [26000, 40000], "Cutie manuală, tracțiune față.\nQuattro nu e :)\nKilometraj real zic eu — verifici la diagnoză."],
    ["Lada Niva 2005", [8000, 16000], "Offroad adevărat.\nConfort zero dar merge oriunde.\nNu pentru sensibili."],
    ["Peugeot 308 2017", [34000, 46000], "Motor 1.2 turbo — verificat la recall.\nInterior curat, nefumători.\nComrat."],
    ["Volvo V50", [20000, 30000], "Siguranță multă, piele, scaune încălzite.\nPiese online se găsesc.\nVând pentru că am primit firmă."],
    ["Chevrolet Cruze 2011", [11000, 19000], "Automată, merge dar schimbă greu când e rece.\nSchimb ulei regulat.\nBălți."],
    ["Nissan Qashqai 2014", [42000, 58000], "SUV compact, parcare ușoară.\nCameră mers înapoi.\nTractiune față."],
    ["Dacia Sandero stepway 2019", [36000, 48000], "Înălțime bună, praguri plastic.\nZgârieturi parcare normal.\nGaranție service expirată recent."],
    ["VW Golf 7 1.6 TDI", [38000, 52000], "Rară în stare asta zice vânzătorul oricum :)\nFull LED după tuning.\nNu trimit în alte raioane."],
    ["Mercedes Sprinter 2008", [45000, 70000], "Pentru afaceri, volum mare.\nFiscal nu discut pe chat.\nVizionare doar cu programare."],
    ["Honda Civic 2007", [24000, 34000], "VTEC meme aside, merge tare.\nTuning ușor estetic.\nCahul."],
    ["Mitsubishi Outlander 2013", [38000, 52000], "7 locuri, ideal familie.\nConsum mare în oraș.\n7 locuri rabatabile spate."],
    ["Smart fortwo", [9000, 16000], "Parcare oriunde. Cutie automată șoc la început — te obișnuiești.\nIdeal Chișinău aglomerat."],
    ["BMW X5 E53", [28000, 45000], "SUV vechi dar impunător.\nSuspensie pneumatică scumpă dacă crapă.\nPentru iubitori."],
  ],
  Electronice: [
    ["Laptop HP Pavilion i5 11gen", [4200, 6200], "16gb ram, ssd 512. Pentru birou și netflix perfect.\nTastatura luminată, baterie 3-4 ore.\nWindows licențiat."],
    ["MacBook Air 2017 128gb", [3500, 5200], "Subțire, ușor. Ultimul cu USB normal.\nBateria ține 2 ore real — schimb recomandat.\nNegociabil."],
    ["PC gaming — fără placă video", [2800, 4500], "Ryzen 5, 16gb, sursă bună. Îți pui tu GPU.\nCarcasă cu praf — curățat parțial.\nRidicare Botanica."],
    ["Monitor LG 27\" 1440p", [2200, 3800], "Pentru lucru grafic ok.\nUn mort subțire pe margine — nu deranjează.\nStand reglabil."],
    ["Tastatură mecanică Keychron K2", [1200, 2000], "Switch-uri brown, bluetooth + cablu.\nUnele taste shine diferit — uz normal.\nCutie am pierdut."],
    ["Mouse Logitech MX Master 2", [800, 1400], "Ergonomie top pentru birou.\nScroll lateral uneori săritor.\n[URGENT] am cumpărat 3 din greșeală."],
    ["Tableta iPad 9 gen 64 wifi", [3200, 4500], "Pentru copil la școală ideal.\nHusa cu tastatură inclusă.\nZgârietură pe spate."],
    ["Kindle Paperwhite", [900, 1500], "Citit mult, baterie săptămâni.\nEcran fără reflexie.\nCont amazon delogat."],
    ["Consolă PS4 Slim 500gb", [2800, 4200], "2 controlleri, unul analog uzat.\nJocuri nu incluse.\nVentilator tare după ore — curățat termopaste recomand."],
    ["Boxe Edifier 2.0", [600, 1200], "Pentru PC sunet cald.\nTelecomandă mică zgâriată.\nCablu aux inclus."],
    ["Router Asus AC dual band", [400, 900], "Merge stabil, firmware actualizat.\nAntenele una un pic strâmbă — nu afectează.\nFără cutie."],
    ["Imprimantă laser HP", [800, 1600], "Cartuș încă toner mult.\nWiFi setup uneori capricios.\nIdeal birou mic."],
    ["Cameră web Logitech C920", [500, 950], "Full HD, stream ok.\nMicrofon integrat mediocru.\nLivrare doar în Chișinău +30 lei."],
    ["SSD Samsung 1TB second", [900, 1400], "Ore folosire necunoscute, SMART ok la test rapid.\nIdeal upgrade laptop.\nNu deschid dispute."],
    ["Stație de lipit + aer cald", [350, 800], "Pentru electronist hobby.\nFuncționează, fără garanție.\nComrat."],
    ["Sursă PC Seasonic 650W", [1100, 1800], "Modulară, liniștită.\nFolosită 2 ani la gaming moderat.\nCablat complet."],
    ["Televizor Samsung 43 smart 2019", [4200, 6500], "4K, aplicații ok.\nRemote nu e original — universal.\nRidicare etaj 5 fără lift — ajut."],
    ["Soundbar Sony", [1400, 2600], "Pentru living mic suficient.\nSubwoofer wireless pierde legătura uneori — repoziționare ajută.\nNegociabil."],
    ["Dronă DJI Mini 2", [5200, 7800], "Zbor stabil, baterie 2 incluse.\nUn elice schimbat după copac :)\nÎnregistrare necesară — verificați legea."],
    ["Ceas Garmin Forerunner", [1800, 3200], "GPS alergare, waterproof.\nCurea originală uzată.\nVând că nu mai alerg."],
    ["Aparat foto Canon DSLR vechi", [2200, 3800], "Obiectiv kit inclus. Pentru începători ok.\nSenzor curat vizual.\nManual în română nu."],
    ["Microfon Blue Yeti", [900, 1600], "Podcast voce clară.\nSuport inclus, cablu usb.\nUșor zgâriet pe corp."],
    ["UPS pentru PC 600VA", [700, 1300], "Ține la întreruperi scurte.\nBaterie schimbată acum 1 an.\nGreață de ridicat."],
    ["Switch rețea managed 8 porturi", [500, 1000], "Pentru lab acasă.\nFan mic zgomotos — lipit servetel ajuta glumesc, sau schimb rulment.\nOrhei."],
    ["Proiector mini Anker", [1600, 2600], "Film pe perete ok întuneric.\nLuminozitate slabă ziua.\nIdeal seri."],
  ],
  Haine: [
    ["Geacă puf Uniqlo M", [900, 1700], "Ușoară, caldă. Spălată corect.\nMărime M dar croi slim — verificați măsurători în mesaj.\nBălți."],
    ["Blugi Levi's 501 măsura 32/32", [500, 1100], "Autentici cred, etichetă uzată.\nUz pe genunchi fashion sau uz real — decideți.\nNegociabil."],
    ["Rochie Zara M", [400, 1000], "Purtată de 3 ori la evenimente.\nCuloare bleumarin.\nFermoar spate ok."],
    ["Costum bărbătesc gri 48", [1200, 2500], "Pentru interviuri/wednesday office.\nPantaloni nevătuți.\nSacou umeri ok."],
    ["Adidași Nike Air mar 43", [800, 1600], "Talpă uzată dar încă aderență ok.\nCutie nu.\n[URGENT] plec Erasmus — trebuie spațiu în geamantan."],
    ["Geantă piele damă", [600, 1400], "Spațios interior, fermoar interior rupt la un colț.\nCuloare maro.\nChișinău centru."],
    ["Palton lung damă 38", [1100, 2200], "Stil clasic, lână.\nNecesită curățat la curățătorie — preț reflectat.\nUngheni."],
    ["Tricouri bumbac pachet 5", [200, 500], "Diverse mărci, mărime L.\nUnele cu pete mici — pentru lucru grădină.\nNu despachetez poze individuale."],
    ["Cămașă office albă slim L", [250, 600], "Guler puțin îngălbenit — închis la sacou nu se vede.\nButoni incluși.\nCahul."],
    ["Pantaloni ski / snowboard M", [400, 900], "Impermeabili, buzunare multe.\nFermoar lateral un pic rigid.\nSezon trecut."],
    ["Rochie de mireasă simplă 40", [2500, 5500], "Purtată o zi, curățată profesional.\nVoal inclus.\nPreț negociabil serios."],
    ["Hanorac Adidas L", [350, 800], "Interior pufos, glugă ok.\nLogo cusut, nu print.\nSpălat la 40 grade mereu."],
    ["Pantaloni scurți cargo 32", [200, 500], "Vară, buzunare multe.\nElastic ușor lăsat.\nComrat."],
    ["Cizme de cauciuc 41", [150, 400], "Pentru noroi grădină.\nUz normal talpă.\nNu modă :)"],
    ["Compleu trening damă S", [400, 900], "Pentru sală sau plimbare.\nCuloare roz prăfuit.\nElastic pantaloni strâns."],
    ["Cravată mătase + butoni", [150, 400], "Set cadou, purtat o dată.\nCutie deteriorată.\nOrhei."],
    ["Fustă piele eco M", [300, 700], "Stil office.\nLa spate cusătură deschisă ușor — reparabil.\nNegociabil."],
    ["Geacă moto piele 52", [1800, 3500], "Protecții scoase — le am separat.\nGreutate mare.\nDoar ridicare."],
    ["Pijamale flanel XL", [120, 300], "Noi, primite dublu la cadou.\nAmbalaj deschis.\nChișinău."],
    ["Eșarfă cașmir gri", [200, 500], "Moale, fără găuri.\nEtichetă scoasă — mănușă la spălare.\nCadou potrivit."],
    ["Pantaloni eleganti barbati 46", [400, 900], "Mărime mare — verificați talie.\nCuloare negru.\nFără curea."],
    ["Rucsac laptop 15 inch", [250, 600], "Compartimente multe, uz pe bretele.\nFermoar principal ok.\nNu waterproof garantat."],
    ["Mănuși piele iarnă damă", [150, 400], "Mărime 7.5, căptușeală caldă.\nUn deget cusut vizibil.\nBălți."],
    ["Șosete sport pachet 10", [80, 200], "Diverse culori, unele noi sigilate.\nIdeal lot.\nNu trimit separat."],
    ["Umbrela mare automată", [120, 280], "Anti-vânt zice eticheta, o dată s-a întors pe dos la furtună :)\nMâner cauciuc un pic uzat.\nPentru oraș merge."],
  ],
  Electrocasnice: [
    ["Frigider Liebherr două uși", [3200, 5200], "Silentios, congelator fără gheață.\nUșă magnetică puternică — trage bine.\nTransport vă descurcați."],
    ["Mașină spalat Indesit 6kg", [2200, 3800], "Programe multe, centrifugare stabilă.\nUneori zgomot la stoarcere — amortizoare vechi probabil.\nNegociabil."],
    ["Uscător rufe ventilare", [2800, 4800], "Ideal apartament fără balcon mare.\nFiltru curățat recent.\nConsum energie mediu."],
    ["Cuptor microunde Samsung", [600, 1200], "Grill nu l-am folosit niciodată.\nInterior curat.\nRotativ merge."],
    ["Plită vitroceramică 60cm", [1400, 2600], "Extras la renovare, zgârieturi fine.\nTrebuie electrician pentru branșament.\nUngheni."],
    ["Hota încorporabilă 60", [800, 1600], "Filtru carbon schimbat.\nVentilație evacuare sau recirculare.\nFără telecomandă — nu are."],
    ["Aspirator vertical Dyson V8", [3200, 5200], "Autonomie scăzută vs nou — baterie uzată.\nAccesorii parțiale.\nPreț mic."],
    ["Robot mop + vacuum", [1800, 3200], "Hărți cam prost pe covor gros.\nPe parchet ok.\nAplicație în engleză."],
    ["Espressor manual Delonghi", [1400, 2600], "Cafea bună, spumă lapte manuală.\nDecalcifiere făcută acum 2 luni.\nCahul."],
    ["Mixer KitchenAid copie", [900, 1800], "Puternic, zgomotos la viteza max.\nAccesoriu cârlig inclus.\nNu e original — preț mic."],
    ["Fierbător electric glass", [150, 350], "Rapid, lumină albastră.\nDepuneri calcar ușor — oțet ajută.\nBonus."],
    ["Toster 4 felii", [200, 450], "Uneori arde o parte mai tare — rotiți pâinea.\nCurat interior.\nChișinău."],
    ["Multicooker Redmond", [700, 1400], "Rețete online multe.\nGarnitura capac înlocuită improvizat.\nMerge."],
    ["Aerotermă baie", [400, 900], "Montare pe perete, timer.\nVentilator zgomotos la treapta 3.\nComrat."],
    ["Deshidrator alimente", [600, 1200], "Pentru fructe chips.\nTăvi unele zgâriate.\nFolosit 5 ori."],
    ["Mașină de spălat vase îngropată", [4200, 7000], "Extrase la bucătărie nouă — nu încape în noua config.\nFuncțional testat.\nRidicare grea."],
    ["Purificator aer Xiaomi", [900, 1800], "Filtru schimbat acum 4 luni.\nZgomot noapte acceptabil.\nSenzor praf ok."],
    ["Fier de călcat cu abur", [250, 600], "Abur puternic, picură uneori dacă umpleți prea mult.\nTalpă ceramică.\nNegociabil."],
    ["Statie călcat vertical", [400, 900], "Rapid pentru cămăși.\nRezervor mic — reumpleți des.\nOrhei."],
    ["Congelator lada 200L", [2400, 4200], "Pentru țară sau depozit.\nConsum vechi dar merge.\nZgomot compresor normal."],
    ["Mașină de pâine Panasonic", [800, 1500], "Program gluten free etc.\nFormă pâine verticală.\nCozonac ieșit o dată prost — user error."],
    ["Încălzitor instant apă", [1100, 2200], "Pentru duș fără boiler mare.\nInstalare electrician obligatoriu.\nBălți."],
    ["Scutec electric / plita camping", [300, 700], "Putere limitată — pentru ceai ok.\nCablu scurt.\nStudent ideal."],
    ["Aspirator cu sac Miele vechi", [900, 1600], "Sugere tare, saci se găsuesc încă.\nTub flexibil crăpat la capăt — bandă izolir.\nCalitate germană zice eticheta."],
    ["Radiator ulei 11 elementi", [500, 1000], "Pentru iarnă cameră mică.\nMiros ulei prima dată — normal.\n[URGENT] mutare garsonieră."],
  ],
  Mobilă: [
    ["Canapea colț gri", [5500, 9500], "Stofă, spațiu depozitare sub șezut.\nPet mic pe cotieră — acoperit cu pernă.\nDemont parțial pentru lift."],
    ["Pat 160x200 + somieră", [3200, 6200], "Fără saltea. Lemn masiv parțial.\nMontaj DIY — am șuruburi.\nTransport nu."],
    ["Dulap 3 uși alb", [2800, 5200], "Interior rafturi reglabile.\nBalamale uneori scârțâie — unsori ajută.\nChișinău Râșcani."],
    ["Masă extensibilă bucătărie", [1800, 3600], "Formă rotundă extinsă oval.\nZgârieturi blat — fețe de masă rezolvă.\nNegociabil."],
    ["Set 6 scaune tapitate", [2200, 4500], "Culoare crem, picioare lemn.\nUn scaun șubrezd ușor — reparabil.\nVizionare weekend."],
    ["Bibliotecă modulară", [1400, 3000], "Pal, multe rafturi.\nDemontată în piese etichetate.\nCahul."],
    ["Comodă TV 1.6m", [1600, 3200], "Spațiu cabluri în spate.\nUși glisante un pic greoaie.\nCuloare wenge."],
    ["Puf taburet rotund", [400, 900], "Textil catifea, pete mici.\nIdeal gaming room.\nUșor de mutat."],
    ["Birou cu sertare 120cm", [900, 1900], "Pentru studiu copil.\nSertar unul merge strâns.\nComrat."],
    ["Etajeră perete 5 rafturi", [350, 800], "MDF, montaj perete necesit dibluri.\nInclude dibluri parțial.\nUngheni."],
    ["Oglinzi hol set 3", [250, 600], "Rame plastic, fără crăpături.\nFixare dublă bandă veche — înlocuiți.\nNegociabil."],
    ["Cuier hol cu pantofar", [700, 1500], "Mult spațiu încălțăminte.\nBalans ușor dacă nu e fixat de perete.\nBălți."],
    ["Saltea 180x200 medie fermitate", [2800, 5200], "Folosită 3 ani, husă detașabilă spălată.\nFără pete mari.\nRidicare etaj 4."],
    ["Fotoliu piele ecologică", [1200, 2600], "Crăpături fine pe brațe — uz normal.\nConfort bun pentru citit.\n[URGENT] eliberare cameră."],
    ["Măsuță cafea sticlă", [400, 900], "Formă dreptunghi, colțuri rotunjite.\nZgârieturi sticlă fine.\nOrhei."],
    ["Dulap copii multicolor", [1600, 3200], "Rafturi mici, sertare siguranță copii.\nMontaj instrucțiuni în română google.\nChișinău."],
    ["Separatoare cameră tip paravan", [500, 1100], "Textil, 3 panouri.\nIdeal garsonieră.\nUșor murdar jos — spălat."],
    ["Taburet baie antiderapant", [80, 200], "Plastic, greutate suport ok.\nCuloare albă îngălbenită.\nBonus la alt mobilier."],
    ["Pat supraetajat copii", [3200, 5800], "Scară laterală, spațiu sub pat depozit.\nBare siguranță incluse.\nDemontat parțial."],
    ["Masa birou reglabil electric", [4200, 7800], "Motor merge, memorie 2 înălțimi.\nBlat zgâriat — suport monitor recomand.\nGreu."],
    ["Scaun ergonomic second", [1400, 2800], "Lombar reglabil, roți parchet ok.\nTapițerie uzată pe cotiere.\nNegociabil."],
    ["Bufet sufragerie vintage", [2200, 4500], "Lemn masiv greu.\nSertar unul lipsește — preț mic.\nIubitori antichități."],
    ["Raft pantofi tip turn", [300, 700], "10 nivele, metal.\nInstabil dacă nu e fixat de perete.\nCahul."],
    ["Canapea 2 locuri piele", [3800, 6800], "Crăpături mici piele naturală.\nConfort ferm.\nTransport voi găsi platformă."],
    ["Masa picnic pliabilă", [350, 800], "Aluminiu, ușoară.\nZgârieturi picioare.\nIdeal grădină."],
  ],
};

const categories = ["Telefoane", "Mașini", "Electronice", "Haine", "Electrocasnice", "Mobilă"];
const listings = [];

let idx = 0;
for (const cat of categories) {
  const rows = blocks[cat];
  for (let j = 0; j < rows.length; j++) {
    const [titleBase, [pMin, pMax], descBase] = rows[j];
    const loc = locations[(idx + j * 3) % locations.length];
    let price = priceBetween(idx * 31 + j * 7, pMin, pMax);
    if (idx % 11 === 0) price = Math.round((price * 0.88) / 50) * 50;
    if (idx % 14 === 0) price = Math.round((price * 1.12) / 50) * 50;

    let title = titleBase;
    if (idx % 17 === 0) title = `[URGENT] ${title}`;
    else if (idx % 19 === 0) title = `${title} — negociabil`;

    let description = descBase;
    if (idx % 23 === 0 && !/negociabil/i.test(title + description)) description += "\nPreț negociabil dacă sunteți serioși.";
    if (idx % 29 === 0 && !/urgent/i.test(title)) description += "\nRog urgent, eliberez spațiul până duminică.";
    if (idx % 7 === 0) description = description.replace(/\bfoarte\b/gi, () => (rnd(idx) > 0.5 ? "foarte" : "foarte foarte"));
    if (idx % 11 === 0) description = description.replace(/\bsaptamana\b/gi, "saptamina");

    listings.push({
      title: title.trim(),
      description: description.replace(/\n\n\n+/g, "\n\n").trim(),
      price,
      location: loc,
      category: cat,
      images: imagesFor(idx),
    });
    idx++;
  }
}

const outPath = new URL("../data/vex-sample-listings-150.json", import.meta.url);
fs.mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(listings, null, 2), "utf8");
console.log("Wrote", listings.length, "listings to", outPath.pathname || outPath);
