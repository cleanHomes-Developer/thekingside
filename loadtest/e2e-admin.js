/* eslint-disable no-console */
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

async function check(path, expectedStatuses) {
  const res = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const ok = expectedStatuses.includes(res.status);
  const label = ok ? "OK" : "FAIL";
  console.log(`${label} ${path} -> ${res.status}`);
  if (!ok) {
    throw new Error(`Expected ${expectedStatuses.join(", ")} for ${path}`);
  }
}

async function run() {
  await check("/admin", [307]);
  await check("/admin/health", [307]);
  await check("/admin/audit-logs", [307]);
  await check("/admin/announcements", [307]);
  await check("/admin/queues", [307]);
  await check("/api/admin/health", [401]);
  await check("/api/admin/announcements", [401]);
  await check("/api/admin/stats", [401]);
}

run()
  .then(() => {
    console.log("E2E admin gating checks passed.");
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
