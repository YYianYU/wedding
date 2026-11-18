import { Link, useLocation } from "react-router-dom";
import { wedding } from "../content.js";
import { useI18n } from "../i18n.jsx";
import { useMusic } from "../music.jsx";

function MusicNoteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M10 4v11.2a3.2 3.2 0 1 1-1.6-2.8V7.4l8-1.6v7.6a3.2 3.2 0 1 1-1.6-2.8V4.8L10 4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteNav() {
  const { pathname } = useLocation();
  const { lang, setLang, t } = useI18n();
  const { playing, toggle } = useMusic();
  const zh = lang === "zh";

  return (
    <header className="mast">
      <button
        type="button"
        className={`music-toggle${playing ? " is-playing" : ""}`}
        aria-label={playing ? t.pauseMusic : t.playMusic}
        aria-pressed={playing}
        onClick={toggle}
      >
        <MusicNoteIcon />
      </button>
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
