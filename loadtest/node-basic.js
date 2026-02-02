const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const durationMs = Number(process.env.DURATION_MS || 30000);
const concurrency = Number(process.env.CONCURRENCY || 25);

const endpoints = ["/", "/tournaments", "/play"];

const stats = {
  total: 0,
  failed: 0,
  durations: [],
  perEndpoint: new Map(),
};

function record(endpoint, durationMs, ok) {
  stats.total += 1;
  if (!ok) stats.failed += 1;
  stats.durations.push(durationMs);
  if (!stats.perEndpoint.has(endpoint)) {
    stats.perEndpoint.set(endpoint, { total: 0, failed: 0, durations: [] });
  }
  const entry = stats.perEndpoint.get(endpoint);
  entry.total += 1;
  if (!ok) entry.failed += 1;
  entry.durations.push(durationMs);
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

async function hitEndpoint(endpoint) {
  const start = Date.now();
  try {
    const response = await fetch(`${baseUrl}${endpoint}`);
    const ok = response.status >= 200 && response.status < 300;
    record(endpoint, Date.now() - start, ok);
  } catch {
    record(endpoint, Date.now() - start, false);
  }
}

async function worker(stopAt) {
  while (Date.now() < stopAt) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    // eslint-disable-next-line no-await-in-loop
    await hitEndpoint(endpoint);
  }
}

async function run() {
  const stopAt = Date.now() + durationMs;
  const workers = Array.from({ length: concurrency }, () => worker(stopAt));
  await Promise.all(workers);

  const p50 = percentile(stats.durations, 50);
  const p95 = percentile(stats.durations, 95);
  const p99 = percentile(stats.durations, 99);
  const rps = stats.total / (durationMs / 1000);

  console.log("Load test results");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Duration: ${durationMs}ms`);
  console.log(`Concurrency: ${concurrency}`);
  console.log(`Requests: ${stats.total}`);
  console.log(`Errors: ${stats.failed}`);
  console.log(`RPS: ${rps.toFixed(1)}`);
  console.log(`Latency p50: ${p50}ms`);
  console.log(`Latency p95: ${p95}ms`);
  console.log(`Latency p99: ${p99}ms`);
  console.log("");
  console.log("Per-endpoint");
  for (const [endpoint, data] of stats.perEndpoint.entries()) {
    const epP95 = percentile(data.durations, 95);
    const epRps = data.total / (durationMs / 1000);
    console.log(
      `${endpoint} | req: ${data.total} | err: ${data.failed} | rps: ${epRps.toFixed(1)} | p95: ${epP95}ms`,
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
