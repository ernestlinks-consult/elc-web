import { notFound } from "next/navigation";

// proxy.ts rewrites here when a lead doesn't exist or isn't visible to this person.
// It sits outside the (staff) layout, which streams: there the 200 has already gone
// by the time a page could say not found.
export default function Missing() {
  notFound();
}
