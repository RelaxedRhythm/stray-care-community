import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent() {
  const position = [28.7041, 77.1025]; // Delhi coordinates

  return (
    <MapContainer center={position} zoom={13} style={{ height: "500px", width: "100%" }}>
      
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>
          Example location
        </Popup>
      </Marker>

    </MapContainer>
  );
}