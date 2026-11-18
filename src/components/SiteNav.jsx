import { Link, useLocation } from "react-router-dom";
import { wedding } from "../content.js";
import { useI18n } from "../i18n.jsx";

export function SiteNav() {
  const { pathname } = useLocation();
  const { lang, setLang, t } = useI18n();
  const zh = lang === "zh";

  return (
    <header className="mast">
      <Link className="wordmark" to="/">
        {zh ? wedding.shortAZh : wedding.shortA}
        <span>{zh ? " 与 " : " & "}</span>
        {zh ? wedding.shortBZh : wedding.shortB}
      </Link>
      <nav className="mast-nav" aria-label={t.navLabel}>
        {t.links.map((link) => {
          const active = link.end ? pathname === "/" : pathname.startsWith(link.to);
          return (
            <Link key={link.to} to={link.to} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="lang-switch" role="group" aria-label={t.languageLabel}>
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
        <button type="button" aria-pressed={lang === "zh"} onClick={() => setLang("zh")}>
          中文
        </button>
      </div>
    </header>
  );
}
