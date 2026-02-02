const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const adminEmail = process.env.ADMIN_EMAIL || "";
const adminPassword = process.env.ADMIN_PASSWORD || "";

const publicChecks = [
  { path: "/", expect: [200] },
  { path: "/tournaments", expect: [200] },
  { path: "/play", expect: [200] },
  { path: "/login", expect: [200] },
  { path: "/register", expect: [200] },
  { path: "/faq", expect: [200] },
  { path: "/rules", expect: [200] },
  { path: "/prize-policy", expect: [200] },
  { path: "/refund-policy", expect: [200] },
  { path: "/anti-cheat-policy", expect: [200] },
  { path: "/terms", expect: [200] },
  { path: "/privacy", expect: [200] },
  { path: "/affiliates", expect: [200] },
  { path: "/support", expect: [200, 307] },
  { path: "/api/auth/me", expect: [200, 401] },
  { path: "/api/tournaments", expect: [200] },
];

const userChecks = [
  { path: "/dashboard", expect: [200, 307] },
  { path: "/wallet", expect: [200, 307] },
  { path: "/settings", expect: [200, 307] },
  { path: "/support", expect: [200] },
  { path: "/api/auth/me", expect: [200] },
];

const adminChecks = [
  { path: "/admin", expect: [200, 307] },
  { path: "/admin/tournaments", expect: [200, 307] },
  { path: "/admin/anticheat", expect: [200, 307] },
  { path: "/admin/payouts", expect: [200, 307] },
  { path: "/admin/support", expect: [200, 307] },
  { path: "/admin/affiliates", expect: [200, 307] },
  { path: "/admin/sponsors", expect: [200, 307] },
  { path: "/admin/demo-tournament", expect: [200, 307] },
  { path: "/api/admin/stats", expect: [200, 401] },
];

function randomEmail() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `smoke_${rand}@example.com`;
}

function parseCookies(headers) {
  const setCookie = headers.get("set-cookie");
  if (!setCookie) return [];
  return setCookie.split(",").map((part) => part.trim().split(";")[0]);
}

function createCookieJar() {
  const jar = new Map();
  return {
    setFromHeaders(headers) {
      parseCookies(headers).forEach((cookie) => {
        const [name, value] = cookie.split("=");
        if (name && value) jar.set(name, value);
      });
    },
    header() {
      return Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
    },
  };
}

async function fetchWithCookies(path, options = {}, jar) {
  const headers = { ...(options.headers || {}) };
  const timeoutMs = options.timeoutMs ?? 10000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (jar) {
    const cookieHeader = jar.header();
    if (cookieHeader) headers.Cookie = cookieHeader;
  }
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      redirect: "manual",
    });
    if (jar) {
      jar.setFromHeaders(res.headers);
    }
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function run() {
  let failed = 0;

  const runChecks = async (checks, jar = null) => {
    for (const check of checks) {
      try {
        const res = await fetchWithCookies(check.path, {}, jar);
        const ok = check.expect.includes(res.status);
        if (!ok) {
          failed += 1;
          console.error(`FAIL ${check.path} -> ${res.status}`);
        } else {
          console.log(`OK   ${check.path} -> ${res.status}`);
        }
      } catch (err) {
        failed += 1;
        console.error(`FAIL ${check.path} -> ${err.message}`);
      }
    }
  };

  await runChecks(publicChecks);

  const userJar = createCookieJar();
  const email = randomEmail();
  const password = "Test12345!";
  const registerRes = await fetchWithCookies(
    "/api/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: "Smoke Test",
        displayName: "smoke",
      }),
    },
    userJar,
  );
  if (![200, 201, 409].includes(registerRes.status)) {
    failed += 1;
    console.error(`FAIL /api/auth/register -> ${registerRes.status}`);
  } else {
    console.log(`OK   /api/auth/register -> ${registerRes.status}`);
  }

  const loginRes = await fetchWithCookies(
    "/api/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    userJar,
  );
  if (loginRes.status !== 200) {
    failed += 1;
    console.error(`FAIL /api/auth/login -> ${loginRes.status}`);
  } else {
    console.log(`OK   /api/auth/login -> ${loginRes.status}`);
  }

  await runChecks(userChecks, userJar);

  if (adminEmail && adminPassword) {
    const adminJar = createCookieJar();
    const adminLogin = await fetchWithCookies(
      "/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      },
      adminJar,
    );
    if (adminLogin.status !== 200) {
      failed += 1;
      console.error(`FAIL admin login -> ${adminLogin.status}`);
    } else {
      console.log(`OK   admin login -> ${adminLogin.status}`);
    }
    await runChecks(adminChecks, adminJar);
  } else {
    await runChecks(adminChecks);
  }

  // Quick SSE sanity check
  try {
    const res = await fetchWithCookies("/api/play/stream", { timeoutMs: 1500 });
    if (res.status !== 200) {
      failed += 1;
      console.error(`FAIL /api/play/stream -> ${res.status}`);
    } else {
      console.log("OK   /api/play/stream -> 200");
    }
  } catch {
    failed += 1;
    console.error("FAIL /api/play/stream -> fetch failed");
  }

  console.log("");
  if (failed) {
    console.error(`Smoke test failed (${failed} failures).`);
    process.exit(1);
  } else {
    console.log("Smoke test passed.");
    process.exit(0);
  }
}

run();
