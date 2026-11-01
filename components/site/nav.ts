/** True for the page itself, and for pages below it when `exact` is false. */
export function isCurrentPath(pathname: string, href: string, exact = true) {
  if (pathname === href) return true;
  return !exact && pathname.startsWith(`${href}/`);
}
