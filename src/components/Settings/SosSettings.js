import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useUI } from '../../context/UIContext';
import { AlertTriangle, Plus, Trash2, Save, User, Phone, MessageSquare } from 'lucide-react';

const SosSettings = () => {
    const { user, token, setUser } = useContext(AuthContext);
    const { showToast } = useUI();

    const [isEnabled, setIsEnabled] = useState(user?.sosSettings?.isEnabled || false);
    const [message, setMessage] = useState(user?.sosSettings?.message || "¡Ayuda! Necesito asistencia inmediata. Esta es mi ubicación.");
    const [contacts, setContacts] = useState(user?.sosSettings?.emergencyContacts || []);
    const [loading, setLoading] = useState(false);

    const handleAddContact = () => {
        if (contacts.length >= 5) {
            showToast('Máximo 5 contactos de emergencia', 'error');
            return;
        }
        setContacts([...contacts, { name: '', phone: '', relationship: '' }]);
    };

    const handleRemoveContact = (index) => {
        const newContacts = contacts.filter((_, i) => i !== index);
        setContacts(newContacts);
    };

    const handleContactChange = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put('/user/sos-settings',
                { isEnabled, message, emergencyContacts: contacts },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser({ ...user, sosSettings: res.data.sosSettings });
            showToast('Configuración SOS actualizada', 'success');
        } catch (error) {
            console.error('Error updating SOS settings', error);
            showToast('Error al actualizar configuración', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 xs:space-y-8 animate-fade-in text-gray-800">
            {/* Header / Toggle */}
            <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 bg-red-50 rounded-[1.5rem] xs:rounded-[2rem] border border-red-100 shadow-sm">
                <div className="flex items-center gap-3 xs:gap-4">
                    <div className="p-2 xs:p-3 bg-red-100 text-red-600 rounded-xl xs:rounded-2xl flex-shrink-0">
                        <AlertTriangle size={20} className="xs:w-6 xs:h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm xs:text-base sm:text-lg font-black text-red-900 uppercase tracking-tight">Botón de Auxilio (SOS)</h3>
                        <p className="text-[9px] xs:text-[10px] sm:text-xs text-red-700 font-medium">Activa alertas rápidas a tus contactos de confianza</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative inline-flex h-6 xs:h-8 w-11 xs:w-14 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-red-600' : 'bg-gray-300'}`}
                >
                    <span className={`inline-block h-4 xs:h-6 w-4 xs:w-6 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-5 xs:translate-x-7' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Custom Message */}
            <div className="space-y-3 xs:space-y-4">
                <div className="flex items-center gap-2 xs:gap-3 px-1 xs:px-2">
                    <MessageSquare size={14} className="xs:w-[18px] xs:h-[18px] text-gray-400" />
                    <h4 className="text-[10px] xs:text-xs font-black uppercase tracking-widest text-gray-500">Mensaje de Emergencia</h4>
                </div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe el mensaje que se enviará..."
                    className="w-full p-3 xs:p-4 sm:p-5 rounded-2xl xs:rounded-3xl bg-gray-50 border-2 border-gray-100 focus:border-red-500 focus:bg-white transition-all text-[10px] xs:text-xs sm:text-sm font-medium min-h-[90px] xs:min-h-[120px] outline-none"
                />
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-3 xs:space-y-4">
                <div className="flex items-center justify-between px-1 xs:px-2">
                    <div className="flex items-center gap-2 xs:gap-3">
                        <User size={14} className="xs:w-[18px] xs:h-[18px] text-gray-400" />
                        <h4 className="text-[10px] xs:text-xs font-black uppercase tracking-widest text-gray-500">Contactos de Confianza ({contacts.length}/5)</h4>
                    </div>
                    <button
                        onClick={handleAddContact}
                        className="p-1.5 xs:p-2 text-red-600 hover:bg-red-50 rounded-lg xs:rounded-xl transition-colors"
                        title="Añadir Contacto"
                    >
                        <Plus size={16} className="xs:w-5 xs:h-5" strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-2.5 xs:space-y-3">
                    {contacts.map((contact, index) => (
                        <div key={index} className="group flex flex-col md:flex-row gap-2.5 xs:gap-3 p-3 xs:p-4 bg-white border-2 border-gray-50 rounded-2xl xs:rounded-[2rem] hover:border-red-100 transition-all shadow-sm">
                            <div className="flex-1 flex gap-2.5 xs:gap-3">
                                <div className="flex-1 space-y-1.5 xs:space-y-2.5">
                                    <div className="relative">
                                        <User size={12} className="xs:w-3.5 xs:h-3.5 absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Nombre del contacto"
                                            value={contact.name}
                                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                            className="w-full pl-7 xs:pl-9 pr-3 xs:pr-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm font-bold bg-transparent outline-none border-b border-gray-100 focus:border-red-500"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone size={12} className="xs:w-3.5 xs:h-3.5 absolute left-2 xs:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Teléfono (WhatsApp)"
                                            value={contact.phone}
                                            onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                            className="w-full pl-7 xs:pl-9 pr-3 xs:pr-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm font-medium bg-transparent outline-none border-b border-gray-100 focus:border-red-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveContact(index)}
                                    className="p-2 xs:p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl xs:rounded-2xl transition-all h-fit"
                                >
                                    <Trash2 size={14} className="xs:w-[18px] xs:h-[18px]" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {contacts.length === 0 && (
                        <div className="text-center py-8 xs:py-10 border-2 border-dashed border-gray-100 rounded-2xl xs:rounded-[2.5rem]">
                            <p className="text-[10px] xs:text-xs sm:text-sm text-gray-400 font-medium">No has añadido contactos de emergencia aún.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={loading}
                className={`w-full py-3 xs:py-4 sm:py-5 rounded-xl xs:rounded-[2rem] font-black text-[9px] xs:text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 xs:gap-3 ${loading
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 active:scale-95'
                    }`}
            >
                {loading ? 'Sincronizando...' : (
                    <>
                        <Save size={14} className="xs:w-[18px] xs:h-[18px]" />
                        Guardar Configuración SOS
                    </>
                )}
            </button>

            <p className="text-[9px] xs:text-[10px] text-gray-400 text-center font-bold uppercase tracking-wider">
                El envío de alertas puede estar sujeto a la conexión de red de tu dispositivo.
            </p>
        </div>
    );
};

export default SosSettings;
