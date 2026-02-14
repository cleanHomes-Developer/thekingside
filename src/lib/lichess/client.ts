type LichessConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  platformToken: string | null;
};

export function getLichessConfig(): LichessConfig | null {
  const clientId = process.env.LICHESS_CLIENT_ID ?? "";
  const clientSecret = process.env.LICHESS_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    baseUrl: process.env.LICHESS_BASE_URL ?? "https://lichess.org",
    clientId,
    clientSecret,
    platformToken: process.env.LICHESS_PLATFORM_TOKEN ?? null,
  };
}

export function getLichessBaseUrl() {
  return process.env.LICHESS_BASE_URL ?? "https://lichess.org";
}

export async function exchangeLichessToken(code: string, redirectUri: string) {
  const config = getLichessConfig();
  if (!config) {
    throw new Error("Lichess OAuth not configured");
  }

  const response = await fetch(`${config.baseUrl}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Lichess token");
  }

  return (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in?: number;
  };
}

export async function fetchLichessAccount(accessToken: string) {
  const baseUrl = getLichessBaseUrl();
  const response = await fetch(`${baseUrl}/api/account`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Lichess account");
  }

  return (await response.json()) as {
    id: string;
    username: string;
  };
}

export async function createLichessChallenge(
  username: string,
  timeControl: string | null,
  platformToken: string,
) {
  const baseUrl = getLichessBaseUrl();
  const response = await fetch(`${baseUrl}/api/challenge/${username}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${platformToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      rated: "false",
      "clock.limit": timeControl?.split("+")[0] ?? "",
      "clock.increment": timeControl?.split("+")[1] ?? "",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create Lichess challenge");
  }

  return (await response.json()) as {
    challenge: { id: string };
  };
}

export async function fetchLichessGame(gameId: string, accessToken: string) {
  const baseUrl = getLichessBaseUrl();
  const response = await fetch(`${baseUrl}/api/game/export/${gameId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Lichess game");
  }

  const data = await response.json();
  const { parseLichessGame } = await import("./schema");
  return parseLichessGame(data);
}
