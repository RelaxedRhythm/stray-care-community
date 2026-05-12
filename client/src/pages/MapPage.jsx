import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import api from '../api.js';

const defaultCenter = { lat: 28.6139, lng: 77.209 }; // Delhi — adjust via env

export default function MapPage() {
  const [cases, setCases] = useState([]);
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    api.get('/cases/public').then((r) => setCases(r.data));
  }, []);

  const markers = useMemo(
    () =>
      cases.filter((c) => c.location?.lat != null && c.location?.lng != null && ['open', 'funded'].includes(c.status)),
    [cases]
  );

  const center = useMemo(() => {
    if (!markers.length) return defaultCenter;
    const lat = markers.reduce((s, m) => s + m.location.lat, 0) / markers.length;
    const lng = markers.reduce((s, m) => s + m.location.lng, 0) / markers.length;
    return { lat, lng };
  }, [markers]);

  const mapContainerStyle = useMemo(() => ({ width: '100%', height: '480px', borderRadius: '1.5rem' }), []);

  if (!key) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-paw-950">Map</h1>
        <p className="mt-4 text-slate-600">
          Add <code className="rounded bg-slate-100 px-2 py-0.5">VITE_GOOGLE_MAPS_API_KEY</code> to{' '}
          <code className="rounded bg-slate-100 px-2 py-0.5">client/.env</code> to enable Google Maps. Cases with
          coordinates will appear as pins.
        </p>
        <ul className="mt-8 space-y-2 text-left text-sm text-slate-600">
          {cases.slice(0, 8).map((c) => (
            <li key={c._id}>
              <Link className="font-medium text-paw-800 hover:underline" to={`/cases/${c._id}`}>
                {c.title}
              </Link>{' '}
              {c.location?.address && `— ${c.location.address}`}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-paw-950">Cases on the map</h1>
      <p className="mt-2 text-slate-600">Pins show active cases that include coordinates from volunteers.</p>
      <div className="mt-8 overflow-hidden ring-1 ring-paw-100">
        <LoadScript googleMapsApiKey={key}>
          <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={markers.length ? 11 : 5}>
            {markers.map((c) => (
              <Marker
                key={c._id}
                position={{ lat: c.location.lat, lng: c.location.lng }}
                title={c.title}
                onClick={() => (window.location.href = `/cases/${c._id}`)}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
