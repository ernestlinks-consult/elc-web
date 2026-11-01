import { cacheLife } from "next/cache";

// Cache Components needs timestamps cached so pages can stay static.
export async function getCurrentYear() {
  "use cache";
  cacheLife("days");

  return new Date().getFullYear();
}
