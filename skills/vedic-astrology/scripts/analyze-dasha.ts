#!/usr/bin/env bun

/**
 * Analyze Vimshottari Dasha (Planetary Period) from a generated chart
 *
 * Shows current Mahadasha → Antardasha → Pratyantardasha,
 * upcoming periods, and interpretive guidance based on the
 * dasha lord's house placement and lordship.
 */

import { readFileSync, existsSync } from "fs";

interface Args {
  chart: string;
  date?: string;
  period?: "current" | "next-year" | "all";
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: any = { period: "current" };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    parsed[key] = args[i + 1];
  }

  if (!parsed.chart) {
    console.log("Usage: bun analyze-dasha.ts --chart <path.json> [options]");
    console.log("\nRequired:");
    console.log("  --chart PATH             Path to chart JSON file");
    console.log("\nOptional:");
    console.log("  --date YYYY-MM-DD        Reference date (default: today)");
    console.log("  --period MODE            current | next-year | all (default: current)");
    console.log("\nExamples:");
    console.log('  bun scripts/analyze-dasha.ts --chart "Charts/person-chart.json"');
    console.log('  bun scripts/analyze-dasha.ts --chart "Charts/person-chart.json" --period next-year');
    process.exit(1);
  }

  return parsed as Args;
}

// Planetary significations for dasha interpretation
const PLANET_SIGNIFICATIONS: Record<string, { nature: string; signifies: string; advice: string }> = {
  Sun:     { nature: "Mild malefic", signifies: "authority, father, government, health, ego, career", advice: "Focus on leadership roles, health, and self-improvement" },
  Moon:    { nature: "Benefic (waxing)", signifies: "mind, emotions, mother, public, travel, imagination", advice: "Nurture emotional well-being, family bonds, and creative pursuits" },
  Mars:    { nature: "Malefic", signifies: "courage, siblings, energy, property, conflict, surgery", advice: "Channel energy productively; be cautious with aggression and hasty decisions" },
  Mercury: { nature: "Neutral", signifies: "intelligence, speech, commerce, education, communication", advice: "Ideal for education, business ventures, and skill development" },
  Jupiter: { nature: "Great benefic", signifies: "wisdom, children, dharma, fortune, expansion, guru", advice: "Pursue higher learning, spiritual growth, and wealth-building" },
  Venus:   { nature: "Benefic", signifies: "spouse, luxury, art, beauty, vehicles, romance", advice: "Enjoy creativity, relationships, and material comforts mindfully" },
  Saturn:  { nature: "Great malefic", signifies: "discipline, hard work, delays, longevity, detachment", advice: "Embrace patience, consistent effort, and karmic lessons" },
  Rahu:    { nature: "Malefic", signifies: "ambition, foreign, innovation, illusion, obsession", advice: "Pursue unconventional paths carefully; guard against deception" },
  Ketu:    { nature: "Malefic", signifies: "spirituality, liberation, past life, detachment, occult", advice: "Focus on spiritual growth and letting go of attachments" },
};

const DASHA_DURATIONS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7,
  Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

function getHouseSignifications(houseNum: number): string {
  const sigs: Record<number, string> = {
    1: "self, body, personality",
    2: "wealth, family, speech",
    3: "siblings, courage, communication",
    4: "mother, home, property, happiness",
    5: "children, intelligence, romance",
    6: "enemies, disease, service",
    7: "spouse, marriage, partnerships",
    8: "longevity, inheritance, occult",
    9: "father, dharma, fortune, higher education",
    10: "career, profession, status",
    11: "gains, income, friends",
    12: "losses, expenses, spirituality, foreign lands",
  };
  return sigs[houseNum] || "unknown";
}

