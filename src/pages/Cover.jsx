import { Link } from "react-router-dom";
import { wedding } from "../content.js";
import { publicUrl } from "../publicUrl.js";

export function Cover() {
  return (
    <section className="cover">
      <figure className="cover-photo">
        <img src={publicUrl("/story/sustech-walk.jpg")} alt="Zhongxin and Yian walking hand in hand at SUSTech" />
      </figure>
      <div className="cover-copy">
        <div className="cover-main">
          <svg className="cross cover-cross" viewBox="0 0 24 40" aria-hidden="true">
            <path d="M12 1.5v37M3.5 11.5h17" />
          </svg>
          <p className="kicker">The marriage of</p>
          <h1>
            <span>{wedding.partnerA}</span>
            <em>&amp;</em>
            <span>{wedding.partnerB}</span>
          </h1>
          <p className="cover-meta">
            {wedding.weekday}, {wedding.dateDisplay}
            <br />
            {wedding.time}
            <br />
            {wedding.place}
          </p>
          <p className="cover-verse">
            {wedding.verse}
            <cite>{wedding.verseRef}</cite>
          </p>
        </div>
        <Link className="enter" to="/contents">
          Contents
        </Link>
      </div>
    </section>
  );
}
