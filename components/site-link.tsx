"use client";
import NextLink from "next/link";
import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
const FullNavigation = createContext(false);
export function useFullNavigation() {
  return useContext(FullNavigation);
}
export function NavigationPolicy({
  full,
  children,
}: {
  full: boolean;
  children: ReactNode;
}) {
  return (
    <FullNavigation.Provider value={full}>{children}</FullNavigation.Provider>
  );
}
export default function SiteLink(props: ComponentProps<typeof NextLink>) {
  const full = useContext(FullNavigation);
  if (!full) return <NextLink {...props} />;
  // A new document destroys Auto ads before entering account, form or other
  // excluded pages. Removing a script tag during an SPA transition cannot do so.
  const {
    href,
    as,
    replace,
    scroll,
    shallow,
    passHref,
    prefetch,
    locale,
    onNavigate,
    ...rest
  } = props;
  void as;
  void replace;
  void scroll;
  void shallow;
  void passHref;
  void prefetch;
  void locale;
  void onNavigate;
  const target =
    typeof href === "string"
      ? href
      : `${href.pathname || ""}${href.query ? `?${new URLSearchParams(href.query as Record<string, string>)}` : ""}${href.hash || ""}`;
  return <a {...rest} href={target} />;
}

export { SiteLink };
