import { execSync } from "node:child_process";
import { join } from "node:path";

export function runPrismaMigrateDeployIfProduction(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  if (process.env.SKIP_PRISMA_MIGRATE === "true") {
    return;
  }
  const apiRoot = join(__dirname, "..", "..");
  execSync("pnpm exec prisma migrate deploy", {
    cwd: apiRoot,
    stdio: "inherit",
    env: process.env,
  });
}
