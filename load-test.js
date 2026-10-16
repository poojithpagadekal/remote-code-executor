import http from "k6/http";
import { check } from "k6";

export default function () {
  const res = http.post(
    "http://localhost:3000/api/execute",
    JSON.stringify({ language: "python", code: 'print("hi")' }),
    { headers: { "Content-Type": "application/json" } },
  );

  check(res, {
    "http 200": (r) => r.status === 200,
    "job succeeded": (r) => r.json("status") === "success",
  });
}