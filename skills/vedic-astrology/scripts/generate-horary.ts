#!/usr/bin/env bun

/**
 * Generate Horary (Prasna) Chart
 *
 * In Vedic horary astrology, the chart is cast for the moment a question
 * is asked. The planetary positions at that exact moment reveal the answer.
 * Uses jyotishganit for accurate ephemeris calculations.
 */

import { execSync } from "child_process";
import { writeFileSync, existsSync, mkdirSync } from "fs";

interface Args {
  question: string;
  lat: number;
  lon: number;
  tz: number;
  place?: string;
  date?: string;
  time?: string;
  output?: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    const value = args[i + 1];
    if (["lat", "lon", "tz"].includes(key)) {
      parsed[key] = parseFloat(value);
    } else {
      parsed[key] = value;
    }
  }

  if (!parsed.question || !parsed.lat || !parsed.lon || parsed.tz === undefined) {
    console.log("Usage: bun generate-horary.ts --question <text> --lat <lat> --lon <lon> --tz <tz> [options]");
    console.log("\nRequired:");
    console.log('  --question TEXT          The question to analyze');
    console.log("  --lat LATITUDE           Latitude (decimal degrees)");
    console.log("  --lon LONGITUDE          Longitude (decimal degrees)");
    console.log("  --tz TIMEZONE            UTC offset (e.g., 5.5 for IST)");
    console.log("\nOptional:");
    console.log("  --date YYYY-MM-DD        Date of question (default: now)");
    console.log("  --time HH:MM:SS          Time of question (default: now)");
    console.log("  --place PLACE            Location name");
    console.log("  --output PATH            Output file path");
    console.log("\nExamples:");
    console.log('  bun scripts/generate-horary.ts --question "Will I get the job?" \\');
    console.log("    --lat 19.0760 --lon 72.8777 --tz 5.5 --place Mumbai");
    process.exit(1);
  }

  return parsed as Args;
}

function generateHoraryChart(args: Args): string {
  // If no date/time given, use current moment
  const now = new Date();
  const tzOffsetMs = args.tz * 60 * 60 * 1000;
  const localNow = new Date(now.getTime() + tzOffsetMs + now.getTimezoneOffset() * 60 * 1000);

  const date = args.date || localNow.toISOString().split("T")[0];
  const time = args.time || `${localNow.getHours().toString().padStart(2, "0")}:${localNow.getMinutes().toString().padStart(2, "0")}:${localNow.getSeconds().toString().padStart(2, "0")}`;

  const pythonScript = `
import json
from datetime import datetime
from jyotishganit import calculate_birth_chart, get_birth_chart_json

date_str = "${date} ${time}"
dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")

chart = calculate_birth_chart(
    birth_date=dt,
    latitude=${args.lat},
    longitude=${args.lon},
    timezone_offset=${args.tz},
    location_name="${args.place || ""}",
    name="Horary Chart"
)

result = get_birth_chart_json(chart)
result["horary"] = {
    "question": """${args.question.replace(/"/g, '\\"')}""",
    "question_time": "${date}T${time}",
    "latitude": ${args.lat},
    "longitude": ${args.lon},
    "timezone": ${args.tz},
    "place": "${args.place || ""}"
}
result["meta"] = {
    "type": "horary",
    "generated_at": datetime.now().isoformat(),
    "system": "KP-based Prasna"
}

print(json.dumps(result, indent=2, default=str))
`;

  try {
    const output = execSync(`python3 -c '${pythonScript.replace(/'/g, "'\\''")}' 2>/dev/null`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    const lines = output.split("\n");
    const jsonStart = lines.findIndex((l) => l.trim() === "{");
    return lines.slice(jsonStart).join("\n");
  } catch {
    try {
      const output = execSync(`python3.11 -c '${pythonScript.replace(/'/g, "'\\''")}' 2>/dev/null`, {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
      });
      const lines = output.split("\n");
      const jsonStart = lines.findIndex((l) => l.trim() === "{");
      return lines.slice(jsonStart).join("\n");
    } catch (error: any) {
      console.error("❌ Error generating horary chart:");
      console.error(error.stderr || error.message);
      console.error("\nEnsure jyotishganit is installed: pip3 install jyotishganit");
      process.exit(1);
    }
  }
}

// KP house combinations for common Prasna questions
const PRASNA_HOUSES: Record<string, { positive: number[]; negative: number[]; meaning: string }> = {
  job:       { positive: [2, 6, 10, 11], negative: [5, 8, 12], meaning: "Job/career success" },
  career:    { positive: [2, 6, 10, 11], negative: [5, 8, 12], meaning: "Career advancement" },
  marriage:  { positive: [2, 7, 11], negative: [1, 6, 10], meaning: "Marriage happening" },
  travel:    { positive: [3, 9, 12], negative: [1, 4, 8], meaning: "Travel materializing" },
  health:    { positive: [1, 5, 11], negative: [6, 8, 12], meaning: "Health recovery" },
  wealth:    { positive: [2, 6, 10, 11], negative: [5, 8, 12], meaning: "Financial gain" },
  invest:    { positive: [2, 5, 11], negative: [6, 8, 12], meaning: "Investment success" },
  business:  { positive: [7, 10, 11], negative: [6, 8, 12], meaning: "Business partnership" },
  education: { positive: [4, 5, 9, 11], negative: [3, 8], meaning: "Educational success" },
  children:  { positive: [2, 5, 11], negative: [1, 4, 10], meaning: "Childbirth" },
  property:  { positive: [4, 11, 12], negative: [3, 6, 10], meaning: "Property acquisition" },
};

function detectQuestionTopic(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("job") || q.includes("employ")) return "job";
  if (q.includes("career") || q.includes("promotion")) return "career";
  if (q.includes("marry") || q.includes("marriage") || q.includes("wedding")) return "marriage";
  if (q.includes("travel") || q.includes("abroad") || q.includes("visa")) return "travel";
  if (q.includes("health") || q.includes("disease") || q.includes("cure") || q.includes("recover")) return "health";
  if (q.includes("money") || q.includes("wealth") || q.includes("income") || q.includes("salary")) return "wealth";
  if (q.includes("invest") || q.includes("stock") || q.includes("business deal")) return "invest";
  if (q.includes("business") || q.includes("partner") || q.includes("venture")) return "business";
  if (q.includes("exam") || q.includes("study") || q.includes("education") || q.includes("university")) return "education";
  if (q.includes("child") || q.includes("baby") || q.includes("pregnan")) return "children";
  if (q.includes("house") || q.includes("property") || q.includes("flat") || q.includes("land")) return "property";
  return "";
}

