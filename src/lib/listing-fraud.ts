export type FraudRiskLevel = "low" | "medium" | "high";

export type ListingFraudInput = {
  title: string;
  description: string;
  price: number;
  brand?: string | null;
  modelName?: string | null;
  city?: string | null;
  phone?: string | null;
};

export type ListingFraudResult = {
  level: FraudRiskLevel;
  score: number;
  reasons: string[];
};

const SUSPICIOUS_TERMS = [
  "urgent",
  "whatsapp only",
  "advance payment",
  "deposit first",
  "western union",
  "crypto only",
  "gift card",
  "no checks",
  "act now",
  "limited offer",
  "telegram only",
  "contact outside",
];

export function evaluateListingFraudRisk(input: ListingFraudInput): ListingFraudResult {
  let score = 0;
  const reasons: string[] = [];
  const title = input.title.trim();
  const description = input.description.trim();
  const joined = `${title} ${description}`.toLowerCase();

  if (title.length > 0 && title.length < 8) {
    score += 20;
    reasons.push("Titlu prea scurt.");
  }

  if (description.length > 0 && description.length < 25) {
    score += 25;
    reasons.push("Descriere prea scurtă.");
  }

  if (description.length > 0 && description.length < 60 && !input.phone?.trim()) {
    score += 15;
    reasons.push("Descriere minimă fără date clare de contact.");
  }

  if (input.price > 0 && input.price < 50) {
    score += 20;
    reasons.push("Preț neobișnuit de mic.");
  }

  for (const term of SUSPICIOUS_TERMS) {
    if (joined.includes(term)) {
      score += 20;
      reasons.push(`Termen suspect detectat: "${term}".`);
      break;
    }
  }

  const exclamations = (description.match(/!/g) ?? []).length + (title.match(/!/g) ?? []).length;
  if (exclamations >= 5) {
    score += 10;
    reasons.push("Exces de semne de exclamare.");
  }

  const uppercaseRatio = (() => {
    const letters = joined.replace(/[^a-zA-Z]/g, "");
    if (!letters) return 0;
    const upper = letters.replace(/[^A-Z]/g, "");
    return upper.length / letters.length;
  })();
  if (uppercaseRatio > 0.5) {
    score += 10;
    reasons.push("Text predominant cu majuscule.");
  }

  const level: FraudRiskLevel = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return { level, score, reasons };
}

