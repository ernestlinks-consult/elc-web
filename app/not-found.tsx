import type { Metadata } from "next";
import NotFound from "./(site)/not-found";
import SiteLayout from "./(site)/layout";

// Next serves this static page with a real 404 for any URL with no route, and
// proxy.ts sends bad filters and unknown slugs here. Avoid notFound() in a
// prerendered route instead: it sends an empty document that fills in from
// location.pathname, blank without JavaScript and losing the query string.

export const metadata: Metadata = {
  title: "Page not found | ErnestLinks Consult",
};

export default function RootNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}