function parseDateStr(s: string): Date {
  return new Date(s + "T00:00:00");
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function main() {
  console.log("🪐 Vimshottari Dasha Analyzer\n");

  const args = parseArgs();

  if (!existsSync(args.chart)) {
    console.error(`❌ Chart file not found: ${args.chart}`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(args.chart, "utf-8"));
  const dashas = data.dashas;
  const person = data.person || {};
  const houses = data.d1Chart?.houses || [];
  const refDate = args.date ? parseDateStr(args.date) : new Date();

  if (!dashas) {
    console.error("❌ No dasha data found in chart. Regenerate with generate-chart.ts.");
    process.exit(1);
  }

  console.log(`📋 Chart: ${person.name || "Native"}`);
  console.log(`📅 Reference Date: ${formatDate(refDate)}\n`);

  // ── Balance of Dasha at Birth ──
  const balance = dashas.balance;
  if (balance) {
    const planet = Object.keys(balance)[0];
    const years = balance[planet];
    console.log(`## Balance of Dasha at Birth`);
    console.log(`  ${planet} Mahadasha: ${years.toFixed(2)} years remaining at birth\n`);
  }

  // ── Current Dasha Periods ──
  const current = dashas.current?.mahadashas || {};
  const mdPlanet = Object.keys(current)[0];
  if (mdPlanet) {
    const md = current[mdPlanet];
    const mdStart = parseDateStr(md.start);
    const mdEnd = parseDateStr(md.end);
    const mdTotalDays = daysBetween(mdStart, mdEnd);
    const mdElapsed = daysBetween(mdStart, refDate);
    const mdPct = Math.min(100, Math.max(0, Math.round((mdElapsed / mdTotalDays) * 100)));

    console.log(`## Current Mahadasha: ${mdPlanet}`);
    console.log(`  Period: ${md.start} → ${md.end} (${DASHA_DURATIONS[mdPlanet] || "?"} years)`);
    console.log(`  Progress: ${"█".repeat(Math.round(mdPct / 5))}${"░".repeat(20 - Math.round(mdPct / 5))} ${mdPct}%`);

    // Planet info
    const pInfo = PLANET_SIGNIFICATIONS[mdPlanet];
    if (pInfo) {
      console.log(`  Nature: ${pInfo.nature}`);
      console.log(`  Signifies: ${pInfo.signifies}`);
    }

    // Find planet's house placement
    for (const h of houses) {
      const occupants = h.occupants || [];
      for (const occ of occupants) {
        if (occ && typeof occ === "object" && occ.celestialBody === mdPlanet) {
          console.log(`  Placed in: House ${h.number} (${h.sign}) — ${getHouseSignifications(h.number)}`);
          if (occ.nakshatra) {
            console.log(`  Nakshatra: ${typeof occ.nakshatra === "string" ? occ.nakshatra : occ.nakshatra.name || occ.nakshatra}`);
          }
        }
      }
    }

    // Current Antardasha
    const antardashas = md.antardashas || {};
    const adPlanet = Object.keys(antardashas)[0];
    if (adPlanet) {
      const ad = antardashas[adPlanet];
      const adStart = parseDateStr(ad.start);
      const adEnd = parseDateStr(ad.end);
      const adTotalDays = daysBetween(adStart, adEnd);
      const adElapsed = daysBetween(adStart, refDate);
      const adPct = Math.min(100, Math.max(0, Math.round((adElapsed / adTotalDays) * 100)));

      console.log(`\n### Current Antardasha: ${mdPlanet}-${adPlanet}`);
      console.log(`  Period: ${ad.start} → ${ad.end}`);
      console.log(`  Progress: ${"█".repeat(Math.round(adPct / 5))}${"░".repeat(20 - Math.round(adPct / 5))} ${adPct}%`);

      const adInfo = PLANET_SIGNIFICATIONS[adPlanet];
      if (adInfo) {
        console.log(`  ${adPlanet} signifies: ${adInfo.signifies}`);
      }

      // Pratyantardasha
      const pratyantar = ad.pratyantardashas || {};
      const pdPlanet = Object.keys(pratyantar)[0];
      if (pdPlanet) {
        const pd = pratyantar[pdPlanet];
        console.log(`\n### Current Pratyantardasha: ${mdPlanet}-${adPlanet}-${pdPlanet}`);
        console.log(`  Period: ${pd.start} → ${pd.end}`);
      }
    }

    // Interpretation
    if (pInfo) {
      console.log(`\n## 💡 Interpretation`);
      console.log(`  Mahadasha (${mdPlanet}): ${pInfo.advice}`);
      if (adPlanet) {
        const adInfo = PLANET_SIGNIFICATIONS[adPlanet];
        if (adInfo) {
          console.log(`  Antardasha (${adPlanet}): ${adInfo.advice}`);
        }
      }
    }
  }

  // ── All Mahadashas Timeline ──
  if (args.period === "all" || args.period === "next-year") {
    const allMd = dashas.all?.mahadashas || {};
    const allPlanets = Object.keys(allMd);

    if (args.period === "all") {
      console.log(`\n## Complete Vimshottari Dasha Timeline`);
      console.log(`${"─".repeat(80)}`);
      console.log(`  ${"Planet".padEnd(10)} ${"Start".padEnd(14)} ${"End".padEnd(14)} ${"Duration".padEnd(10)} Status`);
      console.log(`${"─".repeat(80)}`);

      for (const planet of allPlanets) {
        const md = allMd[planet];
        const start = parseDateStr(md.start);
        const end = parseDateStr(md.end);
        const dur = `${DASHA_DURATIONS[planet] || "?"} years`;
        const isCurrent = refDate >= start && refDate <= end;
        const isPast = refDate > end;

        const status = isCurrent ? "◀ CURRENT" : isPast ? "  (past)" : "  (future)";
        console.log(`  ${planet.padEnd(10)} ${md.start.padEnd(14)} ${md.end.padEnd(14)} ${dur.padEnd(10)} ${status}`);
      }
      console.log(`${"─".repeat(80)}`);
    }

    if (args.period === "next-year") {
      const oneYearLater = new Date(refDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      console.log(`\n## Upcoming Dasha Periods (${formatDate(refDate)} → ${formatDate(oneYearLater)})`);

      // Check antardasha changes in current mahadasha
      if (mdPlanet && current[mdPlanet]) {
        const allAd = allMd[mdPlanet]?.antardashas || {};
        let found = false;

        for (const [adName, adData] of Object.entries(allAd) as [string, any][]) {
          const adStart = parseDateStr(adData.start);
          const adEnd = parseDateStr(adData.end);

          if (adEnd >= refDate && adStart <= oneYearLater) {
            if (!found) {
              console.log(`\n  Under ${mdPlanet} Mahadasha:`);
              found = true;
            }
            const isActive = refDate >= adStart && refDate <= adEnd;
            const marker = isActive ? " ◀ NOW" : "";
            console.log(`    ${mdPlanet}-${adName}: ${adData.start} → ${adData.end}${marker}`);
          }
        }
      }
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`📖 Dasha data sourced from jyotishganit (Vimshottari system)`);
  console.log(`🔮 For detailed predictions, combine with transit analysis`);
  console.log(`   bun scripts/transit.ts --chart "${args.chart}"\n`);
}

main();
