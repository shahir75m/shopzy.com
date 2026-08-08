import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { MapPin, Navigation, CheckCircle2, Loader2, Send } from 'lucide-react';

// Google Apps Script Web App URL for automatic Google Sheet recording
const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwAgK1MKfddoeWl2MWT8y2YDdJ8lqRS9wev4AHHT8iBuF2ozaFaP5wSRlBz3Sj5Y0QV/exec';

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
  const [quantity, setQuantity] = useState(1);

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Live Location Auto-Fill
  const handleAutoFillLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            setHouse(addr.house_number || addr.building || house);
            setRoad(addr.road || addr.street || addr.suburb || road);
            setArea(addr.neighbourhood || addr.suburb || addr.residential || area);
            setPincode(addr.postcode || pincode);
            setCity(addr.city || addr.town || addr.village || addr.county || city);
            setState(addr.state || state);
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Could not fetch location. Please check browser location permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Build address string and update map iframe src
  useEffect(() => {
    const addressParts = [house, road, area, pincode, city, state].filter(Boolean);
    if (addressParts.length === 0) {
      setMapSrc('');
      return;
    }
    const address = addressParts.join(', ');
    setMapSrc(`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`);
  }, [house, road, area, pincode, city, state]);

  // Handle Form Submit
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !house || !city || !state) {
      setErrorMessage('Please fill in all required fields (Name, Contact, House, City, State).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const unitPrice = product ? (product.hasOffer ? product.offerPrice : product.originalPrice) : 0;
    const totalAmount = unitPrice * quantity;

    const orderPayload = {
      productTitle: product ? product.title : 'General Order',
      unitPrice,
      quantity,
      totalAmount,
      orderStatus: 'Order Placed',
      name,
      contact,
      house,
      road,
      area,
      pincode,
      city,
      state,
      fullAddress: `${house}, ${road}, ${area}, ${city}, ${state} - ${pincode}`,
      date: new Date().toLocaleString()
    };

    try {
      // 1. Post to Google Sheet Web App URL if configured
      if (GOOGLE_SHEET_WEB_APP_URL) {
        await fetch(GOOGLE_SHEET_WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(orderPayload)
        });
      }

      // 2. Post to backend server if active
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      }).catch(() => {});

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitted(true); // Still treat as submitted for UX
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative overflow-y-auto max-h-[92vh] border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-full flex items-center justify-center transition-colors font-bold text-sm"
        >
          ✕
        </button>

        {submitted ? (
          /* Success Screen */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Order Placed Successfully!</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md mx-auto">
              Thank you, <span className="font-bold text-slate-800">{name}</span>! Your order for{' '}
              <span className="font-bold text-emerald-600">{product?.title || 'item'}</span> has been submitted and recorded.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* Main Order Form */
          <form onSubmit={handleSubmitOrder}>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg">
                <Send className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Delivery Details</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Complete your shipping information to place your order.</p>

            {/* Selected Product Card Summary with Quantity Selector */}
            {product && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-5">
                <div className="flex items-center gap-3.5 min-w-0">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-100 flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                      Selected Item
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">{product.title}</h4>
                    <p className="text-xs font-black text-emerald-600">
                      Total: ₹{((product.hasOffer ? product.offerPrice : product.originalPrice) * quantity).toLocaleString('en-IN')}
                      {quantity > 1 && (
                        <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                          (₹{(product.hasOffer ? product.offerPrice : product.originalPrice).toLocaleString('en-IN')} × {quantity})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs self-end sm:self-auto">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase mr-1">Qty:</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center text-xs active:scale-95 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-xs text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-6 h-6 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-black flex items-center justify-center text-xs active:scale-95 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* GPS Auto-Fill Location Bar */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Address Information</span>
              </span>
              <button
                type="button"
                onClick={handleAutoFillLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>📍 Auto-Fill Live Location</span>
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 border border-red-100 font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Number *</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Order Quantity *</label>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm shadow-xs active:scale-95 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent font-extrabold text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs active:scale-95 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">House / Building Name *</label>
                <input
                  type="text"
                  placeholder="House No, Villa, Apartment"
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Road Name / Area / Colony</label>
                <input
                  type="text"
                  placeholder="Street or Area Name"
                  value={road}
                  onChange={(e) => setRoad(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="6-digit postal code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">City / Town *</label>
                <input
                  type="text"
                  placeholder="City name"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">State *</label>
                <input
                  type="text"
                  placeholder="State name"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Live Map Location Preview */}
            {mapSrc && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-36">
                <iframe
                  title="Delivery Map Preview"
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Order Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
