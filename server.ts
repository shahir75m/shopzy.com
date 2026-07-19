/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// ──────────────────────────────────────────────
// Default / Seed Data
// ──────────────────────────────────────────────
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
    description: 'Industry leading active noise cancellation with two processors controlling 8 microphones. Exceptional sound quality with High-Resolution Audio.',
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
    description: '4K Vivid High Dynamic Range, PurColor technology, powerful Crystal Processor 4K, and direct access to Disney+, Netflix, Prime Video.',
    createdAt: 1721345200000
  },
  {
    id: 'prod-4',
    title: 'Nike Air Max Alpha Training & Running Shoes',
    category: 'fashion',
    originalPrice: 7495,
    offerPrice: 5245,
    hasOffer: true,
    image: '',
    link: 'https://amazon.in',
    description: 'Finished with breathable engineered mesh and an air-padded heel unit, the Alpha offers maximum shock absorption and stability for high-intensity gym workouts.',
    createdAt: 1721345300000
  }
];

const INITIAL_CATEGORIES = [
  { id: 'mobiles', label: 'Mobiles' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home', label: 'Home Decor' },
  { id: 'other', label: 'Others' }
];

const INITIAL_SETTINGS = {
  storeName: 'Shopzy',
  tagline: 'Premium Deals Store',
  logo: ''
};

const INITIAL_PASSWORD = '1234';

// ──────────────────────────────────────────────
// Storage Layer — MongoDB OR In-Memory fallback
// ──────────────────────────────────────────────

let db: Db | null = null;

// In-memory fallback (used when MONGODB_URI is not set)
let memProducts: any[] = [...INITIAL_PRODUCTS];
let memCategories: any[] = [...INITIAL_CATEGORIES];
let memSettings: any = { ...INITIAL_SETTINGS };
let memPassword: string = INITIAL_PASSWORD;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] MONGODB_URI not set — using in-memory storage (data will reset on restart).');
    return;
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db('shopzy');
    console.log('[DB] Connected to MongoDB Atlas ✓');

    // Seed if empty
    const productCount = await db.collection('products').countDocuments();
    if (productCount === 0) {
      await db.collection('products').insertMany(INITIAL_PRODUCTS);
      console.log('[DB] Seeded initial products');
    }
    const catCount = await db.collection('categories').countDocuments();
    if (catCount === 0) {
      await db.collection('categories').insertMany(INITIAL_CATEGORIES);
      console.log('[DB] Seeded initial categories');
    }
    const settingsCount = await db.collection('settings').countDocuments();
    if (settingsCount === 0) {
      await db.collection('settings').insertOne({ _key: 'main', ...INITIAL_SETTINGS });
      console.log('[DB] Seeded initial settings');
    }
    const passCount = await db.collection('config').countDocuments({ _key: 'password' });
    if (passCount === 0) {
      await db.collection('config').insertOne({ _key: 'password', value: INITIAL_PASSWORD });
      console.log('[DB] Seeded initial password');
    }
  } catch (e) {
    console.error('[DB] MongoDB connection failed, falling back to in-memory:', e);
    db = null;
  }
}

// ──────────────────────────────────────────────
// Helper wrappers
// ──────────────────────────────────────────────

async function getProducts() {
  if (db) {
    return db.collection('products').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }
  return memProducts;
}

async function saveProduct(prod: any, editId?: string) {
  if (db) {
    if (editId) {
      await db.collection('products').updateOne({ id: editId }, { $set: prod });
    } else {
      await db.collection('products').insertOne(prod);
    }
    return getProducts();
  }
  if (editId) {
    memProducts = memProducts.map((p) => p.id === editId ? { ...p, ...prod } : p);
  } else {
    memProducts = [prod, ...memProducts];
  }
  return memProducts;
}

async function deleteProduct(id: string) {
  if (db) {
    await db.collection('products').deleteOne({ id });
    return getProducts();
  }
  memProducts = memProducts.filter((p) => p.id !== id);
  return memProducts;
}

async function getSettings() {
  if (db) {
    const doc = await db.collection('settings').findOne({ _key: 'main' }, { projection: { _id: 0, _key: 0 } });
    return doc || INITIAL_SETTINGS;
  }
  return memSettings;
}

async function saveSettings(sets: any) {
  if (db) {
    await db.collection('settings').updateOne({ _key: 'main' }, { $set: sets }, { upsert: true });
    return;
  }
  memSettings = { ...memSettings, ...sets };
}

async function getPassword() {
  if (db) {
    const doc = await db.collection('config').findOne({ _key: 'password' });
    return doc?.value || INITIAL_PASSWORD;
  }
  return memPassword;
}

async function savePasswordToDB(pass: string) {
  if (db) {
    await db.collection('config').updateOne({ _key: 'password' }, { $set: { value: pass } }, { upsert: true });
    return;
  }
  memPassword = pass;
}

async function getCategories() {
  if (db) {
    return db.collection('categories').find({}, { projection: { _id: 0 } }).toArray();
  }
  return memCategories;
}

async function addCategory(cat: any) {
  if (db) {
    await db.collection('categories').insertOne(cat);
    return getCategories();
  }
  memCategories = [...memCategories, cat];
  return memCategories;
}

async function deleteCategory(id: string) {
  if (db) {
    await db.collection('categories').deleteOne({ id });
    return getCategories();
  }
  memCategories = memCategories.filter((c) => c.id !== id);
  return memCategories;
}

// ──────────────────────────────────────────────
// Express Server
// ──────────────────────────────────────────────

async function startServer() {
  await connectDB();

  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  // Settings
  app.get('/api/settings', async (req, res) => {
    try {
      res.json(await getSettings());
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const { storeName, tagline, logo } = req.body;
      const current = await getSettings();
      const updated = {
        storeName: storeName || current.storeName,
        tagline: tagline || current.tagline,
        logo: logo !== undefined ? logo : current.logo
      };
      await saveSettings(updated);
      res.json({ success: true, settings: updated });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      res.json(await getProducts());
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const { id, title, category, originalPrice, offerPrice, hasOffer, image, link, description } = req.body;
      if (id) {
        const updated = await saveProduct({ title, category, originalPrice, offerPrice, hasOffer, image, link, description }, id);
        res.json({ success: true, products: updated });
      } else {
        const newProduct = {
          id: 'prod-' + Date.now(),
          title, category, originalPrice, offerPrice, hasOffer, image, link, description,
          createdAt: Date.now()
        };
        const updated = await saveProduct(newProduct);
        res.json({ success: true, products: updated });
      }
    } catch (e) {
      res.status(500).json({ error: 'Failed to save product' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await deleteProduct(id);
      res.json({ success: true, products: updated });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Password
  app.get('/api/password', async (req, res) => {
    try {
      res.json({ password: await getPassword() });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch password' });
    }
  });

  app.post('/api/password', async (req, res) => {
    try {
      const { password } = req.body;
      if (password) {
        await savePasswordToDB(password);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Password is required' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      res.json(await getCategories());
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const { label } = req.body;
      if (label) {
        const newCat = { id: 'cat-' + Date.now(), label };
        const updated = await addCategory(newCat);
        res.json({ success: true, categories: updated });
      } else {
        res.status(400).json({ error: 'Label is required' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Failed to add category' });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await deleteCategory(id);
      res.json({ success: true, categories: updated });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // Keep-alive ping
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite / Static
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
