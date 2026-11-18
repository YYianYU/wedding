import { publicUrl } from "../publicUrl.js";
import { Footer } from "./Sections.jsx";
import { SiteNav } from "./SiteNav.jsx";

export function Frame({ children, photo = "" }) {
  return (
    <>
      <SiteNav />
      {photo ? (
        <figure className="page-photo">
          <img src={publicUrl(photo)} alt="" />
        </figure>
      ) : null}
      <main>{children}</main>
      <Footer />
    </>
  );
}