function main() {
  console.log("🔮 Vedic Horary (Prasna) Chart Generator\n");

  const args = parseArgs();

  console.log(`❓ Question: "${args.question}"`);
  console.log(`📍 Location: ${args.lat}°N, ${args.lon}°E${args.place ? ` (${args.place})` : ""}`);
  console.log(`🕐 Time: ${args.date || "Current"} ${args.time || "moment"}`);
  console.log();

  // Generate the chart
  console.log("⏳ Casting horary chart...\n");
  const chartJson = generateHoraryChart(args);
  const chartData = JSON.parse(chartJson);

  // Save to file
  const outputDir = process.env.ASTRO_CHARTS_DIR || "./Charts";
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = args.output || `${outputDir}/horary-${timestamp}.json`;
  writeFileSync(filename, chartJson);

  console.log(`✅ Horary chart generated!`);
  console.log(`📁 Saved to: ${filename}\n`);

  // Basic Prasna interpretation
  const topic = detectQuestionTopic(args.question);
  const houses = chartData.d1Chart?.houses || [];
  const ascendant = houses.find((h: any) => h.number === 1);

  console.log("## Prasna Chart Summary");
  console.log(`  Ascendant: ${ascendant?.sign || "N/A"} (${ascendant?.signDegrees?.toFixed(2) || "?"}°)`);
  console.log(`  Ascendant Lord: ${ascendant?.lord || "N/A"} in House ${ascendant?.lordPlacedHouse || "?"}`);

  // Panchanga
  const panch = chartData.panchanga || {};
  if (panch.tithi || panch.nakshatra) {
    console.log(`\n### Prasna Panchanga`);
    const tithiName = typeof panch.tithi === "string" ? panch.tithi : panch.tithi?.name || "N/A";
    const nakName = typeof panch.nakshatra === "string" ? panch.nakshatra : panch.nakshatra?.name || "N/A";
    const yogaName = typeof panch.yoga === "string" ? panch.yoga : panch.yoga?.name || "N/A";
    console.log(`  Tithi: ${tithiName}`);
    console.log(`  Nakshatra: ${nakName}`);
    console.log(`  Yoga: ${yogaName}`);
  }

  // Moon position (key for Prasna)
  let moonHouse = 0;
  let moonSign = "";
  for (const h of houses) {
    for (const occ of h.occupants || []) {
      if (occ && typeof occ === "object" && occ.celestialBody === "Moon") {
        moonHouse = h.number;
        moonSign = h.sign;
      }
    }
  }
  if (moonHouse) {
    console.log(`\n### Moon (Key Significator in Prasna)`);
    console.log(`  Moon in House ${moonHouse} (${moonSign})`);
    console.log(`  Moon's house themes indicate the querent's state of mind`);
  }

  // Topic-based analysis
  if (topic && PRASNA_HOUSES[topic]) {
    const info = PRASNA_HOUSES[topic];
    console.log(`\n### KP Analysis for: ${info.meaning}`);
    console.log(`  Relevant houses: ${info.positive.join(", ")} (positive)`);
    console.log(`  Counter houses: ${info.negative.join(", ")} (negative)`);

    // Check occupants and lords of relevant houses
    const positiveStrength: string[] = [];
    const negativeFactors: string[] = [];

    for (const num of info.positive) {
      const h = houses.find((h: any) => h.number === num);
      if (h) {
        const occs = (h.occupants || []).filter((o: any) => o && typeof o === "object");
        if (occs.length > 0) {
          const names = occs.map((o: any) => o.celestialBody).join(", ");
          positiveStrength.push(`House ${num} occupied by ${names}`);
        }
      }
    }

    for (const num of info.negative) {
      const h = houses.find((h: any) => h.number === num);
      if (h) {
        const occs = (h.occupants || []).filter((o: any) => o && typeof o === "object");
        if (occs.length > 0) {
          const names = occs.map((o: any) => o.celestialBody).join(", ");
          negativeFactors.push(`House ${num} occupied by ${names}`);
        }
      }
    }

    if (positiveStrength.length > 0) {
      console.log(`\n  ✅ Positive indicators:`);
      positiveStrength.forEach((s) => console.log(`     • ${s}`));
    }
    if (negativeFactors.length > 0) {
      console.log(`  ⚠️  Challenging indicators:`);
      negativeFactors.forEach((s) => console.log(`     • ${s}`));
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`📖 For full interpretation, use:`);
  console.log(`   bun scripts/interpret-chart.ts --chart "${filename}" --focus general`);
  console.log(`\n🔮 Note: Horary (Prasna) interpretation requires careful judgment.`);
  console.log(`   Consult an experienced KP astrologer for important decisions.\n`);
}

main();
