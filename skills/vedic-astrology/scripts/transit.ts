#!/usr/bin/env bun

/**
 * Transit Analysis
 *
 * Generates a chart for a target date and compares planetary positions
 * against the natal chart to identify significant transits.
 * Uses jyotishganit for real ephemeris-based positions.
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

interface Args {
  chart: string;
  date?: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    parsed[key] = args[i + 1];
  }

  if (!parsed.chart) {
    console.log("Usage: bun transit.ts --chart <natal-chart.json> [options]");
    console.log("\nRequired:");
    console.log("  --chart PATH             Path to natal chart JSON file");
    console.log("\nOptional:");
    console.log("  --date YYYY-MM-DD        Transit date (default: today)");
    console.log("\nExamples:");
    console.log('  bun scripts/transit.ts --chart "Charts/person-chart.json"');
    console.log('  bun scripts/transit.ts --chart "Charts/person-chart.json" --date 2024-06-01');
    process.exit(1);
  }

  return parsed as Args;
}

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function signIndex(sign: string): number {
  return SIGNS.findIndex((s) => s.toLowerCase() === sign.toLowerCase());
}

function getAspectedHouses(fromSign: string, planet: string): number[] {
  const from = signIndex(fromSign);
  if (from < 0) return [];

  // All planets aspect the 7th
  const aspects = [7];

  // Special aspects
  if (planet === "Mars") aspects.push(4, 8);
  if (planet === "Jupiter") aspects.push(5, 9);
  if (planet === "Saturn") aspects.push(3, 10);

  return aspects.map((a) => ((from + a - 1) % 12) + 1);
}

function getTransitPositions(lat: number, lon: number, tz: number, date: string): any {
  const pythonScript = `
import json
from datetime import datetime
from jyotishganit import calculate_birth_chart, get_birth_chart_json

dt = datetime.strptime("${date} 12:00:00", "%Y-%m-%d %H:%M:%S")

chart = calculate_birth_chart(
    birth_date=dt,
    latitude=${lat},
    longitude=${lon},
    timezone_offset=${tz},
    location_name="Transit",
    name="Transit"
)

result = get_birth_chart_json(chart)
planets = []
houses = result.get("d1Chart", {}).get("houses", [])
for h in houses:
    for occ in h.get("occupants", []):
        if occ and isinstance(occ, dict):
            planets.append({
                "planet": occ.get("celestialBody"),
                "sign": h.get("sign"),
                "degrees": occ.get("signDegrees", 0),
                "house": h.get("number"),
                "nakshatra": occ.get("nakshatra") if isinstance(occ.get("nakshatra"), str) else (occ.get("nakshatra", {}) or {}).get("name", ""),
                "motion": occ.get("motion_type", "direct"),
            })

print(json.dumps(planets, default=str))
`;

  try {
    const output = execSync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}' 2>/dev/null`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(output.trim());
  } catch {
    // Fallback: try python3.11
    try {
      const output = execSync(`python3.11 -c '${pythonScript.replace(/'/g, "'\\''")}' 2>/dev/null`, {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
      });
      return JSON.parse(output.trim());
    } catch {
      return null;
    }
  }
}

function extractNatalPlanets(data: any): any[] {
  const planets: any[] = [];
  const houses = data.d1Chart?.houses || [];
  for (const h of houses) {
    for (const occ of h.occupants || []) {
      if (occ && typeof occ === "object") {
        planets.push({
          planet: occ.celestialBody,
          sign: h.sign,
          degrees: occ.signDegrees || 0,
          house: h.number,
          nakshatra: typeof occ.nakshatra === "string" ? occ.nakshatra : occ.nakshatra?.name || "",
        });
      }
    }
  }
  return planets;
}

function getHouseSignifications(h: number): string {
  const sigs: Record<number, string> = {
    1: "self, body", 2: "wealth, family", 3: "courage, siblings",
    4: "home, mother", 5: "children, intelligence", 6: "enemies, health",
    7: "marriage, partner", 8: "longevity, occult", 9: "fortune, dharma",
    10: "career, status", 11: "gains, friends", 12: "losses, spirituality",
  };
  return sigs[h] || "";
}

function main() {
  console.log("🌍 Vedic Transit Analysis\n");

  const args = parseArgs();

  if (!existsSync(args.chart)) {
    console.error(`❌ Chart file not found: ${args.chart}`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(args.chart, "utf-8"));
  const person = data.person || {};
  const geo = person.birthPlace?.geo || {};
  const lat = geo.latitude || 28.6139;
  const lon = geo.longitude || 77.209;
  const tz = 5.5; // default IST; ideal: extract from chart

  const transitDate = args.date || new Date().toISOString().split("T")[0];

  console.log(`📋 Natal Chart: ${person.name || "Native"}`);
  console.log(`📅 Transit Date: ${transitDate}\n`);

  // Extract natal positions
  const natalPlanets = extractNatalPlanets(data);

  // Get transit positions via jyotishganit
  console.log("⏳ Computing transit positions via ephemeris...\n");
  const transitPlanets = getTransitPositions(lat, lon, tz, transitDate);

  if (!transitPlanets) {
    console.error("❌ Could not compute transit positions. Ensure jyotishganit is installed:");
    console.error("   pip3 install jyotishganit");
    process.exit(1);
  }

  // ── Transit Table ──
  console.log("## Current Planetary Transits");
  console.log("═".repeat(90));
  console.log(
    "  " +
    "Planet".padEnd(10) +
    "Transit Sign".padEnd(16) +
    "Degrees".padEnd(10) +
    "Nakshatra".padEnd(16) +
    "Natal Sign".padEnd(14) +
    "Movement"
  );
  console.log("─".repeat(90));

  for (const tp of transitPlanets) {
    const natal = natalPlanets.find((n) => n.planet === tp.planet);
    const natalSign = natal ? natal.sign : "–";
    const motion = tp.motion === "retrograde" ? "℞ Retro" : "→ Direct";
    const sameness = natal && natal.sign === tp.sign ? " ★" : "";

    console.log(
      "  " +
      tp.planet.padEnd(10) +
      tp.sign.padEnd(16) +
      `${(tp.degrees || 0).toFixed(2)}°`.padEnd(10) +
      (tp.nakshatra || "–").padEnd(16) +
      natalSign.padEnd(14) +
      motion + sameness
    );
  }
  console.log("═".repeat(90));
  console.log("  ★ = Transit planet in same sign as natal position\n");

  // ── Key Transits Analysis ──
  console.log("## Key Transit Effects\n");

  const SLOW_PLANETS = ["Jupiter", "Saturn", "Rahu", "Ketu"];

  for (const tp of transitPlanets) {
    if (!SLOW_PLANETS.includes(tp.planet)) continue;

    const natal = natalPlanets.find((n) => n.planet === tp.planet);
    const transitSignIdx = signIndex(tp.sign);

    // Find which natal house this transit falls in
    const houses = data.d1Chart?.houses || [];
    let transitHouse = 0;
    for (const h of houses) {
      if (h.sign === tp.sign) {
        transitHouse = h.number;
        break;
      }
    }

    if (transitHouse > 0) {
      console.log(`### ${tp.planet} transit through House ${transitHouse} (${tp.sign})`);
      console.log(`  House themes: ${getHouseSignifications(transitHouse)}`);

      if (natal && natal.sign === tp.sign) {
        console.log(`  ⚡ ${tp.planet} Return — planet transiting its natal sign (significant period!)`);
      }

      // Saturn special transits
      if (tp.planet === "Saturn") {
        const moonNatal = natalPlanets.find((n) => n.planet === "Moon");
        if (moonNatal) {
          const moonIdx = signIndex(moonNatal.sign);
          const satIdx = signIndex(tp.sign);
          const diff = ((satIdx - moonIdx + 12) % 12) + 1;
          if ([12, 1, 2].includes(diff)) {
            console.log(`  ⚠️  Sade Sati active — Saturn transiting near natal Moon (${moonNatal.sign})`);
            if (diff === 12) console.log("     Phase: Rising (12th from Moon) — subtle challenges beginning");
            if (diff === 1) console.log("     Phase: Peak (over Moon) — maximum intensity");
            if (diff === 2) console.log("     Phase: Setting (2nd from Moon) — challenges easing");
          }
        }
      }

      if (tp.motion === "retrograde") {
        console.log(`  ℞ Retrograde — revisiting past themes of this house`);
      }

      console.log();
    }
  }

  // ── Ashtakavarga Transit Strength ──
  const ashtakavarga = data.ashtakavarga;
  if (ashtakavarga) {
    console.log("## Ashtakavarga Transit Strength\n");
    console.log("  Planets transiting signs with high SAV points yield better results:\n");

    for (const tp of transitPlanets) {
      if (!SLOW_PLANETS.includes(tp.planet)) continue;
      // Try to find SAV for the transit sign
      const sav = ashtakavarga.sarvashtakavarga || ashtakavarga.SAV;
      if (sav && typeof sav === "object") {
        const points = sav[tp.sign];
        if (points !== undefined) {
          const strength = points >= 28 ? "🟢 Strong" : points >= 22 ? "🟡 Average" : "🔴 Weak";
          console.log(`  ${tp.planet} in ${tp.sign}: ${points} points ${strength}`);
        }
      }
    }
    console.log();
  }

  console.log("─".repeat(60));
  console.log("📖 Transit positions computed via jyotishganit (NASA JPL DE421)");
  console.log("🔮 For timing predictions, combine with dasha analysis:");
  console.log(`   bun scripts/analyze-dasha.ts --chart "${args.chart}"\n`);
}

main();
