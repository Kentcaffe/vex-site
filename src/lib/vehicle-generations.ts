/**
 * Generații per marcă+model (extensibil). Dacă lipsește perechea, UI oferă o singură opțiune generică.
 */
const MAP: Record<string, Record<string, readonly string[]>> = {
  Volvo: {
    XC40: ["I (2017–prezent)"],
    XC60: ["I (2008–2017)", "II (2017–prezent)"],
    XC90: ["I (2002–2014)", "II (2014–prezent)"],
  },
  Dacia: {
    Logan: ["I", "II", "III"],
    Sandero: ["I", "II", "III"],
    Duster: ["I", "II"],
    Spring: ["I"],
    Jogger: ["I"],
  },
  Toyota: {
    Corolla: ["E120", "E140", "E160", "E170", "E210"],
    Camry: ["XV40", "XV50", "XV70"],
    RAV4: ["III", "IV", "V"],
    Yaris: ["XP90", "XP130", "XP150", "XP210"],
  },
  Volkswagen: {
    Golf: ["Mk4", "Mk5", "Mk6", "Mk7", "Mk8"],
    Polo: ["IV", "V", "VI"],
    Passat: ["B6", "B7", "B8"],
    Tiguan: ["I", "II"],
  },
  BMW: {
    "Seria 3": ["E46", "E90", "F30", "G20"],
    "Seria 5": ["E60", "F10", "G30"],
    X5: ["E53", "E70", "F15", "G05"],
    X3: ["E83", "F25", "G01"],
  },
  "Mercedes-Benz": {
    "Clasa C": ["W203", "W204", "W205", "W206"],
    "Clasa E": ["W211", "W212", "W213"],
    GLC: ["X253", "X254"],
  },
  Audi: {
    A4: ["B6", "B7", "B8", "B9"],
    A6: ["C6", "C7", "C8"],
    Q5: ["I", "II"],
  },
  Renault: {
    Clio: ["III", "IV", "V"],
    Megane: ["III", "IV"],
    Captur: ["I", "II"],
  },
  Skoda: {
    Octavia: ["I", "II", "III", "IV"],
    Fabia: ["I", "II", "III", "IV"],
    Superb: ["I", "II", "III"],
  },
};

export function getGenerationOptions(brand: string, model: string): string[] {
  const b = brand.trim();
  const m = model.trim();
  if (!b || !m) {
    return ["n_a"];
  }
  const byBrand = MAP[b];
  if (!byBrand) {
    return ["n_a"];
  }
  const gens = byBrand[m];
  if (!gens?.length) {
    return ["n_a"];
  }
  return [...gens];
}
