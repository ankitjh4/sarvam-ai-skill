#!/usr/bin/env bun

/**
 * ONDC Registry Registration Helper (Buyer App)
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
    city: args.city || "*", // Buyer apps typically support all cities
    type: "BAP", // Buyer = BAP (Beckn Application Platform)
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
  console.log("📝 ONDC Registry Registration Helper (Buyer App)\n");

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

  console.log("\n💡 Buyer App Tips:");
  console.log("   - Use city: '*' to serve all cities");
  console.log("   - Configure payment gateway before going live");
  console.log("   - Test with staging environment first");
  console.log("   - Ensure Firebase authentication is properly configured");

  console.log("\n📚 Domain Codes:");
  console.log("   nic2004:52110 - Retail");
  console.log("   nic2004:60221 - F&B");
  console.log("   nic2004:85111 - Healthcare");
  console.log("   nic2004:52112 - Grocery");

  console.log("\n🔧 Environment Variables to Configure:");
  console.log("   BAP_ID - Your subscriber ID (domain)");
  console.log("   BAP_URL - Your subscriber URL");
  console.log("   BAP_UNIQUE_KEY_ID - From ONDC after registration");
  console.log("   BAP_PRIVATE_KEY - Your signing private key");
  console.log("   BAP_PUBLIC_KEY - Your signing public key");
}

main();
