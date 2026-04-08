#!/usr/bin/env bun

/**
 * Compatibility (Synastry) Analysis — Ashtakoota Guna Matching
 *
 * Compares two natal charts using the traditional 8-fold (Ashtakoota)
 * compatibility system with Guna (quality) point scoring out of 36.
 * Also checks for Mangal Dosha (Mars affliction in marriage houses).
 */

import { readFileSync, existsSync } from "fs";

interface Args {
  chart1: string;
  chart2: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    parsed[key] = args[i + 1];
  }

  if (!parsed.chart1 || !parsed.chart2) {
    console.log("Usage: bun compatibility.ts --chart1 <path1.json> --chart2 <path2.json>");
    console.log("\nRequired:");
    console.log("  --chart1 PATH            First person's chart JSON");
    console.log("  --chart2 PATH            Second person's chart JSON");
    console.log("\nExamples:");
    console.log('  bun scripts/compatibility.ts --chart1 "Charts/person1.json" --chart2 "Charts/person2.json"');
    console.log("\nIncludes:");
    console.log("  • Ashtakoota (8-fold) Guna matching (out of 36 points)");
    console.log("  • Mangal Dosha check for both charts");
    console.log("  • Nadi, Bhakuta, Gana, Yoni, and more");
    process.exit(1);
  }

  return parsed as Args;
}

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

// Gana classification (Deva=divine, Manushya=human, Rakshasa=demon)
const NAKSHATRA_GANA: Record<string, string> = {};
const DEVA = [0, 4, 6, 7, 12, 16, 20, 21, 26]; // 0-indexed nakshatra indices
const MANUSHYA = [1, 3, 5, 10, 11, 14, 15, 19, 24];
const RAKSHASA = [2, 8, 9, 13, 17, 18, 22, 23, 25];
DEVA.forEach((i) => NAKSHATRA_GANA[NAKSHATRAS[i]] = "Deva");
MANUSHYA.forEach((i) => NAKSHATRA_GANA[NAKSHATRAS[i]] = "Manushya");
RAKSHASA.forEach((i) => NAKSHATRA_GANA[NAKSHATRAS[i]] = "Rakshasa");

// Yoni (animal nature) classification
const NAKSHATRA_YONI: string[] = [
  "Horse", "Elephant", "Goat", "Serpent", "Dog", "Cat",
  "Cat", "Goat", "Cat", "Rat", "Rat", "Cow",
  "Buffalo", "Tiger", "Buffalo", "Tiger", "Hare", "Deer",
  "Dog", "Monkey", "Mongoose", "Monkey", "Lion", "Horse",
  "Lion", "Cow", "Elephant",
];

// Nadi classification (Adi=Vata, Madhya=Pitta, Antya=Kapha)
const NAKSHATRA_NADI: string[] = [
  "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
  "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
  "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
  "Adi", "Madhya", "Antya", "Antya", "Madhya", "Adi",
  "Adi", "Madhya", "Antya",
];

function getNakshatraIndex(name: string): number {
  const lower = name.toLowerCase();
  return NAKSHATRAS.findIndex((n) => lower.includes(n.toLowerCase().split(" ")[0]));
}

function getSignIndex(name: string): number {
  return SIGNS.findIndex((s) => s.toLowerCase() === name.toLowerCase());
}

function extractMoonData(data: any): { sign: string; nakshatra: string; house: number } | null {
  const houses = data.d1Chart?.houses || [];
  for (const h of houses) {
    for (const occ of h.occupants || []) {
      if (occ && typeof occ === "object" && occ.celestialBody === "Moon") {
        const nak = typeof occ.nakshatra === "string" ? occ.nakshatra : occ.nakshatra?.name || "";
        return { sign: h.sign, nakshatra: nak, house: h.number };
      }
    }
  }
  return null;
}

