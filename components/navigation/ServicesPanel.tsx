"use client";

import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "@/lib/content/context";
import { serviceIcon } from "@/lib/content/icons";
import { EASE_OUT_EXPO } from "@/lib/utils/motion";

type Props = { open: boolean; onClose: () => void };

/** Desktop services panel. Opens on hover/focus of the Services nav item. */
export function ServicesPanel({ open, onClose }: Props) {
  const { services: servicesContent, home } = useSiteContent();
  const services = servicesContent.items;
  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="panel"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          className="bg-[#0f2d77]/95 absolute inset-x-0 top-full hidden border-b border-white/15 backdrop-blur-xl lg:block shadow-[0_24px_48px_rgba(11,35,95,0.5)]"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        >
          <div className="container-x grid grid-cols-1 gap-8 py-8 lg:grid-cols-12">
            <div className="col-span-3 flex flex-col justify-between border-r border-white/[0.06] pr-8">
              <div>
                <p className="eyebrow">Services</p>
                <p className="text-h4 mt-4 max-w-[24ch] font-semibold text-white">
                  {home.sections.services.title}
                </p>
              </div>
              <Link
                href="/services"
                className="group text-brand-300 text-body mt-8 inline-flex items-center gap-2 font-medium hover:text-white"
              >
                All services
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            </div>
            <ul className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-1">
              {services.map((s) => {
                const Icon = serviceIcon(s.icon);
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group flex items-start gap-3 rounded-sm px-3 py-3 transition-colors hover:bg-white/[0.04]"
                    >
                      <Icon
                        className="text-brand-300 mt-0.5 size-4 shrink-0"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span>
                        <span className="text-body block font-medium text-white">
                          {s.shortTitle}
                        </span>
                        <span className="text-ink-300 text-body mt-1 block">
                          {s.capabilities.slice(0, 3).join(" · ")}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
