#!/usr/bin/env bun

/**
 * ONDC Registry Registration Helper
 * 
 * Generates registration payload for ONDC network
 */

import { readFileSync } from "fs";

interface Args {
  subscriberUrl: string;
  signingKey: string;
  cryptoKey: string;
  domain?: string;
  city?: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const parsed: any = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      parsed[key] = args[i + 1];
      i++;
    }
  }

  if (!parsed.subscriberUrl || !parsed.signingKey || !parsed.cryptoKey) {
    console.error("Usage: bun register.ts --subscriber-url URL --signing-key PATH --crypto-key PATH [--domain DOMAIN] [--city CITY]");
    process.exit(1);
  }

  return parsed as Args;
}

function readPublicKey(path: string): string {
  try {
    const key = readFileSync(path, "utf-8");
    // Remove PEM headers and newlines
    return key
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/\n/g, "")
      .trim();
  } catch (error) {
    console.error(`❌ Error reading key file: ${path}`);
    process.exit(1);
  }
}

function generatePayload(args: Args) {
  const now = new Date();
  const future = new Date(now.getTime() + (10 * 365 * 24 * 60 * 60 * 1000)); // 10 years

  const signingKey = readPublicKey(args.signingKey);
  const cryptoKey = readPublicKey(args.cryptoKey);

  const payload = {
    country: "IND",
    city: args.city || "std:080", // Default to Bangalore
    type: "BPP", // Seller = BPP (Beckn Provider Platform)
    subscriber_id: args.subscriberUrl,
    subscriber_url: args.subscriberUrl,
    domain: args.domain || "nic2004:52110", // Retail domain
    signing_public_key: signingKey,
    encr_public_key: cryptoKey,
    created: now.toISOString(),
    valid_from: now.toISOString(),
    valid_until: future.toISOString(),
    updated: now.toISOString(),
  };

  return payload;
}

function main() {
  console.log("📝 ONDC Registry Registration Helper\n");

  const args = parseArgs();
  const payload = generatePayload(args);

  console.log("📋 Registration Payload:\n");
  console.log(JSON.stringify(payload, null, 2));

  console.log("\n\n📌 Next Steps:\n");
  console.log("1. Visit the ONDC Registry Form:");
  console.log("   https://docs.google.com/forms/d/e/1FAIpQLSdz5-LLGX4m_pOQNFstoZQd5zhb68md_9zoX-dC8N8j2DABbA/viewform");
  console.log("\n2. Submit the payload above");
  console.log("\n3. Wait for approval and receive your ukId (BAP_UNIQUE_KEY_ID)");
  console.log("\n4. Add the ukId to your environment variables:");
  console.log("   BAP_UNIQUE_KEY_ID=<your-ukid>");
  console.log("\n5. Restart your services to apply the changes");

  console.log("\n💡 Tips:");
  console.log("   - For staging: Use test credentials and domain");
  console.log("   - For production: Use production domain with valid SSL");
  console.log("   - City code format: std:STD_CODE (e.g., std:080 for Bangalore)");
  console.log("   - Domain codes: Check ONDC documentation for your category");

  console.log("\n📚 Domain Codes:");
  console.log("   nic2004:52110 - Retail");
  console.log("   nic2004:60212 - Logistics");
  console.log("   nic2004:60221 - F&B");
  console.log("   nic2004:85111 - Healthcare");

  console.log("\n📚 City Codes (Sample):");
  console.log("   std:080 - Bangalore");
  console.log("   std:011 - Delhi");
  console.log("   std:022 - Mumbai");
  console.log("   std:033 - Kolkata");
  console.log("   std:044 - Chennai");
  console.log("   *       - All cities");
}

main();
