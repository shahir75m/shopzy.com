/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies with a larger limit (for base64 images)
  app.use(express.json({ limit: '10mb' }));

  // File paths for persistence in workspace root
  const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');
  const PASSWORD_FILE = path.join(process.cwd(), 'admin-password.txt');
  const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

  // Initial brand settings
  const INITIAL_SETTINGS = {
    storeName: 'Shopzy',
    tagline: 'Affiliate Smart Store',
    logo: '' // Empty by default, triggers high quality default SVG logo
  };

  const loadSettings = () => {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading settings.json', e);
    }
    return INITIAL_SETTINGS;
  };

  const saveSettings = (sets: any) => {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(sets, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing settings.json', e);
    }
  };

  // Initial demo products
  const INITIAL_PRODUCTS = [
    {
      id: 'prod-1',
      title: 'Apple iPhone 15 Pro Max (256 GB) - Natural Titanium',
      category: 'mobiles',
      originalPrice: 159900,
      offerPrice: 144900,
      hasOffer: true,
      image: '',
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
    }
  ];

  // Load products helper
  const loadProducts = () => {
    try {
      if (fs.existsSync(PRODUCTS_FILE)) {
        return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading products.json', e);
    }
    return INITIAL_PRODUCTS;
  };

  // Save products helper
  const saveProducts = (prods: any[]) => {
    try {
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(prods, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing products.json', e);
    }
  };

  // Load password helper
  const loadPassword = () => {
    try {
      if (fs.existsSync(PASSWORD_FILE)) {
        return fs.readFileSync(PASSWORD_FILE, 'utf-8').trim();
      }
    } catch (e) {
      console.error('Error reading admin-password.txt', e);
    }
    return '1234';
  };

  // Save password helper
  const savePassword = (pass: string) => {
    try {
      fs.writeFileSync(PASSWORD_FILE, pass, 'utf-8');
    } catch (e) {
      console.error('Error writing admin-password.txt', e);
    }
  };

  // State
  let products = loadProducts();
  let adminPassword = loadPassword();
  let brandSettings = loadSettings();

  // API endpoints
  app.get('/api/settings', (req, res) => {
    res.json(brandSettings);
  });

  app.post('/api/settings', (req, res) => {
    const { storeName, tagline, logo } = req.body;
    brandSettings = {
      storeName: storeName || brandSettings.storeName,
      tagline: tagline || brandSettings.tagline,
      logo: logo !== undefined ? logo : brandSettings.logo
    };
    saveSettings(brandSettings);
    res.json({ success: true, settings: brandSettings });
  });

  app.get('/api/products', (req, res) => {
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const { id, title, category, originalPrice, offerPrice, hasOffer, image, link, description } = req.body;
    
    if (id) {
      // Edit
      products = products.map((p: any) =>
        p.id === id
          ? { ...p, title, category, originalPrice, offerPrice, hasOffer, image, link, description }
          : p
      );
    } else {
      // New
      const newProduct = {
        id: 'prod-' + Date.now(),
        title,
        category,
        originalPrice,
        offerPrice,
        hasOffer,
        image,
        link,
        description,
        createdAt: Date.now()
      };
      products = [newProduct, ...products];
    }
    saveProducts(products);
    res.json({ success: true, products });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter((p: any) => p.id !== id);
    saveProducts(products);
    res.json({ success: true, products });
  });

  app.get('/api/password', (req, res) => {
    res.json({ password: adminPassword });
  });

  app.post('/api/password', (req, res) => {
    const { password } = req.body;
    if (password) {
      adminPassword = password;
      savePassword(password);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Password is required' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
