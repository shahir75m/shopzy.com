/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { X, Tag, ExternalLink, Info } from 'lucide-react';
import { Product } from '../types';

interface DetailsModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function DetailsModal({ product, onClose }: DetailsModalProps) {
  if (!product) return null;

  const hasOffer = product.hasOffer;
  const discountPercent = hasOffer
    ? Math.round(((product.originalPrice - product.offerPrice) / product.originalPrice) * 100)
    : 0;

  const imageUrl = product.image
    ? product.image
    : `https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop`;

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
    <AnimatePresence>
      <div
        id="details-modal-wrapper"
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          id="details-modal"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-none flex flex-col"
        >
          {/* Header Image Frame */}
          <div className="relative bg-slate-50 h-60 sm:h-64 flex items-center justify-center p-6 flex-shrink-0">
            <img
              src={imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="object-contain max-h-full max-w-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop';
              }}
            />
            {hasOffer && discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {discountPercent}% OFF
              </div>
            )}
            <button
              id="close-modal-x-btn"
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/95 hover:bg-white text-slate-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:text-rose-500 transition-colors active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto flex-grow">
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
              {getCategoryLabel(product.category)}
            </span>
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 mt-2.5 leading-tight">
              {product.title}
            </h3>

            {/* Price Box */}
            <div className="flex flex-col gap-1 mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xs text-slate-500 font-semibold">
                  {hasOffer ? 'Offer Price:' : 'Standard Price:'}
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  ₹{hasOffer ? product.offerPrice.toLocaleString('en-IN') : product.originalPrice.toLocaleString('en-IN')}
                </span>
                {hasOffer && (
                  <span className="text-sm text-slate-400 line-through font-semibold">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {hasOffer && (
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <Tag className="w-3.5 h-3.5" />
                  You save ₹{(product.originalPrice - product.offerPrice).toLocaleString('en-IN')} on this exclusive deal!
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Product Highlights
              </h4>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pr-1">
                {product.description}
              </p>
            </div>

            {/* CTA action */}
            <div className="mt-6">
              <a
                id="details-modal-buy-link"
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-center text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Get Link (Go to Store)</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
