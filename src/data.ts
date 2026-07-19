/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Apple iPhone 15 Pro Max (256 GB) - Natural Titanium',
    category: 'mobiles',
    originalPrice: 159900,
    offerPrice: 144900,
    hasOffer: true,
    image: '', // will fallback or use nice illustrative shapes
    link: 'https://amazon.in',
    description: 'Forged in titanium, featuring the revolutionary A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.',
    createdAt: 1721345000000
  },
  {
    id: 'prod-2',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    category: 'electronics',
    originalPrice: 34990,
    offerPrice: 27999,
    hasOffer: true,
    image: '',
    link: 'https://amazon.in',
    description: 'Industry leading active noise cancellation with two processors controlling 8 microphones. Exceptional sound quality with High-Resolution Audio, and crystal clear hands-free calling.',
    createdAt: 1721345100000
  },
  {
    id: 'prod-3',
    title: 'Samsung 108 cm (43 inches) Crystal 4K Vivid Ultra HD Smart TV',
    category: 'electronics',
    originalPrice: 44900,
    offerPrice: 28990,
    hasOffer: true,
    image: '',
    link: 'https://amazon.in',
    description: '4K Vivid High Dynamic Range, PurColor technology, powerful Crystal Processor 4K, and direct access to Disney+, Netflix, Prime Video and more with pre-installed Smart OS.',
    createdAt: 1721345200000
  },
  {
    id: 'prod-4',
    title: 'Nike Air Max Alpha Men’s Training & Running Shoes',
    category: 'fashion',
    originalPrice: 7495,
    offerPrice: 5245,
    hasOffer: true,
    image: '',
    link: 'https://amazon.in',
    description: 'Finished with breathable engineered mesh and an air-padded heel unit, the Alpha offers maximum shock absorption and stability for high-intensity gym workouts or morning runs.',
    createdAt: 1721345300000
  },
  {
    id: 'prod-5',
    title: 'Minimalist Walnut Wood Ergonomic Monitor Stand & Riser',
    category: 'home',
    originalPrice: 4500,
    offerPrice: 3150,
    hasOffer: true,
    image: '',
    link: 'https://amazon.in',
    description: 'Handcrafted from premium solid North American walnut wood. Elevates your monitor to eye level to reduce strain while providing convenient under-desk storage slot for keyboards.',
    createdAt: 1721345400000
  },
  {
    id: 'prod-6',
    title: 'Vandelay C-Type Ergonomic Travel Neck Pillow',
    category: 'other',
    originalPrice: 1999,
    offerPrice: 999,
    hasOffer: true,
    image: '',
    link: 'https://amazon.in',
    description: 'Premium quality dense memory foam core that matches the contours of your neck. Wrapped in a washable, super-soft magnetic-therapy cooling-gel outer lining.',
    createdAt: 1721345500000
  }
];

export const CATEGORIES: Category[] = [
  { key: 'all', label: 'All Deals', icon: 'Sparkles' },
  { key: 'mobiles', label: 'Mobiles', icon: 'Smartphone' },
  { key: 'electronics', label: 'Electronics', icon: 'Laptop' },
  { key: 'fashion', label: 'Fashion', icon: 'Shirt' },
  { key: 'home', label: 'Home Decor', icon: 'Home' },
  { key: 'other', label: 'Others', icon: 'Grid' }
];
