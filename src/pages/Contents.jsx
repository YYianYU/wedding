import { Link } from "react-router-dom";
import { Frame } from "../components/Frame.jsx";
import { useI18n } from "../i18n.jsx";

export function Contents() {
  const { t } = useI18n();

  return (
    <Frame>
      <div className="toc-layout">
        <div className="toc-copy">
          <header className="section-h">
            <h1>{t.contentsTitle}</h1>
            <p>{t.contentsKicker}</p>
          </header>
          <nav className="toc" aria-label={t.contentsLabel}>
            {t.pages.map((page) => (
              <Link key={page.to} to={page.to}>
                <span className="num">{page.num}</span>
                <strong>{page.title}</strong>
                <em>{page.note}</em>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </Frame>
  );
}