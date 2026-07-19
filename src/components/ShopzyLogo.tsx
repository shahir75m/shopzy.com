/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ShopzyLogoProps {
  className?: string;
  customLogoUrl?: string;
}

export default function ShopzyLogo({ className = "w-10 h-10", customLogoUrl }: ShopzyLogoProps) {
  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Shopzy Logo"
        className={`${className} object-contain rounded-xl`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback to default SVG on error
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shopzy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      
      {/* Glossy Background Circle/Box container to match premium design */}
      <rect width="100" height="100" rx="28" fill="#0f172a" />
      
      {/* Handle of the shopping bag */}
      <path 
        d="M38 38 C38 23, 62 23, 62 38" 
        fill="none" 
        stroke="url(#shopzy-grad)" 
        strokeWidth="5" 
        strokeLinecap="round" 
      />
      
      {/* Bag/Cart Body */}
      <path 
        d="M26 42 L74 42 L66 70 C65 73, 61 75, 56 75 L38 75" 
        fill="url(#shopzy-grad)" 
      />
      
      {/* S-shaped glossy cart path in bold white */}
      <path 
        d="M36 49 C40 47, 58 47, 62 49 C64 51, 60 55, 50 57 C38 59, 34 63, 36 67 C38 71, 52 73, 62 71" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Wheels */}
      <circle cx="38" cy="83" r="5" fill="#10b981" />
      <circle cx="62" cy="83" r="5" fill="#10b981" />
    </svg>
  );
}
