/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Category, ToastState } from './types';
import { INITIAL_PRODUCTS } from './data';
import { Settings, Search, Tag, AlertCircle } from 'lucide-react';
import ProductCard from './components/ProductCard';
import DetailsModal from './components/DetailsModal';
import AdminLoginModal from './components/AdminLoginModal';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import ShopzyLogo from './components/ShopzyLogo';
import OrderModal from './components/OrderModal';

export default function App() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  // Database store key
  const STORE_KEY = 'dealhub_curated_products';
  const PASS_KEY = 'dealhub_admin_passcode';

  // State definitions
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [adminPassword, setAdminPassword] = useState('1234');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Brand settings state
  const [storeName, setStoreName] = useState('Shopzy');
  const [tagline, setTagline] = useState('Premium Deals Store');
  const [logo, setLogo] = useState('');

  // Overlay Controls
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Toast System
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    visible: false
  });

  // Load state on startup
  useEffect(() => {
    // Fetch products from backend
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error('Server fetch failed, falling back to local cache', err);
        const cachedProducts = localStorage.getItem(STORE_KEY);
        if (cachedProducts) {
          try {
            setProducts(JSON.parse(cachedProducts));
          } catch (e) {
            setProducts(INITIAL_PRODUCTS);
          }
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
      });

    // Fetch categories from backend
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.error('Failed to fetch categories', err));

    // Fetch passcode from backend
    fetch('/api/password')
      .then((res) => res.json())
      .then((data) => {
        if (data.password) {
          setAdminPassword(data.password);
        }
      })
      .catch((err) => {
        console.error('Server pass fetch failed, falling back to local cache', err);
        const cachedPass = localStorage.getItem(PASS_KEY);
        if (cachedPass) {
          setAdminPassword(cachedPass);
        }
      });

    // Fetch brand settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.storeName) setStoreName(data.storeName);
          if (data.tagline) setTagline(data.tagline);
          if (data.logo !== undefined) setLogo(data.logo);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch brand settings', err);
      });
  }, []);

  const handleUpdatePassword = (newPass: string) => {
    fetch('/api/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPass })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update password');
        return res.json();
      })
      .then(() => {
        setAdminPassword(newPass);
        localStorage.setItem(PASS_KEY, newPass);
        showToast('Admin password code updated successfully on server!', 'success');
      })
      .catch((err) => {
        console.error(err);
        showToast('Error syncing password update to server', 'error');
      });
  };

  const handleUpdateSettings = (newName: string, newTagline: string, newLogo: string) => {
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeName: newName, tagline: newTagline, logo: newLogo })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update brand settings');
        return res.json();
      })
      .then((data) => {
        if (data.settings) {
          setStoreName(data.settings.storeName);
          setTagline(data.settings.tagline);
          setLogo(data.settings.logo);
        }
        showToast('Brand settings saved successfully!', 'success');
      })
      .catch((err) => {
        console.error(err);
        showToast('Error syncing brand settings to server', 'error');
      });
  };

  // Toast notification trigger
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  // Core functions
  const handleSaveProduct = (
    fields: Omit<Product, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, ...fields })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save product');
        return res.json();
      })
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          localStorage.setItem(STORE_KEY, JSON.stringify(data.products));
        }
        showToast(
          editId
            ? 'Product listing modified successfully on server!'
            : 'New deal listing published live on server!',
          'success'
        );
      })
      .catch((err) => {
        console.error(err);
        showToast('Error syncing product listing to server', 'error');
      });
  };

  // Delete flow
  const triggerDeleteProduct = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteProduct = () => {
    if (confirmDeleteId) {
      fetch(`/api/products/${confirmDeleteId}`, {
        method: 'DELETE'
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to delete product');
          return res.json();
        })
        .then((data) => {
          if (data.products) {
            setProducts(data.products);
            localStorage.setItem(STORE_KEY, JSON.stringify(data.products));
          }
          showToast('Product listing deleted from server.', 'success');
          setConfirmDeleteId(null);
        })
        .catch((err) => {
          console.error(err);
          showToast('Error deleting product from server', 'error');
        });
    }
  };

  const handleOpenDetails = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setSelectedProduct(prod);
    }
  };



  // Filter listings
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesQuery =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans antialiased select-none">
      {/* Top Banner Alert / Admin entry */}
      <div id="top-notification-bar" className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs py-2.5 px-4 shadow-xs sticky top-0 sm:static z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <span className="font-medium flex items-center gap-2 truncate">
            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="truncate tracking-wide font-semibold">Latest premium deals are active and updated live!</span>
          </span>
          
          <div className="flex items-center gap-2">
            <button
              id="admin-settings-trigger-btn"
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 hover:text-emerald-200 transition-colors bg-white/10 hover:bg-white/20 py-1.5 px-3.5 rounded-full text-[11px] font-bold tracking-wide flex-shrink-0 active:scale-95 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings (Admin)</span>
              <span className="inline sm:hidden">Admin</span>
            </button>
            {/* Order Button */}
            <button
              id="orderBtn"
              onClick={() => setShowOrderModal(true)}
              className="premium-btn ml-4"
            >Order Now</button>
          </div>
        </div>
      </div>

      {/* Primary Brand Navigation Bar */}
      <header id="main-app-header" className="bg-white border-b border-slate-100 sm:sticky sm:top-0 z-40 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          {/* Logo Identity */}
          <a href="#" className="flex items-center gap-3 group">
            <ShopzyLogo className="w-11 h-11 shadow-lg group-hover:scale-105 transition-transform duration-300" customLogoUrl={logo} />
            <div>
              <h1 className="text-2xl font-display font-extrabold tracking-tight text-slate-900 leading-none">
                {storeName.toLowerCase() === 'shopzy' ? (
                  <>shop<span className="text-emerald-500">zy</span></>
                ) : (
                  storeName
                )}
              </h1>
              <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mt-1">
                {tagline}
              </p>
            </div>
          </a>

          {/* Real-time Filter Bar */}
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>
      </header>

      {/* Dynamic Filter Strip (Horizontal scrolling on touch devices) */}
      <div id="category-filter-strip" className="bg-white border-b border-slate-100 py-3 overflow-x-auto whitespace-nowrap no-scrollbar sticky top-[48px] sm:top-[76px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex gap-2.5">
          <button
            id="category-tab-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/15'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50'
            }`}
          >
            <span>All Deals</span>
          </button>
          {categories.map((cat) => (
            <button
              id={`category-tab-${cat.id}`}
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/15'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Central Content */}
      <main id="main-content-layout" className="flex-grow max-w-7xl w-full mx-auto px-4 py-6">
        
        {/* Dynamic Marketing Spotlight Banner */}
        <div id="hero-marketing-spotlight" className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-10 text-white mb-6 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 max-w-2xl">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-3.5 py-1 rounded-full font-black uppercase tracking-wider border border-emerald-500/30">
              Handpicked Premium Offers
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold mt-4 tracking-tight leading-tight">
              Best Discount Offers Selected Just for You!
            </h2>
            <p className="text-slate-300 mt-3 text-xs md:text-sm leading-relaxed max-w-lg font-medium">
              We aggregate and update the highest-rated listings daily. Click on any item's 'Details' or click the 'Get Link' button to shop securely instantly.
            </p>
          </div>
        </div>

        {/* Catalog List State Summary */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-500" />
            <span>Latest Curated Offers</span>
            <span id="active-deals-count" className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-black">
              {filteredProducts.length}
            </span>
          </h3>
        </div>

        {/* Empty State / Search fallback */}
        {filteredProducts.length === 0 ? (
          <div
            id="empty-deal-state"
            className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 px-4 shadow-xs"
          >
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-slate-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-display font-bold text-slate-800">No Curated Deals Found</h4>
            <p className="text-slate-400 text-xs max-w-xs mt-1.5 leading-relaxed">
              We couldn't locate any products matching your active filter. Try resetting search or select another category!
            </p>
            <button
              id="reset-search-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors active:scale-95 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Card Directory Grid */
          <div
            id="product-directory-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
          >
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dynamic Overlays (Modals & dialogs) */}
      <DetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <AdminLoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        adminPasswordCurrent={adminPassword}
        onVerifySuccess={() => {
          setShowLoginModal(false);
          setShowAdminPanel(true);
        }}
      />

      <AdminPanel
        visible={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        products={products}
        categories={categories}
        setCategories={setCategories}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={triggerDeleteProduct}
        adminPasswordCurrent={adminPassword}
        onChangePassword={handleUpdatePassword}
        showToast={showToast}
        storeName={storeName}
        tagline={tagline}
        logo={logo}
        onUpdateSettings={handleUpdateSettings}
      />

      <ConfirmDialog
        visible={confirmDeleteId !== null}
        title="Delete Curated Deal?"
        message="This item will be permanently removed from all public categories and cannot be undone."
        onConfirm={confirmDeleteProduct}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={closeToast}
      />

      {/* Bottom Footer Area */}
      <footer id="app-footer" className="bg-slate-900 text-slate-400 py-10 mt-16 border-t border-slate-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <ShopzyLogo className="w-8 h-8 rounded-lg" customLogoUrl={logo} />
              <span className="text-white font-display font-extrabold text-lg">
                {storeName.toLowerCase() === 'shopzy' ? (
                  <>shop<span className="text-emerald-500">zy</span></>
                ) : (
                  storeName
                )}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium tracking-wide">
              &copy; {new Date().getFullYear()} {storeName}. Handcrafted for maximum conversion rate. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-xs font-semibold">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    {/* Order Modal */}
    {showOrderModal && <OrderModal onClose={() => setShowOrderModal(false)} />}
    </div>
  );
}
