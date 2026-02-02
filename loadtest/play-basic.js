import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 25,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const home = http.get(`${BASE_URL}/`);
  check(home, { "home 200": (res) => res.status === 200 });

  const tournaments = http.get(`${BASE_URL}/tournaments`);
  check(tournaments, { "tournaments 200": (res) => res.status === 200 });

  const play = http.get(`${BASE_URL}/play`);
  check(play, { "play 200": (res) => res.status === 200 });

  sleep(1);
}
