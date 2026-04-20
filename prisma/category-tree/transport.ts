import type { CatDef } from "./types";
import { leaf, section } from "./types";

const P = "transport";

export const transportRoot: CatDef = {
  slug: "transport",
  ro: "Transport",
  ru: "Транспорт",
  en: "Transport",
  children: [
    section(P, "mijloace", "Autovehicule", [
      leaf(P, "autoturisme", "Autoturisme", "Легковые автомобили", "Cars"),
      leaf(P, "microbuze", "Microbuze și furgonete", "Микроавтобусы", "Vans"),
      leaf(P, "camioane", "Camioane", "Грузовики", "Trucks"),
      leaf(P, "autobuze", "Autobuze", "Автобусы", "Buses"),
      leaf(P, "motociclete", "Motociclete și scutere", "Мотоциклы", "Motorcycles"),
      leaf(P, "atv", "ATV / UTV", "Квадроциклы", "ATV"),
      leaf(P, "barci", "Bărci și ambarcațiuni", "Лодки", "Boats"),
      leaf(P, "epoca", "Automobile de epocă / clasice", "Ретро-авто", "Classic cars"),
      leaf(P, "electrice", "Vehicule electrice și hibride", "Электротранспорт", "Electric vehicles"),
    ]),
    section(P, "agricol-industrial", "Utilaje agricole și construcții", [
      leaf(P, "tehnica-agricola", "Utilaje agricole", "Сельхозтехника", "Farm equipment"),
      leaf(P, "constructii-mech", "Utilaje pentru construcții", "Стройтехника", "Construction equipment"),
      leaf(P, "tehnica-speciala", "Tehnică specializată", "Спецтехника", "Special equipment"),
    ]),
    section(P, "remorci-rulote", "Remorci, semiremorci, rulote", [
      leaf(P, "remorci-auto", "Remorci auto", "Прицепы", "Trailers"),
      leaf(P, "rulote", "Rulote și autorulote", "Кемперы", "Caravans"),
    ]),
    section(P, "piese", "Piese auto", [
      leaf(P, "piese-motor", "Motor și piese motor", "Двигатель", "Engine parts"),
      leaf(P, "piese-transmisie", "Transmisie", "Трансмиссия", "Transmission"),
      leaf(P, "piese-frane", "Frâne", "Тормоза", "Brakes"),
      leaf(P, "piese-suspensie", "Suspensie și direcție", "Подвеска", "Suspension"),
      leaf(P, "piese-electrice", "Instalație electrică", "Электрика", "Electrical"),
      leaf(P, "piese-caroserie", "Caroserie", "Кузовные детали", "Body parts"),
      leaf(P, "filtre-ulei", "Filtre, uleiuri, lichide tehnice", "Фильтры и жидкости", "Filters & fluids"),
      leaf(P, "esapament", "Eșapamente și tuning motor", "Выхлоп", "Exhaust"),
    ]),
    section(P, "accesorii", "Accesorii auto", [
      leaf(P, "acc-salon", "Accesorii interior", "Салон", "Interior accessories"),
      leaf(P, "covorase", "Covorașe", "Коврики", "Floor mats"),
      leaf(P, "vopsea", "Vopsea și cosmetice caroserie", "Краска", "Car paint"),
      leaf(P, "caroserie-acc", "Bare portbagaj, ornamente", "Кузов", "Body accessories"),
      leaf(P, "anvelope", "Anvelope și jante", "Шины и диски", "Tires & rims"),
      leaf(P, "acustica", "Sisteme audio auto", "Автозвук", "Car audio"),
    ]),
    section(P, "scule", "Scule și echipamente service", [
      leaf(P, "chei", "Chei dinamometrice, truse", "Ключи", "Wrenches"),
      leaf(P, "cricuri", "Cricuri și sustinere", "Домкраты", "Jacks"),
      leaf(P, "compresoare", "Compresoare", "Компрессоры", "Compressors"),
      leaf(P, "diagnostic", "Echipamente diagnoză OBD", "Диагностика", "Diagnostics"),
    ]),
    section(P, "servicii-transport", "Servicii auto și transport", [
      leaf(P, "autoservice", "Autoservice și mecanică", "Автосервис", "Car service"),
      leaf(P, "transport-marfa", "Transport mărfuri", "Грузоперевозки", "Freight"),
      leaf(P, "livrare", "Livrări și curierat", "Доставка", "Delivery"),
      leaf(P, "inchirieri", "Închirieri auto", "Прокат авто", "Car rental"),
      leaf(P, "spalatorie", "Spălătorie și detailing", "Автомойка", "Car wash"),
      leaf(P, "tractari", "Tractări și remorcări", "Эвакуатор", "Towing"),
    ]),
    section(P, "cosmetice-caroserie", "Îngrijire și protecție", [
      leaf(P, "sampon-auto", "Șampon și spumă auto", "Шампунь", "Car shampoo"),
      leaf(P, "detergenti", "Detergenți și degresanți", "Моющие", "Detergents"),
      leaf(P, "ceara", "Ceară, polish, ceramică", "Воск", "Wax & polish"),
    ]),
  ],
};
