/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  visible: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  adminPasswordCurrent: string;
}

export default function AdminLoginModal({
  visible,
  onClose,
  onVerifySuccess,
  adminPasswordCurrent
}: AdminLoginModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPasswordCurrent) {
      setError(false);
      setPassword('');
      onVerifySuccess();
    } else {
      setError(true);
    }
  };

  if (!visible) return null;

  return (
    <div
      id="login-modal-wrapper"
      className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-2xl mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900">Admin Authentication</h3>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            Please enter your management passcode to unlock the curation settings dashboard.
          </p>
          <p className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-md mt-2">
            Default: <span className="font-mono text-slate-700 font-black">1234</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Security Passcode
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-xs text-center font-bold tracking-widest"
          />

          {error && (
            <div className="text-rose-500 text-xs mt-3 font-semibold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Incorrect passcode! Please try again.</span>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              id="login-cancel-btn"
              onClick={() => {
                setPassword('');
                setError(false);
                onClose();
              }}
              className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="login-verify-btn"
              className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/15 active:scale-95 cursor-pointer"
            >
              Verify Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
