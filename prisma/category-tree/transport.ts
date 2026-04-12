import type { CatDef } from "./types";
import { leaf, section } from "./types";

const P = "transport";

export const transportRoot: CatDef = {
  slug: "transport",
  ro: "Transport",
  ru: "Транспорт",
  en: "Transport",
  children: [
    section(P, "mijloace", "Mijloace de transport", [
      leaf(P, "autoturisme", "Autoturisme", "Легковые автомобили", "Cars"),
      leaf(P, "microbuze", "Microbuze și furgonete", "Микроавтобусы", "Vans"),
      leaf(P, "camioane", "Camioane", "Грузовики", "Trucks"),
      leaf(P, "autobuze", "Autobuze", "Автобусы", "Buses"),
      leaf(P, "motociclete", "Motociclete și scutere", "Мотоциклы", "Motorcycles"),
      leaf(P, "atv", "ATV / UTV", "Квадроциклы", "ATV"),
      leaf(P, "barci", "Bărci și ambarcațiuni", "Лодки", "Boats"),
    ]),
    section(P, "alte-mijloace", "Alte tipuri de transport", [
      leaf(P, "tehnica-agricola", "Tehnică agricolă", "Сельхозтехника", "Farm equipment"),
      leaf(P, "tehnica-speciala", "Tehnică specializată", "Спецтехника", "Special equipment"),
      leaf(P, "remorci", "Remorci și rulote", "Прицепы", "Trailers"),
      leaf(P, "constructii-mech", "Tehnică pentru construcții", "Стройтехника", "Construction equipment"),
      leaf(P, "epoca", "Automobile de epocă", "Ретро-авто", "Classic cars"),
      leaf(P, "electrice", "Vehicule electrice", "Электротранспорт", "Electric vehicles"),
    ]),
    section(P, "accesorii", "Accesorii auto", [
      leaf(P, "acc-salon", "Accesorii pentru salon", "Салон", "Interior accessories"),
      leaf(P, "covorase", "Covorașe", "Коврики", "Floor mats"),
      leaf(P, "vopsea", "Vopsea auto", "Краска", "Car paint"),
      leaf(P, "ajutor-tehnic", "Ajutor tehnic / tractare", "Техпомощь", "Roadside"),
      leaf(P, "caroserie-acc", "Accesorii caroserie", "Кузов", "Body accessories"),
      leaf(P, "anvelope", "Anvelope și jante", "Шины и диски", "Tires & rims"),
    ]),
    section(P, "scule", "Scule și echipamente speciale", [
      leaf(P, "chei", "Chei dinamometrice / chei", "Ключи", "Wrenches"),
      leaf(P, "cricuri", "Cricuri auto", "Домкраты", "Jacks"),
      leaf(P, "compresoare", "Compresoare auto", "Компрессоры", "Compressors"),
      leaf(P, "diagnostic", "Echipamente diagnostic", "Диагностика", "Diagnostics"),
    ]),
    section(P, "servicii-transport", "Servicii auto și transport", [
      leaf(P, "autoservice", "Autoservice", "Автосервис", "Car service"),
      leaf(P, "transport-marfa", "Transport de mărfuri", "Грузоперевозки", "Freight"),
      leaf(P, "livrare", "Livrare din magazine", "Доставка", "Delivery"),
      leaf(P, "inchirieri", "Închirieri auto", "Прокат авто", "Car rental"),
      leaf(P, "spalatorie", "Spălătorie auto", "Автомойка", "Car wash"),
    ]),
    section(P, "cosmetice-caroserie", "Cosmetice curățare caroserie", [
      leaf(P, "sampon-auto", "Șampon auto", "Шампунь", "Car shampoo"),
      leaf(P, "detergenti", "Detergenți caroserie", "Моющие", "Detergents"),
      leaf(P, "ceara", "Ceară și polish", "Воск", "Wax"),
    ]),
    section(P, "piese", "Piese și accesorii auto", [
      leaf(P, "piese-motor", "Motor și piese motor", "Двигатель", "Engine parts"),
      leaf(P, "piese-transmisie", "Transmisie", "Трансмиссия", "Transmission"),
      leaf(P, "piese-frane", "Frâne", "Тормоза", "Brakes"),
      leaf(P, "piese-suspensie", "Suspensie și direcție", "Подвеска", "Suspension"),
      leaf(P, "piese-electrice", "Instalație electrică", "Электрика", "Electrical"),
      leaf(P, "piese-caroserie", "Caroserie", "Кузовные детали", "Body parts"),
      leaf(P, "filtre-ulei", "Filtre, uleiuri, lichide", "Фильтры и жидкости", "Filters & fluids"),
    ]),
  ],
};
