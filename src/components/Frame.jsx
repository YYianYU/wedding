import { Link } from "react-router-dom";
import { publicUrl } from "../publicUrl.js";
import { Footer } from "./Sections.jsx";

export function Frame({ children, showBack = true, photo = "" }) {
  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">
          Zhongxin &amp; Yian
        </Link>
        <Link className="contents-link" to="/contents">
          Contents
        </Link>
      </header>
      {photo ? (
        <figure className="page-photo">
          <img src={publicUrl(photo)} alt="" />
        </figure>
      ) : null}
      <main>{children}</main>
      {showBack ? (
        <p className="back">
          <Link to="/contents">Back to contents</Link>
        </p>
      ) : null}
      <Footer />
    </>
  );
}
