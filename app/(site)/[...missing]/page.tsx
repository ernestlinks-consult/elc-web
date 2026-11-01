import { notFound } from "next/navigation";

// Sends any unknown public URL to the branded not-found page, with a real 404:
// it throws before anything streams.
export default function Missing() {
  notFound();
}
