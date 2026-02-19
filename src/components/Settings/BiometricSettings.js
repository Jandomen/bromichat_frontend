import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import api from '../../services/api'; // Using the established api service
import { useUI } from '../../context/UIContext';

const BiometricSettings = () => {
    const [loading, setLoading] = useState(false);
    const { showToast } = useUI();
    const [isSupported, setIsSupported] = useState(true);
    const [supportError, setSupportError] = useState('');

    React.useEffect(() => {
        // Check for WebAuthn support and Secure Context
        if (!window.isSecureContext) {
            setIsSupported(false);
            setSupportError('La biometría requiere HTTPS o localhost.');
        } else if (!window.PublicKeyCredential) {
            setIsSupported(false);
            setSupportError('Tu navegador o dispositivo no soporta biometría.');
        }
    }, []);

    const handleRegisterBiometrics = async () => {
        if (!isSupported) {
            showToast(supportError, 'error');
            return;
        }

        setLoading(true);
        try {
            // 1. Get registration options from server
            const optionsRes = await api.get('/webauthn/register-challenge');
            const options = optionsRes.data;

            // 2. Start WebAuthn registration
            const attestationResponse = await startRegistration({ optionsJSON: options });

            // 3. Verify response on server
            const verifyRes = await api.post('/webauthn/register-verify', attestationResponse);

            if (verifyRes.data.verified) {
                showToast('¡Huella dactilar/dispositivo registrado con éxito!', 'success');
            } else {
                showToast('Error al verificar el dispositivo.', 'error');
            }
        } catch (error) {
            console.error('Biometric registration error:', error);
            if (error.name === 'NotAllowedError') {
                showToast('Cancelado o tiempo de espera agotado. Inténtalo de nuevo.', 'error');
            } else {
                showToast(error.response?.data?.error || 'Error al configurar la biometría.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-red-900/20 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">☝️</span> Seguridad Biométrica
            </h3>
            <p className="text-gray-400 text-sm mb-6">
                Configura tu huella dactilar o reconocimiento facial para iniciar sesión de forma más rápida y segura.
            </p>

            {!isSupported && (
                <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-200 text-xs">
                    ⚠️ {supportError}
                </div>
            )}

            <div className="flex flex-col gap-4">
                <button
                    onClick={handleRegisterBiometrics}
                    disabled={loading || !isSupported}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-semibold shadow-lg hover:shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Procesando...' : 'Activar Huella Dactilar'}
                </button>

                <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest">
                    BromiChat utiliza el estándar WebAuthn para proteger tus datos
                </p>
            </div>
        </div>
    );
};

export default BiometricSettings;
