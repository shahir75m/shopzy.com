/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import {
  X,
  PlusCircle,
  FileCode,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Edit2,
  Trash2,
  Key,
  ShieldAlert,
  Sliders,
  FolderPlus
} from 'lucide-react';

interface AdminPanelProps {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onSaveProduct: (product: Omit<Product, 'id' | 'createdAt'>, editId?: string) => void;
  onDeleteProduct: (id: string) => void;
  adminPasswordCurrent: string;
  onChangePassword: (newPass: string) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
  storeName: string;
  tagline: string;
  logo: string;
  onUpdateSettings: (name: string, tagline: string, logo: string) => void;
}

export default function AdminPanel({
  visible,
  onClose,
  products,
  categories,
  setCategories,
  onSaveProduct,
  onDeleteProduct,
  adminPasswordCurrent,
  onChangePassword,
  showToast,
  storeName,
  tagline,
  logo,
  onUpdateSettings
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'categories' | 'brand'>('form');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [editId, setEditId] = useState<string>('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [orgPrice, setOrgPrice] = useState('');
  const [hasOffer, setHasOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');

  // Branding states
  const [inputStoreName, setInputStoreName] = useState(storeName);
  const [inputTagline, setInputTagline] = useState(tagline);
  const [inputLogo, setInputLogo] = useState(logo);

  // Sync brand states when props load
  useEffect(() => {
    setInputStoreName(storeName);
    setInputTagline(tagline);
    setInputLogo(logo);
  }, [storeName, tagline, logo]);

  // Password modify fields
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Reset form helper
  const resetForm = () => {
    setEditId('');
    setTitle('');
    setCategory(categories[0]?.id || '');
    setOrgPrice('');
    setHasOffer(false);
    setOfferPrice('');
    setImage('');
    setLink('');
    setDescription('');
  };

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].id);
    }
  }, [categories]);

  // Category management handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryLabel.trim()) {
      showToast('Please enter a category name!', 'error');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newCategoryLabel.trim() })
      });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        setNewCategoryLabel('');
        showToast('Category added successfully!', 'success');
      }
    } catch (err) {
      showToast('Error adding category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        showToast('Category deleted!', 'success');
      }
    } catch (err) {
      showToast('Error deleting category', 'error');
    }
  };

  // Populate form for editing
  const handleEditSelect = (prod: Product) => {
    setEditId(prod.id);
    setTitle(prod.title);
    setCategory(prod.category);
    setOrgPrice(prod.originalPrice.toString());
    setHasOffer(prod.hasOffer);
    setOfferPrice(prod.hasOffer ? prod.offerPrice.toString() : '');
    setImage(prod.image);
    setLink(prod.link);
    setDescription(prod.description);
    
    // Switch to form tab on small devices
    setActiveTab('form');
    showToast('Loaded product data into editor form.', 'success');
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Image file size must be less than 8MB', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const MAX_HEIGHT = 350;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > MAX_WIDTH) {
            h *= MAX_WIDTH / w;
            w = MAX_WIDTH;
          }
        } else {
          if (h > MAX_HEIGHT) {
            w *= MAX_HEIGHT / h;
            h = MAX_HEIGHT;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          // Compressed format
          const base64Str = canvas.toDataURL('image/jpeg', 0.65);
          setImage(base64Str);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Brand Logo Upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Logo file size must be less than 5MB', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > MAX_WIDTH) {
            h *= MAX_WIDTH / w;
            w = MAX_WIDTH;
          }
        } else {
          if (h > MAX_HEIGHT) {
            w *= MAX_HEIGHT / h;
            h = MAX_HEIGHT;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const base64Str = canvas.toDataURL('image/png', 0.85);
          setInputLogo(base64Str);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !orgPrice || !link.trim() || !description.trim()) {
      showToast('Please fill out all required fields marked with *', 'error');
      return;
    }

    const oPrice = parseFloat(orgPrice);
    let fPrice = oPrice;

    if (hasOffer) {
      if (!offerPrice) {
        showToast('Please enter the active discount Offer Price!', 'error');
        return;
      }
      fPrice = parseFloat(offerPrice);
      if (fPrice >= oPrice) {
        showToast('Offer price must be less than standard price!', 'error');
        return;
      }
    }

    onSaveProduct({
      title,
      category,
      originalPrice: oPrice,
      offerPrice: fPrice,
      hasOffer,
      image,
      link,
      description
    }, editId || undefined);

    resetForm();
    
    // Switch to list tab on narrow viewports
    if (window.innerWidth < 768) {
      setActiveTab('list');
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPass !== adminPasswordCurrent) {
      showToast('Current admin passcode is incorrect!', 'error');
      return;
    }
    if (newPass.trim().length < 4) {
      showToast('New password must contain at least 4 characters!', 'error');
      return;
    }
    onChangePassword(newPass);
    setOldPass('');
    setNewPass('');
    setShowPassModal(false);
  };

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStoreName.trim()) {
      showToast('Store name is required!', 'error');
      return;
    }
    onUpdateSettings(inputStoreName, inputTagline, inputLogo);
  };

  if (!visible) return null;

  return (
    <div
      id="admin-panel-wrapper"
      className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-[80] flex items-center justify-center p-0 sm:p-4"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full h-[95vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Panel Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center flex-shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold">Admin Curation Panel</h3>
              <p className="text-[10px] text-slate-400 font-medium">Manage product catalogs and links live</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="change-pass-trigger-btn"
              onClick={() => setShowPassModal(true)}
              className="text-[10px] sm:text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-3 rounded-lg border border-slate-700 transition-colors active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change Passcode</span>
            </button>
            <button
              id="close-admin-panel-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-white flex-shrink-0 overflow-x-auto no-scrollbar">
          <button
            id="admin-tab-form-btn"
            onClick={() => setActiveTab('form')}
            className={`flex-1 min-w-fit py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 px-3 ${
              activeTab === 'form'
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50/5'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <PlusCircle className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{editId ? 'Edit Product' : 'Add Product'}</span>
            <span className="sm:hidden inline">{editId ? 'Edit' : 'Add'}</span>
          </button>
          <button
            id="admin-tab-list-btn"
            onClick={() => setActiveTab('list')}
            className={`flex-1 min-w-fit py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 px-3 ${
              activeTab === 'list'
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50/5'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileCode className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Catalog ({products.length})</span>
            <span className="sm:hidden inline">Catalog</span>
          </button>
          <button
            id="admin-tab-categories-btn"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 min-w-fit py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 px-3 ${
              activeTab === 'categories'
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50/5'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FolderPlus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Categories</span>
            <span className="sm:hidden inline">Cats</span>
          </button>
          <button
            id="admin-tab-brand-btn"
            onClick={() => setActiveTab('brand')}
            className={`flex-1 min-w-fit py-3 text-center text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 px-3 ${
              activeTab === 'brand'
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50/5'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sliders className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Branding</span>
            <span className="sm:hidden inline">Brand</span>
          </button>
        </div>

        {/* Workspace body panels */}
        <div className="flex-grow overflow-hidden bg-slate-50 relative">
          {/* Form pane */}
          <div
            id="admin-form-pane"
            className={`w-full max-w-2xl mx-auto p-6 md:p-8 overflow-y-auto h-full ${
              activeTab === 'form' ? 'block' : 'hidden'
            }`}
          >
            <h4
              id="form-section-title"
              className="flex text-xs font-bold text-emerald-600 mb-4 pb-2 border-b border-slate-200 uppercase tracking-widest items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              {editId ? 'Modify Listed Product' : 'List New Product'}
            </h4>

            <form onSubmit={handleFormSubmit} className="space-y-4 pb-12 md:pb-0">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro Max (256 GB)"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Pricing Box */}
              <div className="bg-slate-100 p-3.5 rounded-2xl space-y-3.5 border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Standard Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={orgPrice}
                      onChange={(e) => setOrgPrice(e.target.value)}
                      placeholder="89900"
                      className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/5 text-xs transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasOfferCheck"
                    checked={hasOffer}
                    onChange={(e) => setHasOffer(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="hasOfferCheck"
                    className="text-[10px] font-bold text-slate-700 uppercase select-none cursor-pointer"
                  >
                    Product has discounted offer price
                  </label>
                </div>

                {hasOffer && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Offer Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="74900"
                        className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/5 text-xs transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Image Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload Image (Max 8MB)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />

                {image && (
                  <div className="mt-3 relative w-20 h-20 border border-slate-200 bg-white rounded-xl overflow-hidden shadow-xs">
                    <img src={image} className="object-contain w-full h-full p-1" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Affiliate Destination Link */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Product Link *</span>
                </label>
                <input
                  type="url"
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://amazon.to/referral-tag"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs transition-all"
                />
              </div>

              {/* Description Highlights */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Product Details & Highlights *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specs, special features, coupons, box accessories..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs transition-all resize-none"
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors active:scale-95 cursor-pointer"
                >
                  Clear Fields
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/15 active:scale-95 cursor-pointer"
                >
                  {editId ? 'Save Edits' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>

          {/* List panel pane */}
          <div
            id="admin-list-pane"
            className={`w-full max-w-3xl mx-auto p-6 md:p-8 flex flex-col h-full ${
              activeTab === 'list' ? 'flex' : 'hidden'
            }`}
          >
            <h4 className="flex text-xs font-bold text-slate-500 mb-4 pb-2 border-b border-slate-200 uppercase tracking-widest items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>Managed Products ({products.length})</span>
            </h4>

            {products.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs flex-grow flex flex-col justify-center items-center">
                No products are listed yet. Fill in the form to release your first deal.
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 pb-16 md:pb-0">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center gap-4 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop'}
                        alt={prod.title}
                        className="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-100 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=100&auto=format&fit=crop';
                        }}
                      />
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[280px]">
                          {prod.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded uppercase">
                            {prod.category}
                          </span>
                          <span className="text-xs font-black text-emerald-600">
                            ₹{(prod.hasOffer ? prod.offerPrice : prod.originalPrice).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        id={`edit-item-btn-${prod.id}`}
                        onClick={() => handleEditSelect(prod)}
                        className="w-8 h-8 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-item-btn-${prod.id}`}
                        onClick={() => onDeleteProduct(prod.id)}
                        className="w-8 h-8 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-full flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories Management Pane */}
          <div
            id="admin-categories-pane"
            className={`w-full max-w-2xl mx-auto p-6 md:p-8 overflow-y-auto h-full ${
              activeTab === 'categories' ? 'block' : 'hidden'
            }`}
          >
            <h4 className="flex text-xs font-bold text-emerald-600 mb-4 pb-2 border-b border-slate-200 uppercase tracking-widest items-center gap-1.5">
              <FolderPlus className="w-4 h-4" />
              <span>Manage Categories</span>
            </h4>

            {/* Add new category */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCategoryLabel}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                placeholder="New category name (e.g., Books)"
                className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/15 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </form>

            {/* Existing categories list */}
            {categories.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No categories yet. Add your first one above!
              </div>
            ) : (
              <div className="space-y-2.5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center hover:shadow-sm transition-all"
                  >
                    <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                    <button
                      id={`delete-category-btn-${cat.id}`}
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="w-8 h-8 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-full flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Store Branding Pane */}
          <div
            id="admin-brand-pane"
            className={`w-full max-w-2xl mx-auto p-6 md:p-8 overflow-y-auto h-full ${
              activeTab === 'brand' ? 'block' : 'hidden'
            }`}
          >
            <h4
              id="brand-section-title"
              className="flex text-xs font-bold text-emerald-600 mb-4 pb-2 border-b border-slate-200 uppercase tracking-widest items-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>Customize Store Branding</span>
            </h4>

            <form onSubmit={handleBrandSubmit} className="space-y-5 pb-12">
              {/* Store Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                  Store name *
                </label>
                <input
                  type="text"
                  required
                  value={inputStoreName}
                  onChange={(e) => setInputStoreName(e.target.value)}
                  placeholder="e.g., Shopzy"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs transition-all font-bold"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                  Store Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={inputTagline}
                  onChange={(e) => setInputTagline(e.target.value)}
                  placeholder="e.g., Premium Deals Store"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs transition-all"
                />
              </div>

              {/* Brand Logo Upload */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Custom Store Logo Image (Replaces Default Logo)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />

                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed font-medium">
                  Upload the official brand logo. Recommended size: 200x200px or larger square ratio.
                </p>

                {inputLogo ? (
                  <div className="mt-3.5 relative w-24 h-24 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs flex items-center justify-center p-2">
                    <img src={inputLogo} alt="Custom Brand Logo" className="object-contain w-full h-full" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => setInputLogo('')}
                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5.5 h-5.5 flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer shadow-sm active:scale-90"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-3.5 p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-slate-500 text-xs flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 font-extrabold text-xs">
                      S
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">Using default SHOPZY visual identity</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Your store will render our beautifully designed SVG logo with custom neon accents.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setInputStoreName('Shopzy');
                    setInputTagline('Premium Deals Store');
                    setInputLogo('');
                  }}
                  className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors active:scale-95 cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/15 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Branding Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Change Password Overlay modal */}
      {showPassModal && (
        <div id="change-pass-overlay" className="fixed inset-0 bg-slate-950/70 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-display font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Update Admin Passcode</span>
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Authenticate current passcode to configure a new access code.
            </p>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 mt-5">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Current Passcode
                </label>
                <input
                  type="password"
                  required
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  New Passcode
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 mt-6 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOldPass('');
                    setNewPass('');
                    setShowPassModal(false);
                  }}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-lg active:scale-95 cursor-pointer"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
