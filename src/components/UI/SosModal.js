import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, Phone, Send, X } from 'lucide-react';

const SosModal = ({ isOpen, onClose, onConfirm, contacts, message }) => {
    const [step, setStep] = useState(1); // 1: Confirmation, 2: Sending, 3: Success

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setStep(2);
        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 2000));
        onConfirm();
        setStep(3);
        setTimeout(() => {
            onClose();
            setStep(1);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className={`bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl transition-all duration-500 transform ${step === 2 ? 'scale-105' : 'scale-100'}`}>

                {/* Header */}
                <div className="p-6 bg-red-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={24} className="animate-pulse" />
                        <h2 className="text-xl font-black uppercase tracking-tight">Alerta de Emergencia</h2>
                    </div>
                    {step !== 2 && (
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <p className="text-gray-900 font-bold text-lg">¿Confirmas el envío de la alerta?</p>
                                <p className="text-gray-500 text-sm">Se enviará un mensaje y tu ubicación actual a tus {contacts?.length} contactos de confianza.</p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 italic text-red-700 text-sm">
                                "{message}"
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={onClose}
                                    className="py-4 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="py-4 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                                >
                                    Enviar Ahora
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="py-10 text-center space-y-6 animate-in zoom-in-95">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20"></div>
                                <div className="relative bg-red-600 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl">
                                    <Send size={40} className="animate-bounce" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 uppercase">Enviando Alerta...</h3>
                                <p className="text-gray-500 text-sm font-medium mt-1">Conectando con servidores de emergencia</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-10 text-center space-y-6 animate-in zoom-in-95">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl mx-auto shadow-green-200">
                                < ShieldAlert size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-green-600 uppercase">Alerta Enviada</h3>
                                <p className="text-gray-500 text-sm font-medium mt-1">Tus contactos han sido notificados con éxito.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Tip */}
                <div className="px-8 pb-6 text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <AlertCircle size={12} />
                        Mantén la calma, la ayuda está en camino
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SosModal;
