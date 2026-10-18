import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

http.setResponseCallback(http.expectedStatuses(200, 503));

const accepted = new Counter("jobs_accepted");
const shed = new Counter("jobs_shed");

export const options = {
  thresholds: { http_req_failed: ["rate==0"] },
};

export default function () {
  const res = http.post(
    "http://localhost:3000/api/execute",
    JSON.stringify({ language: "python", code: "while True: pass" }),
    { headers: { "Content-Type": "application/json" } },
  );

  if (res.status === 200) accepted.add(1);
  if (res.status === 503) shed.add(1);

  check(res, {
    "accepted or shed": (r) => r.status === 200 || r.status === 503,
    "accepted jobs timed out as expected": (r) =>
      r.status !== 200 || r.json("status") === "timeout",
  });

  if (res.status === 503) sleep(1);
}