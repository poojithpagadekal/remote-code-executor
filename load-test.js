import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  vus: 5,
  duration: "30s",
};

export default function () {
  const res = http.post(
    "http://localhost:3000/api/execute",
    JSON.stringify({ language: "python", code: "while True: pass" }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "status is not 429": (r) => r.status !== 429,
  });

  sleep(1);
}