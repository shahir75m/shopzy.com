// src/components/OrderModal.tsx
import React, { useState, useEffect } from 'react';

// NOTE: Replace the placeholder values below with your actual Google Form embed URL
// and (optional) Google Maps Embed API key if you have one.
const GOOGLE_FORM_EMBED_URL = 'YOUR_GOOGLE_FORM_EMBED_URL';
const GOOGLE_MAPS_API_KEY = '';

export default function OrderModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [house, setHouse] = useState('');
  const [road, setRoad] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [mapSrc, setMapSrc] = useState('');

  // Build address string and update map iframe src
  useEffect(() => {
    const addressParts = [house, road, area, pincode, city, state].filter(Boolean);
    if (addressParts.length === 0) {
      setMapSrc('');
      return;
    }
    const address = addressParts.join(', ');
    const base = GOOGLE_MAPS_API_KEY
      ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=`
      : 'https://www.google.com/maps?q=';
    const url = GOOGLE_MAPS_API_KEY
      ? `${base}${encodeURIComponent(address)}`
      : `${base}${encodeURIComponent(address)}&output=embed`;
    setMapSrc(url);
  }, [house, road, area, pincode, city, state]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-800"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Place Your Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="tel"
            placeholder="Contact Number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="House No / Building"
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Road / Area / Colony"
            value={road}
            onChange={(e) => setRoad(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {/* Map preview */}
        {mapSrc && (
          <div className="mt-4 h-64">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        )}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Order Details (Google Form)</h3>
          <iframe
            src={GOOGLE_FORM_EMBED_URL}
            width="100%"
            height="400"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
          >
            Loading…
          </iframe>
          <p className="text-sm text-gray-500 mt-2">
            After filling the form, click submit. The response will be added to your Google Sheet.
          </p>
        </div>
      </div>
    </div>
  );
}
