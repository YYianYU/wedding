import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const china = {
  title: "China",
  stops: [
    { name: "SUSTech", at: [22.599, 113.997] },
    { name: "Wuyuan", at: [29.248, 117.862] },
    { name: "Bazhong", at: [31.868, 106.753] },
  ],
  path: [
    [22.599, 113.997],
    [29.248, 117.862],
    [22.599, 113.997],
    [31.868, 106.753],
    [29.248, 117.862],
  ],
};

const america = {
  title: "United States",
  stops: [
    { name: "College Station", at: [30.628, -96.334] },
    { name: "Ann Arbor", at: [42.281, -83.743] },
  ],
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
  return (
    <div className="atlas">
      <Panel place={china} />
      <Panel place={america} />
    </div>
  );
}
