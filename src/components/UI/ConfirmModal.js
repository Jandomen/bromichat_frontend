import React from 'react';
import { useUI } from '../../context/UIContext';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = () => {
    const { confirmModal } = useUI();

    if (!confirmModal) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={confirmModal.onCancel}></div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn transform">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <AlertTriangle size={32} />
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                        {confirmModal.title}
                    </h3>
                    <p className="text-gray-500 font-medium">
                        {confirmModal.message}
                    </p>
                </div>

                <div className="flex border-t border-gray-100 p-4 gap-3 bg-gray-50/50">
                    <button
                        onClick={confirmModal.onCancel}
                        className="flex-1 px-6 py-3 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmModal.onConfirm}
                        className="flex-1 px-6 py-3 rounded-2xl bg-red-600 text-white font-black hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
