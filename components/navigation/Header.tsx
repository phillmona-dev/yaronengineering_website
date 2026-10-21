"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useSiteContent } from "@/lib/content/context";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { ServicesPanel } from "./ServicesPanel";

/**
 * Sticky header: transparent over the hero, blurred solid bar after scrolling.
 * Always rendered on the dark theme so it reads over imagery; on light pages the hero is dark too.
 */
export function Header() {
  const pathname = usePathname();
  const { navigation } = useSiteContent();
  const primaryNav = navigation.primary;
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setPanelOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const solid = scrolled || panelOpen;

  return (
    <m.header
      data-theme="dark"
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className={cn(
        "text-foreground fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        solid
          ? "bg-ink-950/80 border-b border-white/[0.06] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
      onMouseLeave={() => setPanelOpen(false)}
    >
      <div className="container-x flex h-[72px] items-center justify-between lg:h-20">
        <Logo compact={scrolled} />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              const isServices = item.href === "/services";
              return (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => isServices && setPanelOpen(true)}
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-expanded={isServices ? panelOpen : undefined}
                    onFocus={() => isServices && setPanelOpen(true)}
                    className={cn(
                      "group text-ink-200 font-display text-body relative inline-flex h-10 items-center px-3.5 font-medium transition-colors duration-300 hover:text-white",
                      active && "text-white",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "bg-gold-500 ease-out-expo absolute inset-x-3.5 -bottom-px h-px origin-left transition-transform duration-300",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <Button href="/contact" size="md" arrow={false}>
              Contact Us
            </Button>
          </div>
          <button
            type="button"
            className="relative z-[60] inline-flex size-11 items-center justify-center rounded-sm border border-white/10 text-white lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="relative block h-3 w-5">
              <span
                className={cn(
                  "ease-out-expo absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300",
                  menuOpen && "translate-y-[6px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-[6px] h-px bg-current transition-opacity duration-200",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "ease-out-expo absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300",
                  menuOpen && "-translate-y-[6px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <ServicesPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </m.header>
  );
}
