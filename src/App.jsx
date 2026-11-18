import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Frame } from "./components/Frame.jsx";
import { Gift } from "./components/Gift.jsx";
import { Introduction } from "./components/Sections.jsx";
import { Wishes } from "./components/Wishes.jsx";
import { Contents } from "./pages/Contents.jsx";
import { Cover } from "./pages/Cover.jsx";
import { Share } from "./pages/Share.jsx";
import { Story } from "./pages/Story.jsx";
import "./styles.css";

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Ceremony() {
  return (
    <Frame photo="/flowers.jpg">
      <Introduction />
    </Frame>
  );
}

function GiftsPage() {
  return (
    <Frame>
      <Gift />
    </Frame>
  );
}

function MessagesPage() {
  return (
    <Frame>
      <Wishes />
    </Frame>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<Cover />} />
        <Route path="/contents" element={<Contents />} />
        <Route path="/story" element={<Story />} />
        <Route path="/ceremony" element={<Ceremony />} />
        <Route path="/gifts" element={<GiftsPage />} />
        <Route path="/registry" element={<Navigate to="/gifts" replace />} />
        <Route path="/future" element={<Navigate to="/gifts" replace />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/photos" element={<Share />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
