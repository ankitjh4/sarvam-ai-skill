#!/usr/bin/env bun

/**
 * Check ONDC Seller App Status
 * 
 * Checks the health and status of all seller app services
 */

import { execSync } from "child_process";

interface ServiceStatus {
  name: string;
  container: string;
  status: string;
  uptime: string;
  ports: string;
}

function getContainerStatus(containerName: string): ServiceStatus | null {
  try {
    const output = execSync(
      `docker ps -a --filter name=${containerName} --format "{{.Names}}|{{.Status}}|{{.Ports}}"`,
      { encoding: "utf-8" }
    ).trim();

    if (!output) return null;

    const [name, status, ports] = output.split("|");
    const uptime = status.includes("Up") ? status.replace("Up ", "") : "Down";

    return {
      name: containerName,
      container: name,
      status: status.includes("Up") ? "✅ Running" : "❌ Stopped",
      uptime,
      ports: ports || "N/A",
    };
  } catch (error) {
    return null;
  }
}

function checkEndpointHealth(url: string): boolean {
  try {
    execSync(`curl -f -s ${url} > /dev/null`, { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function main() {
  console.log("🔍 ONDC Seller App Status Check\n");

  const services = [
    { name: "Seller Backend", container: "seller-app", port: "3000" },
    { name: "Seller Frontend", container: "seller-app-frontend", port: "80" },
    { name: "Protocol Layer", container: "seller-app-protocol", port: "5555" },
    { name: "IGM Service", container: "seller-app-igm", port: "3010" },
    { name: "Bugzilla", container: "seller-bugzilla-service", port: "5001" },
    { name: "MongoDB", container: "mongo", port: "27017" },
  ];

  console.log("📊 Service Status:\n");
  console.log("Service              | Status       | Uptime                | Ports");
  console.log("---------------------|--------------|-----------------------|----------");

  let allHealthy = true;

  for (const service of services) {
    const status = getContainerStatus(service.container);
    
    if (status) {
      const statusStr = status.status.padEnd(12);
      const uptimeStr = status.uptime.substring(0, 20).padEnd(21);
      const portsStr = status.ports.substring(0, 8);
      console.log(`${service.name.padEnd(20)} | ${statusStr} | ${uptimeStr} | ${portsStr}`);
      
      if (!status.status.includes("Running")) {
        allHealthy = false;
      }
    } else {
      console.log(`${service.name.padEnd(20)} | ❌ Not Found | -                     | -`);
      allHealthy = false;
    }
  }

  console.log("\n🌐 Endpoint Health Checks:\n");

  const endpoints = [
    { name: "Frontend", url: "http://localhost" },
    { name: "Backend API", url: "http://localhost:3000/health" },
    { name: "Protocol Layer", url: "http://localhost:5555/health" },
    { name: "IGM Service", url: "http://localhost:3010/health" },
  ];

  for (const endpoint of endpoints) {
    const healthy = checkEndpointHealth(endpoint.url);
    const status = healthy ? "✅ Healthy" : "❌ Unhealthy";
    console.log(`${endpoint.name.padEnd(20)} | ${status.padEnd(12)} | ${endpoint.url}`);
    
    if (!healthy) allHealthy = false;
  }

  console.log("\n📝 Recent Logs:\n");
  
  try {
    console.log("--- Seller App (last 10 lines) ---");
    execSync("docker logs --tail 10 seller-app 2>&1 || echo 'Container not found'", { stdio: "inherit" });
  } catch (error) {
    console.log("Could not fetch logs");
  }

  console.log("\n" + "=".repeat(60));
  
  if (allHealthy) {
    console.log("\n✅ All services are healthy!");
  } else {
    console.log("\n⚠️  Some services are not running properly");
    console.log("\n💡 Try:");
    console.log("   docker-compose restart");
    console.log("   docker-compose logs [service-name]");
  }
}

main();