function checkMangalDosha(data: any): { hasMangalDosha: boolean; details: string } {
  const houses = data.d1Chart?.houses || [];
  const MANGAL_HOUSES = [1, 2, 4, 7, 8, 12]; // Mars in these houses = Dosha

  for (const h of houses) {
    for (const occ of h.occupants || []) {
      if (occ && typeof occ === "object" && occ.celestialBody === "Mars") {
        if (MANGAL_HOUSES.includes(h.number)) {
          return {
            hasMangalDosha: true,
            details: `Mars in House ${h.number} (${h.sign})`,
          };
        }
        return {
          hasMangalDosha: false,
          details: `Mars in House ${h.number} (${h.sign}) — no Mangal Dosha`,
        };
      }
    }
  }
  return { hasMangalDosha: false, details: "Mars position not found" };
}

// ── Ashtakoota Matching Functions ──

function varaScore(nak1: number, nak2: number): { score: number; max: number; name: string; detail: string } {
  // Varna: Brahmin(3) > Kshatriya(2) > Vaishya(1) > Shudra(0)
  const varnaMap = [1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3];
  const v1 = varnaMap[nak1 % 27];
  const v2 = varnaMap[nak2 % 27];
  const varnaNames = ["Shudra", "Vaishya", "Kshatriya", "Brahmin"];
  const score = v1 >= v2 ? 1 : 0;
  return { score, max: 1, name: "Varna (Caste)", detail: `${varnaNames[v1]} × ${varnaNames[v2]}` };
}

function vashyaScore(sign1: number, sign2: number): { score: number; max: number; name: string; detail: string } {
  // Simplified Vashya logic
  if (sign1 === sign2) return { score: 2, max: 2, name: "Vashya (Dominance)", detail: "Same sign — full harmony" };
  // Friendly signs
  const friends: Record<number, number[]> = {
    0: [4, 8], 1: [2, 6, 11], 2: [1, 4, 7], 3: [8, 10], 4: [0, 8],
    5: [1, 2, 11], 6: [1, 5, 11], 7: [0, 3, 9], 8: [0, 3, 4],
    9: [1, 5, 10], 10: [3, 5, 9], 11: [1, 6, 10],
  };
  const isFriendly = (friends[sign1] || []).includes(sign2);
  return { score: isFriendly ? 1 : 0, max: 2, name: "Vashya (Dominance)", detail: isFriendly ? "Compatible signs" : "Incompatible signs" };
}

function taraScore(nak1: number, nak2: number): { score: number; max: number; name: string; detail: string } {
  const diff = ((nak2 - nak1 + 27) % 27) % 9;
  const auspicious = [1, 2, 4, 6, 8]; // (0-indexed tara positions that are good)
  const score = auspicious.includes(diff) ? 3 : 0;
  const taraNames = ["Janma", "Sampat", "Vipat", "Kshema", "Pratyari", "Sadhana", "Naidhana", "Mitra", "Ati-Mitra"];
  return { score, max: 3, name: "Tara (Destiny)", detail: `Tara: ${taraNames[diff] || "?"}` };
}

function yoniScore(nak1: number, nak2: number): { score: number; max: number; name: string; detail: string } {
  const y1 = NAKSHATRA_YONI[nak1];
  const y2 = NAKSHATRA_YONI[nak2];
  let score = 0;
  if (y1 === y2) score = 4;
  else {
    // Enemy yonis
    const enemies: Record<string, string> = {
      Cat: "Rat", Rat: "Cat", Elephant: "Lion", Lion: "Elephant",
      Horse: "Buffalo", Buffalo: "Horse", Dog: "Hare", Hare: "Dog",
      Serpent: "Mongoose", Mongoose: "Serpent", Monkey: "Goat", Goat: "Monkey",
    };
    if (enemies[y1] === y2) score = 0;
    else score = 2;
  }
  return { score, max: 4, name: "Yoni (Sexual)", detail: `${y1} × ${y2}` };
}

function grahaMaitriScore(sign1: number, sign2: number): { score: number; max: number; name: string; detail: string } {
  const lords = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
  const lord1 = lords[sign1];
  const lord2 = lords[sign2];
  const friendships: Record<string, string[]> = {
    Sun: ["Moon", "Mars", "Jupiter"],
    Moon: ["Sun", "Mercury"],
    Mars: ["Sun", "Moon", "Jupiter"],
    Mercury: ["Sun", "Venus"],
    Jupiter: ["Sun", "Moon", "Mars"],
    Venus: ["Mercury", "Saturn"],
    Saturn: ["Mercury", "Venus"],
  };
  const isFriend1 = (friendships[lord1] || []).includes(lord2);
  const isFriend2 = (friendships[lord2] || []).includes(lord1);
  let score = 0;
  if (isFriend1 && isFriend2) score = 5;
  else if (isFriend1 || isFriend2) score = 3;
  else if (lord1 === lord2) score = 5;

  return { score, max: 5, name: "Graha Maitri (Friendship)", detail: `${lord1} × ${lord2}` };
}

