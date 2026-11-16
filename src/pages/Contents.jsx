import { Link } from "react-router-dom";
import { Frame } from "../components/Frame.jsx";

const pages = [
  { to: "/story", num: "01", title: "Our story", note: "The places and the years" },
  { to: "/ceremony", num: "02", title: "The ceremony", note: "When and where we marry" },
  { to: "/registry", num: "03", title: "Registry", note: "For our home" },
  { to: "/future", num: "04", title: "Our future life", note: "A gift, if you wish" },
  { to: "/messages", num: "05", title: "Messages", note: "Leave a word for us" },
  { to: "/photos", num: "06", title: "Share photos", note: "Add a picture from the day" },
];

export function Contents() {
  return (
    <Frame showBack={false}>
      <div className="toc-layout">
        <div className="toc-copy">
          <header className="section-h">
            <h1>Contents</h1>
            <p>Choose a page</p>
          </header>
          <nav className="toc" aria-label="Contents">
            {pages.map((page) => (
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
