#!/usr/bin/env bun

/**
 * Generate Cryptographic Keys for ONDC Registration
 * 
 * Creates signing and encryption key pairs required for ONDC network participation
 * Based on: https://github.com/ONDC-Official/reference-implementations/tree/main/utilities/signing_and_verification
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = "/home/workspace/ondc-keys";
const SIGNING_KEY = join(OUTPUT_DIR, "signing_private.pem");
const SIGNING_PUB = join(OUTPUT_DIR, "signing_public.pem");
const CRYPTO_KEY = join(OUTPUT_DIR, "crypto_private.pem");
const CRYPTO_PUB = join(OUTPUT_DIR, "crypto_public.pem");

function main() {
  console.log("🔐 Generating ONDC Cryptographic Keys\n");

  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Generate signing key pair (ED25519)
    console.log("📝 Generating signing key pair (ED25519)...");
    execSync(`openssl genpkey -algorithm ED25519 -out ${SIGNING_KEY}`, { stdio: "inherit" });
    execSync(`openssl pkey -in ${SIGNING_KEY} -pubout -out ${SIGNING_PUB}`, { stdio: "inherit" });
    console.log(`✅ Signing keys generated:`);
    console.log(`   Private: ${SIGNING_KEY}`);
    console.log(`   Public:  ${SIGNING_PUB}\n`);

    // Generate encryption key pair (X25519)
    console.log("🔒 Generating encryption key pair (X25519)...");
    execSync(`openssl genpkey -algorithm X25519 -out ${CRYPTO_KEY}`, { stdio: "inherit" });
    execSync(`openssl pkey -in ${CRYPTO_KEY} -pubout -out ${CRYPTO_PUB}`, { stdio: "inherit" });
    console.log(`✅ Encryption keys generated:`);
    console.log(`   Private: ${CRYPTO_KEY}`);
    console.log(`   Public:  ${CRYPTO_PUB}\n`);

    // Display public keys
    console.log("📋 Public Keys for ONDC Registration:\n");
    
    const signingPubKey = execSync(`cat ${SIGNING_PUB}`).toString().trim();
    const cryptoPubKey = execSync(`cat ${CRYPTO_PUB}`).toString().trim();
    
    console.log("Signing Public Key:");
    console.log(signingPubKey);
    console.log("\nEncryption Public Key:");
    console.log(cryptoPubKey);

    console.log("\n✅ Key generation complete!");
    console.log("\n📌 Next Steps:");
    console.log("1. Store private keys securely in Settings > Advanced");
    console.log("2. Use public keys when registering with ONDC");
    console.log("3. Run setup-env.ts to configure your environment");

  } catch (error) {
    console.error("❌ Error generating keys:", error);
    process.exit(1);
  }
}

main();