function ganaScore(nak1: number, nak2: number): { score: number; max: number; name: string; detail: string } {
  const g1 = NAKSHATRA_GANA[NAKSHATRAS[nak1]] || "?";
  const g2 = NAKSHATRA_GANA[NAKSHATRAS[nak2]] || "?";
  let score = 0;
  if (g1 === g2) score = 6;
  else if ((g1 === "Deva" && g2 === "Manushya") || (g1 === "Manushya" && g2 === "Deva")) score = 5;
  else if ((g1 === "Deva" && g2 === "Rakshasa") || (g1 === "Rakshasa" && g2 === "Deva")) score = 0;
  else score = 1;
  return { score, max: 6, name: "Gana (Temperament)", detail: `${g1} × ${g2}` };
}

function bhakutaScore(sign1: number, sign2: number): { score: number; max: number; name: string; detail: string } {
  const diff = ((sign2 - sign1 + 12) % 12) + 1;
  // Favorable: 1st, 3rd, 4th, 7th, 10th, 11th
  const favorable = [1, 3, 4, 7, 10, 11];
  const score = favorable.includes(diff) ? 7 : 0;
  return { score, max: 7, name: "Bhakuta (Moon Sign)", detail: `${diff}/${13 - diff} relationship` };
}

function nadiScore(nak1: number, nak2: number): { score: number; max: number; name: string; detail: string } {
  const n1 = NAKSHATRA_NADI[nak1];
  const n2 = NAKSHATRA_NADI[nak2];
  const nadiNames: Record<string, string> = { Adi: "Vata (Wind)", Madhya: "Pitta (Bile)", Antya: "Kapha (Phlegm)" };
  const score = n1 !== n2 ? 8 : 0;
  return { score, max: 8, name: "Nadi (Health)", detail: `${nadiNames[n1] || n1} × ${nadiNames[n2] || n2}${n1 === n2 ? " ⚠️ SAME — Nadi Dosha!" : ""}` };
}

