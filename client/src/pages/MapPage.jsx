import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { API_ORIGIN } from "../config.js";

const defaultCenter = [20.5937, 78.9629];

export default function MapComponent() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendOrigin = API_ORIGIN || "http://localhost:9000";

  const fetchMarkers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendOrigin}/api/markers`);
      const data = await res.json();
      setMarkers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error fetching markers", err);
      setMarkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center text-slate-600">
        Loading map markers...
      </div>
    );
  }

  if (!markers.length) {
    return (
      <div>
        <div className="flex min-h-[20rem] items-center justify-center text-slate-600">
          No open cases found to display on the map.
        </div>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={defaultCenter}>
            <Popup>Default</Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.length > 0 &&
        markers.map((marker) => (
           
          <Marker position={marker.position} key={marker.caseId}>
            <Popup>{marker.popup}</Popup>
          </Marker>
          
        ))}
    </MapContainer>
  );
}
