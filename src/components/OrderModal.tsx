import React, { useState, useEffect } from 'react';
import { Product } from '../types';

// NOTE: Replace the placeholder values below with your actual Google Form embed URL
// and (optional) Google Maps Embed API key if you have one.
const GOOGLE_FORM_EMBED_URL = 'YOUR_GOOGLE_FORM_EMBED_URL';
const GOOGLE_MAPS_API_KEY = '';

interface OrderModalProps {
  product?: Product | null;
  onClose: () => void;
}

export default function OrderModal({ product, onClose }: OrderModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Place Your Order</h2>
        <p className="text-xs text-slate-500 mb-4">Enter your delivery details and fill out the order form below.</p>

        {/* Selected Product Summary Card */}
        {product && (
          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-5">
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="w-14 h-14 object-contain rounded-lg bg-white p-1 border border-slate-100"
              />
            )}
            <div className="flex-grow min-w-0">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                Ordering Item
              </span>
              <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">{product.title}</h4>
              <p className="text-xs font-black text-emerald-600">
                ₹{product.hasOffer ? product.offerPrice.toLocaleString('en-IN') : product.originalPrice.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