function main() {
  console.log("💞 Vedic Compatibility (Ashtakoota) Analysis\n");

  const args = parseArgs();

  if (!existsSync(args.chart1)) { console.error(`❌ File not found: ${args.chart1}`); process.exit(1); }
  if (!existsSync(args.chart2)) { console.error(`❌ File not found: ${args.chart2}`); process.exit(1); }

  const data1 = JSON.parse(readFileSync(args.chart1, "utf-8"));
  const data2 = JSON.parse(readFileSync(args.chart2, "utf-8"));

  const p1 = data1.person?.name || "Person 1";
  const p2 = data2.person?.name || "Person 2";

  console.log(`👤 ${p1} × 👤 ${p2}\n`);

  // Extract Moon data
  const moon1 = extractMoonData(data1);
  const moon2 = extractMoonData(data2);

  if (!moon1 || !moon2) {
    console.error("❌ Could not find Moon position in one or both charts.");
    process.exit(1);
  }

  console.log("## Moon Positions");
  console.log(`  ${p1}: ${moon1.sign} — Nakshatra: ${moon1.nakshatra}`);
  console.log(`  ${p2}: ${moon2.sign} — Nakshatra: ${moon2.nakshatra}\n`);

  const nak1 = getNakshatraIndex(moon1.nakshatra);
  const nak2 = getNakshatraIndex(moon2.nakshatra);
  const sign1 = getSignIndex(moon1.sign);
  const sign2 = getSignIndex(moon2.sign);

  if (nak1 < 0 || nak2 < 0) {
    console.error(`⚠️ Could not identify nakshatra indices (got: "${moon1.nakshatra}", "${moon2.nakshatra}")`);
    console.error("   Compatibility scoring may be inaccurate.\n");
  }

  // ── Ashtakoota Scoring ──
  const kutas = [
    varaScore(nak1, nak2),
    vashyaScore(sign1, sign2),
    taraScore(nak1, nak2),
    yoniScore(nak1, nak2),
    grahaMaitriScore(sign1, sign2),
    ganaScore(nak1, nak2),
    bhakutaScore(sign1, sign2),
    nadiScore(nak1, nak2),
  ];

  console.log("## Ashtakoota (8-Fold) Guna Matching");
  console.log("═".repeat(75));
  console.log(`  ${"Kuta".padEnd(28)} ${"Score".padEnd(12)} ${"Detail"}`);
  console.log("─".repeat(75));

  let totalScore = 0;
  let totalMax = 0;

  for (const kuta of kutas) {
    totalScore += kuta.score;
    totalMax += kuta.max;
    const bar = "●".repeat(kuta.score) + "○".repeat(kuta.max - kuta.score);
    console.log(`  ${kuta.name.padEnd(28)} ${`${kuta.score}/${kuta.max}`.padEnd(6)} ${bar.padEnd(10)} ${kuta.detail}`);
  }

  console.log("─".repeat(75));
  console.log(`  ${"TOTAL".padEnd(28)} ${`${totalScore}/${totalMax}`.padEnd(6)}`);
  console.log("═".repeat(75));

  // Overall assessment
  const pct = Math.round((totalScore / totalMax) * 100);
  let verdict = "";
  let emoji = "";
  if (totalScore >= 28) { verdict = "Excellent Match — highly recommended"; emoji = "💚"; }
  else if (totalScore >= 21) { verdict = "Good Match — favorable for marriage"; emoji = "💛"; }
  else if (totalScore >= 18) { verdict = "Average Match — manageable with adjustments"; emoji = "🟠"; }
  else { verdict = "Below Average — requires careful consideration and remedies"; emoji = "🔴"; }

  console.log(`\n${emoji} Overall: ${totalScore}/36 points (${pct}%) — ${verdict}\n`);

  // Minimum threshold
  if (totalScore < 18) {
    console.log("  ⚠️  Traditional minimum for marriage is 18/36 Gunas.");
    console.log("     Consult an experienced astrologer for remedial measures.\n");
  }

  // ── Mangal Dosha Check ──
  console.log("## Mangal Dosha (Mars Affliction) Check");
  const md1 = checkMangalDosha(data1);
  const md2 = checkMangalDosha(data2);

  console.log(`  ${p1}: ${md1.hasMangalDosha ? "⚠️ Mangal Dosha present" : "✅ No Mangal Dosha"} — ${md1.details}`);
  console.log(`  ${p2}: ${md2.hasMangalDosha ? "⚠️ Mangal Dosha present" : "✅ No Mangal Dosha"} — ${md2.details}`);

  if (md1.hasMangalDosha && md2.hasMangalDosha) {
    console.log("\n  ✅ Both charts have Mangal Dosha — this cancels out the negative effect (Dosha Samya).");
  } else if (md1.hasMangalDosha || md2.hasMangalDosha) {
    console.log("\n  ⚠️  Only one chart has Mangal Dosha. Remedies recommended:");
    console.log("     • Kumbh Vivah (symbolic marriage to a clay pot)");
    console.log("     • Mangal Dosha matching with person having similar affliction");
    console.log("     • Hanuman Chalisa recitation on Tuesdays");
  }

  // Nadi Dosha warning
  const nadiResult = kutas[7];
  if (nadiResult.score === 0) {
    console.log("\n## ⚠️ Nadi Dosha Alert");
    console.log("  Both persons share same Nadi — considered most serious dosha in matching.");
    console.log("  Traditional belief: may cause health issues in offspring.");
    console.log("  Remedies: Nadi Nivarana Puja, charity on auspicious days,");
    console.log("  or cancellation if other factors are strong (28+ total gunas).\n");
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log("📖 Based on Ashtakoota system from Brihat Parashara Hora Shastra");
  console.log("🔮 This is a traditional compatibility assessment. Modern relationships");
  console.log("   involve many factors beyond astrological matching.\n");
}

main();
