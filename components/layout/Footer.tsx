import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SOCIAL_LINKS } from "@/lib/constants/social";

export default function Footer() {
  const tNav = useTranslations("nav");
  const tF = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-surface-700/60 bg-surface-900">
      <div className="mx-auto max-w-container px-6 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <Image src="/logo-header.png" width={170} height={48} alt="Cones Hockey Club" className="h-10 object-contain" style={{ width: "170px" }} />
          <div className="flex justify-center gap-3 w-[170px] font-display text-base font-normal">
            <span className="text-cones-blue">{tF("tagline1")}</span>
            <span className="text-surface-50">{tF("tagline2")}</span>
            <span className="text-cones-orange">{tF("tagline3")}</span>
          </div>
        </div>
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-cones-blue mb-3">
            {tF("quickLinks")}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="hover:text-cones-blue" href="/">
                {tNav("home")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-cones-blue" href="/news">
                {tNav("news")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-cones-blue" href="/events">
                {tNav("events")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-cones-blue mb-3">
            {tF("contact")}
          </p>
          <ul className="space-y-1.5 text-sm text-surface-200">
            <li>Mirka Milojkovića 27, Beograd</li>
            <li><a href="mailto:conesbelgrade@gmail.com" className="hover:text-cones-blue transition-colors">conesbelgrade@gmail.com</a></li>
          </ul>
          <p className="mt-4 text-xs text-surface-400">PIB: 113772209 · MB: 28745303</p>
        </div>
        <div>
          <p className="font-heading text-xs uppercase tracking-[0.25em] text-cones-blue mb-3">
            {tF("follow")}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="hover:text-cones-blue" href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a className="hover:text-cones-blue" href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a className="hover:text-cones-blue" href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-surface-700/60 py-5 px-6 flex items-center justify-center text-sm text-surface-200">
        <span className="flex items-center gap-1.5">
          Designed &amp; built by{" "}
          <a
            href="https://www.webmasters-pro.com"
            target="_blank"
            rel="noreferrer"
            className="font-heading tracking-wide text-surface-200 hover:text-cones-blue transition-colors uppercase"
          >
            Webmasters Pro
          </a>
          {" "}· © {year} Webmasters Pro. {tF("rights")}
        </span>
      </div>
    </footer>
  );
}
