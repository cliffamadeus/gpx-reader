import { useEffect, useRef } from "react";
import L from "leaflet";

const GpxPlotter = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const gpxLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent double initialization (React StrictMode)
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(
      [6.1164, 125.1716],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !mapRef.current) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      if (!mapRef.current) return; 

      const parser = new DOMParser();
      const xml = parser.parseFromString(
        event.target?.result as string,
        "text/xml"
      );

      const points = xml.getElementsByTagName("trkpt");
      const latlngs: L.LatLngExpression[] = [];

      for (let i = 0; i < points.length; i++) {
        const lat = parseFloat(points[i].getAttribute("lat") || "0");
        const lon = parseFloat(points[i].getAttribute("lon") || "0");
        latlngs.push([lat, lon]);
      }

      if (gpxLayerRef.current) {
        gpxLayerRef.current.remove();
      }

      const layer = L.polyline(latlngs, {
        color: "red",
        weight: 4,
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(layer.getBounds());

      gpxLayerRef.current = layer;
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <div style={{ padding: "10px", background: "#f4f4f4" }}>
        <input type="file" accept=".gpx" onChange={handleFileChange} />
      </div>

      <div
        ref={mapContainerRef}
        style={{ height: "90vh", width: "100%" }}
      />
    </div>
  );
};

export default GpxPlotter;