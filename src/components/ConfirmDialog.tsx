/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {visible && (
        <div id="confirm-dialog-wrapper" className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <motion.div
            id="confirm-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center"
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900" id="confirm-title">
              {title}
            </h3>
            
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed" id="confirm-message">
              {message}
            </p>
            
            <div className="flex gap-3 mt-6">
              <button
                id="confirm-cancel-btn"
                onClick={onCancel}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button
                id="confirm-action-btn"
                onClick={onConfirm}
                className="w-1/2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-500/10 active:scale-95"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
