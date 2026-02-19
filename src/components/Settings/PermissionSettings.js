import React, { useState, useEffect } from 'react';
import { Camera, Mic, MapPin, Bell, Smartphone } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const PermissionSettings = () => {
    const { showToast } = useUI();
    const [permissions, setPermissions] = useState({
        camera: 'prompt',
        microphone: 'prompt',
        notifications: 'prompt',
        geolocation: 'prompt'
    });

    const checkPermissions = async () => {
        try {
            const cameraStatus = await navigator.permissions.query({ name: 'camera' }).catch(() => ({ state: 'unknown' }));
            const micStatus = await navigator.permissions.query({ name: 'microphone' }).catch(() => ({ state: 'unknown' }));
            const geoStatus = await navigator.permissions.query({ name: 'geolocation' }).catch(() => ({ state: 'unknown' }));
            // Not properly supported in all browsers via query

            // Notifications special handling
            let notifState = 'prompt';
            if (Notification.permission === 'granted') notifState = 'granted';
            else if (Notification.permission === 'denied') notifState = 'denied';


            setPermissions({
                camera: cameraStatus.state,
                microphone: micStatus.state,
                geolocation: geoStatus.state,
                notifications: notifState
            });
        } catch (error) {
            console.error("Error checking permissions", error);
        }
    };

    useEffect(() => {
        checkPermissions();
        // Listen for changes if possible (some browsers support onchange)
    }, []);

    const requestCamera = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            checkPermissions();
            showToast('Permiso de cámara concedido', 'success');
        } catch (err) {
            console.error(err);
            showToast('Permiso de cámara denegado o error', 'error');
            checkPermissions();
        }
    };

    const requestMicrophone = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            checkPermissions();
            showToast('Permiso de micrófono concedido', 'success');
        } catch (err) {
            console.error(err);
            showToast('Permiso de micrófono denegado o error', 'error');
            checkPermissions();
        }
    };

    const requestGeolocation = () => {
        navigator.geolocation.getCurrentPosition(
            () => {
                checkPermissions();
                showToast('Ubicación obtenida', 'success');
            },
            (err) => {
                console.error(err);
                showToast('Permiso de ubicación denegado', 'error');
                checkPermissions();
            }
        );
    };

    const requestNotifications = async () => {
        if (!("Notification" in window)) {
            showToast("Este navegador no soporta notificaciones", "error");
            return;
        }
        try {
            const permission = await Notification.requestPermission();
            checkPermissions();
            if (permission === 'granted') {
                showToast('Notificaciones activadas', 'success');
            } else {
                showToast('Notificaciones denegadas', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderStatusText = (status) => {
        if (status === 'granted') return <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">Permitido</span>;
        if (status === 'denied') return <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-1 rounded-lg">Denegado</span>;
        return <span className="text-yellow-600 font-bold text-sm bg-yellow-50 px-2 py-1 rounded-lg">Preguntar</span>;
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
                <div className="flex gap-3">
                    <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-blue-900">Permisos del Dispositivo</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Aquí puedes verificar y solicitar acceso a las funciones de hardware de tu dispositivo para asegurar que BromiChat funcione correctamente.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {/* Camera */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${permissions.camera === 'granted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Camera size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Cámara</h3>
                            <p className="text-xs text-gray-500">Para historias y videollamadas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {renderStatusText(permissions.camera)}
                        {permissions.camera !== 'granted' && (
                            <button
                                onClick={requestCamera}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Solicitar
                            </button>
                        )}
                    </div>
                </div>

                {/* Microphone */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${permissions.microphone === 'granted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Mic size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Micrófono</h3>
                            <p className="text-xs text-gray-500">Para notas de voz y llamadas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {renderStatusText(permissions.microphone)}
                        {permissions.microphone !== 'granted' && (
                            <button
                                onClick={requestMicrophone}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Solicitar
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${permissions.notifications === 'granted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Notificaciones</h3>
                            <p className="text-xs text-gray-500">Para mensajes y alertas</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {renderStatusText(permissions.notifications)}
                        {permissions.notifications !== 'granted' && (
                            <button
                                onClick={requestNotifications}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Solicitar
                            </button>
                        )}
                    </div>
                </div>

                {/* Geolocation */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${permissions.geolocation === 'granted' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Ubicación</h3>
                            <p className="text-xs text-gray-500">Para mapas y lugares cercanos</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {renderStatusText(permissions.geolocation)}
                        {permissions.geolocation !== 'granted' && (
                            <button
                                onClick={requestGeolocation}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Solicitar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
                Nota: Si has denegado permanentemente un permiso, deberás habilitarlo desde la configuración de tu navegador o sistema operativo.
            </p>
        </div>
    );
};

export default PermissionSettings;
