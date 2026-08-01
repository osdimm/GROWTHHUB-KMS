import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-200 transform transition-all scale-100">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
            <span className="material-symbols-outlined text-[28px]">logout</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Logout</h3>
            <p className="text-xs text-slate-500">Sesi Anda akan diakhiri secara aman.</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Apakah Anda yakin ingin keluar dari sistem Growth Hub KMS?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-600/20"
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
};
