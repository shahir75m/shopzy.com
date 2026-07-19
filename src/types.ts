/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  hasOffer: boolean;
  image: string; // Base64 or external url
  link: string;
  description: string;
  clicks?: number; // optionally track engagement
  createdAt: number;
}

export interface Category {
  id: string;
  label: string;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}
