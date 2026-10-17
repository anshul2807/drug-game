import React from 'react';
import { useGame } from '../context/GameContext';
import { AlertTriangle, X } from 'lucide-react';

export const Modal: React.FC = () => {
  const { modal, closeModal } = useGame();

  if (!modal.isOpen) return null;

  const handleConfirm = () => {
    closeModal();
    if (modal.onConfirm) {
      modal.onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl relative shadow-glow-amber animate-in zoom-in-95 duration-200">
        <button 
          onClick={closeModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 font-bold font-hud text-lg mb-3">
          <AlertTriangle className="w-5 h-5" />
          <span>{modal.title}</span>
        </div>

        <div 
          className="text-xs text-slate-300 mb-6 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: modal.body }}
        />

        <div className="flex justify-end gap-2.5">
          {modal.cancelText && (
            <button
              onClick={closeModal}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-hud transition"
            >
              {modal.cancelText}
            </button>
          )}

          <button
            onClick={handleConfirm}
            className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-hud transition shadow-glow-green"
          >
            {modal.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
