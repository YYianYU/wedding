import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "../i18n.jsx";

const chinaStops = [
  { key: "sustech", at: [22.599, 113.997] },
  { key: "wuyuan", at: [29.248, 117.862] },
  { key: "bazhong", at: [31.868, 106.753] },
];

const china = {
  stops: chinaStops,
  path: [
    [22.599, 113.997],
    [29.248, 117.862],
    [22.599, 113.997],
    [31.868, 106.753],
    [29.248, 117.862],
  ],
};

const americaStops = [
  { key: "station", at: [30.628, -96.334] },
  { key: "arbor", at: [42.281, -83.743] },
];

const america = {
  stops: americaStops,
  path: [
    [30.628, -96.334],
    [42.281, -83.743],
    [30.628, -96.334],
  ],
};

function draw(node, place) {
  const map = L.map(node, {
    scrollWheelZoom: false,
    zoomControl: false,
    attributionControl: true,
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  const icon = L.divIcon({
    className: "map-pin",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  L.polyline(place.path, { color: "#9c8454", weight: 2, opacity: 0.9 }).addTo(map);

  place.stops.forEach((stop) => {
    L.marker(stop.at, { icon })
      .bindTooltip(stop.name, {
        permanent: true,
        direction: "top",
        offset: [0, -8],
        className: "map-label",
      })
      .addTo(map);
  });

  map.fitBounds(place.stops.map((stop) => stop.at), { padding: [36, 36] });
  return map;
}

function Panel({ place }) {
  const node = useRef(null);

  useEffect(() => {
    const map = draw(node.current, place);
    const frame = requestAnimationFrame(() => map.invalidateSize());
    return () => {
      cancelAnimationFrame(frame);
      map.remove();
    };
  }, [place]);

  return (
    <figure className="map-panel">
      <figcaption>{place.title}</figcaption>
      <div ref={node} className="map-canvas" />
    </figure>
  );
}

export function JourneyMap() {
  const { t } = useI18n();
  const maps = useMemo(
    () =>
      [
        { title: t.mapChina, ...china },
        { title: t.mapUs, ...america },
      ].map((place) => ({
        ...place,
        stops: place.stops.map((stop) => ({ ...stop, name: t.stops[stop.key] })),
      })),
    [t],
  );

  return (
    <div className="atlas">
      {maps.map((place) => (
        <Panel key={place.title} place={place} />
      ))}
    </div>
  );
}
