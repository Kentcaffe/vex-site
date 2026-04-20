/** Emoji pentru rădăcini (sidebar / explorer). */
export const CATEGORY_ROOT_EMOJI: Record<string, string> = {
  transport: "🚗",
  imobiliare: "🏠",
  electronice: "📱",
  "casa-gradina": "🛋️",
  moda: "👕",
  "sport-hobby": "⚽",
  animale: "🐾",
  agricol: "🌾",
  business: "🏭",
  joburi: "💼",
  servicii: "🔧",
  "mama-copil": "👶",
  diverse: "📦",
};

const SUB_HINTS: { test: RegExp; emoji: string }[] = [
  { test: /camioane|camion/i, emoji: "🚛" },
  { test: /autoturisme|microbuze|autobuze|epoca|electrice/i, emoji: "🚙" },
  { test: /moto|scuter|atv/i, emoji: "🏍️" },
  { test: /barca|ambarcatiuni/i, emoji: "⛵" },
  { test: /remorc|rulot/i, emoji: "🚚" },
  { test: /piese|motor|transmisie|frane|suspensie|caroserie|filtre/i, emoji: "🔩" },
  { test: /accesorii|covoras|vopsea|anvelope/i, emoji: "🛞" },
  { test: /scule|chei|cric|compresor|diagnostic/i, emoji: "🔧" },
  { test: /autoservice|tractari|inchirieri|spalatorie|transport-marfa|livrare/i, emoji: "🛠️" },
  { test: /sampon|detergent|ceara|polish/i, emoji: "✨" },
  { test: /apartament|garsonier|case-|camere/i, emoji: "🏢" },
  { test: /teren|padure|agricol/i, emoji: "🌳" },
  { test: /birou|comercial|depozit|hotel/i, emoji: "🏪" },
  { test: /garaj|parcare/i, emoji: "🅿️" },
  { test: /agentii|evaluari|design/i, emoji: "📋" },
  { test: /telefoane|smartphone|tableta|smartwatch/i, emoji: "📲" },
  { test: /laptop|pc-|monitor|componente|periferice|imprimante|retea/i, emoji: "💻" },
  { test: /foto|obiective|drona/i, emoji: "📷" },
  { test: /casti|boxe|playere|console|jocuri/i, emoji: "🎮" },
  { test: /electrocasnice|bucatarie|aspirator/i, emoji: "🔌" },
  { test: /mobila|canapele|dormitor|depozitare/i, emoji: "🪑" },
  { test: /materiale|unelte|sanitare|electrica|gips/i, emoji: "🧱" },
  { test: /gradina|gratar|terasa/i, emoji: "🌿" },
  { test: /perdele|covor|luminat/i, emoji: "💡" },
  { test: /barbati|femei|haine|incalt/i, emoji: "🧥" },
  { test: /fitness|biciclete|trotinete|fotbal|tenis|iarna|outdoor|corturi|drumetii/i, emoji: "🎯" },
  { test: /numismatica|machete/i, emoji: "🪙" },
  { test: /caini|pisici|pasari|rozatoare|flori|pomi|dresaj|vet/i, emoji: "🐕" },
  { test: /cereale|furaje|seminte|vite|oi|porci|tractoare|cositoare/i, emoji: "🚜" },
  { test: /carucior|scaun-auto|jucarii|biberoane|alaptare/i, emoji: "🍼" },
  { test: /muzica|instrumente|tablouri|handmade|ceasuri|bijuterii/i, emoji: "🎨" },
  { test: /reparatii|vulcanizare|zugravi|faianta|electrician|it-|site|grafica/i, emoji: "⚙️" },
  { test: /coafor|cosmetic|masaj|curatenie|spalatorie/i, emoji: "💅" },
  { test: /meditatii|cursuri|foto-video|muzica/i, emoji: "📚" },
  { test: /administrativ|vanzari|contabilitate|operator|sofer|depozit|horeca|retail|ingrijire/i, emoji: "📎" },
  { test: /linii-productie|generatoare|stocuri/i, emoji: "📊" },
];

export function emojiForRootSlug(slug: string): string {
  return CATEGORY_ROOT_EMOJI[slug] ?? "📁";
}

/** Emoji secundar pentru orice slug de categorie (subcategorii). */
export function emojiForCategorySlug(slug: string): string {
  if (CATEGORY_ROOT_EMOJI[slug]) {
    return CATEGORY_ROOT_EMOJI[slug];
  }
  for (const { test, emoji } of SUB_HINTS) {
    if (test.test(slug)) {
      return emoji;
    }
  }
  const prefixRoots: [string, string][] = [
    ["transport-", "🚗"],
    ["imobiliare-", "🏠"],
    ["electronice-", "📱"],
    ["casa-", "🛋️"],
    ["moda-", "👕"],
    ["sport-", "⚽"],
    ["animale-", "🐾"],
    ["agricol-", "🌾"],
    ["business-", "🏭"],
    ["joburi-", "💼"],
    ["servicii-", "🔧"],
    ["mama-copil-", "👶"],
    ["diverse-", "📦"],
  ];
  for (const [prefix, emoji] of prefixRoots) {
    if (slug.startsWith(prefix)) {
      return emoji;
    }
  }
  return "▸";
}
