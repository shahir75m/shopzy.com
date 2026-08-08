/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../types';
import { Tag, ShoppingCart, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (id: string) => void;
  onOrderNow: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  key?: React.Key;
}

export default function ProductCard({ product, onOpenDetails, onOrderNow, onAddToCart }: ProductCardProps) {
  const hasOffer = product.hasOffer;
  const discountPercent = hasOffer
    ? Math.round(((product.originalPrice - product.offerPrice) / product.originalPrice) * 100)
    : 0;

  const imageUrl = product.image
    ? product.image
    : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop`; // Beautiful default fallback object

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'mobiles': return 'Mobiles';
      case 'electronics': return 'Electronics';
      case 'fashion': return 'Fashion';
      case 'home': return 'Home Decor';
      default: return 'Others';
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
    >
      {/* Product Image Area - Clicking opens details */}
      <div 
        className="relative bg-slate-50 h-48 sm:h-52 flex items-center justify-center p-4 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails(product.id)}
      >
        <img
          src={imageUrl}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop';
          }}
        />
        {hasOffer && discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Card Details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
            {getCategoryLabel(product.category)}
          </span>
          <h4 
            onClick={() => onOpenDetails(product.id)}
            className="font-display font-bold text-slate-800 text-sm sm:text-base mt-2.5 leading-snug line-clamp-2 h-11 cursor-pointer hover:text-emerald-600 transition-colors"
          >
            {product.title}
          </h4>

          <div className="mt-3 h-8 flex items-center">
            {hasOffer ? (
              <div className="flex items-baseline gap-2">
                <span className="text-emerald-600 font-extrabold text-base sm:text-lg">
                  ₹{product.offerPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-400 line-through text-xs font-semibold">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-slate-800 font-extrabold text-base sm:text-lg">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart & Order Now */}
        <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-slate-100 flex-shrink-0">
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={() => onAddToCart(product)}
            className="py-2.5 px-3 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
            <span>Add to Cart</span>
          </button>
          <button
            id={`order-now-btn-${product.id}`}
            onClick={() => onOrderNow(product)}
            className="py-2.5 px-3 text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
