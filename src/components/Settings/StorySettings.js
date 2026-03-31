import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useUI } from '../../context/UIContext';
import { Clock, Check, AlertCircle, History } from 'lucide-react';

const StorySettings = () => {
    const { user, token, setUser } = useContext(AuthContext);
    const { showToast } = useUI();
    const [selectedDuration, setSelectedDuration] = useState(user?.storySettings?.defaultDuration || 24);
    const [saveToArchive, setSaveToArchive] = useState(user?.storySettings?.saveToArchive !== false);
    const [loading, setLoading] = useState(false);

    const durations = [
        { label: '1 hora', value: 1 },
        { label: '3 horas', value: 3 },
        { label: '6 horas', value: 6 },
        { label: '12 horas', value: 12 },
        { label: '24 horas', value: 24 },
        { label: '72 horas', value: 72 },
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put('/user/story-settings',
                {
                    defaultDuration: selectedDuration,
                    saveToArchive: saveToArchive
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser({ ...user, storySettings: res.data.storySettings });
            showToast('Configuración de historias actualizada', 'success');
        } catch (error) {
            console.error('Error updating story settings', error);
            showToast('Error al actualizar configuración', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 xs:space-y-5 sm:space-y-6 animate-fade-in text-gray-800">
            <div className="flex items-center gap-2 xs:gap-3 mb-2">
                <div className="p-1.5 xs:p-2 bg-yellow-50 text-yellow-600 rounded-md xs:rounded-lg flex-shrink-0">
                    <Clock size={16} className="xs:w-5 xs:h-5" />
                </div>
                <div>
                    <h3 className="text-xs xs:text-sm font-black uppercase tracking-widest text-gray-500">Duración de Historias</h3>
                    <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400">¿Cuánto tiempo quieres que tus historias sean visibles?</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 xs:gap-3">
                {durations.map((d) => (
                    <button
                        key={d.value}
                        onClick={() => setSelectedDuration(d.value)}
                        className={`p-2 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl border-2 transition-all flex flex-col items-center gap-1 xs:gap-2 ${selectedDuration === d.value
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                            }`}
                    >
                        <span className="text-[10px] xs:text-xs sm:text-sm font-bold">{d.label}</span>
                        {selectedDuration === d.value && <Check size={12} className="xs:w-4 xs:h-4 text-yellow-600" />}
                    </button>
                ))}
            </div>

            <div className="bg-white/50 border border-gray-100 p-4 xs:p-5 sm:p-6 rounded-[1.5rem] xs:rounded-[2rem] shadow-sm space-y-3 xs:space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 xs:gap-3">
                        <div className="p-1.5 xs:p-2 bg-indigo-50 text-indigo-600 rounded-md xs:rounded-lg flex-shrink-0">
                            <History size={16} className="xs:w-5 xs:h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs xs:text-sm font-black uppercase tracking-widest text-gray-700">Archivar Historias</h4>
                            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-gray-400 font-medium leading-tight">Las historias se guardarán automáticamente en tu archivo.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSaveToArchive(!saveToArchive)}
                        className={`relative inline-flex h-5 xs:h-6 w-9 xs:w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${saveToArchive ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-3 xs:h-4 w-3 xs:w-4 transform rounded-full bg-white transition-transform ${saveToArchive ? 'translate-x-5 xs:translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-3 xs:p-4 rounded-lg xs:rounded-xl">
                <div className="flex gap-2.5 xs:gap-3 items-start">
                    <AlertCircle size={14} className="xs:w-[18px] xs:h-[18px] text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-blue-700 leading-relaxed font-medium">
                        <span className="font-bold">Política de Uso:</span> Para garantizar el mejor rendimiento del servidor, puedes subir un máximo de <span className="font-bold underline">5 historias cada 7 horas</span>.
                    </p>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={loading || (selectedDuration === user?.storySettings?.defaultDuration && saveToArchive === user?.storySettings?.saveToArchive)}
                className={`w-full py-2.5 xs:py-3 sm:py-4 rounded-xl xs:rounded-2xl font-black text-[10px] xs:text-xs uppercase tracking-widest transition-all shadow-lg ${loading || (selectedDuration === user?.storySettings?.defaultDuration && saveToArchive === user?.storySettings?.saveToArchive)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-black shadow-black/20'
                    }`}
            >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
    );
};

export default StorySettings;
