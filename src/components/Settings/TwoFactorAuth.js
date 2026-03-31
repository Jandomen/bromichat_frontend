import React, { useState } from 'react';
import {
    Key,
    Smartphone,
    ShieldCheck,
    ChevronRight,
    Plus,
    Lock,
    Eye,
    Monitor,
    MoreHorizontal
} from 'lucide-react';

const TwoFactorAuth = () => {
    const [expanded, setExpanded] = useState(false);

    const methods = [
        {
            id: 'passkey',
            title: 'Añadir una clave de acceso',
            description: 'Usa Face ID, Touch ID o el PIN de tu dispositivo para iniciar sesión.',
            icon: FingerprintIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            id: 'security_key',
            title: 'Añadir clave de seguridad',
            description: 'Usa una llave física USB o NFC para proteger tu cuenta.',
            icon: Key,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            id: 'auth_app',
            title: 'Añadir aplicación de autenticación',
            description: 'Usa aplicaciones como Google Authenticator o Authy para generar códigos.',
            icon: Smartphone,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        }
    ];

    return (
        <div className="space-y-4 xs:space-y-6">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/50 rounded-[1.5rem] xs:rounded-[2rem] p-4 xs:p-5 sm:p-6 lg:p-8">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
                        <div className="p-2 xs:p-2.5 bg-indigo-600 text-white rounded-lg xs:rounded-xl shadow-lg shadow-indigo-200">
                            <ShieldCheck size={16} className="xs:w-5 xs:h-5" />
                        </div>
                        <h2 className="text-base xs:text-lg sm:text-xl font-black text-gray-900 tracking-tight italic">
                            PROTECCIÓN <span className="text-indigo-600">MFA</span>
                        </h2>
                    </div>

                    <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-gray-900 mb-2 xs:mb-3 sm:mb-4 leading-tight">
                        Mantén protegida tu cuenta
                    </h3>

                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 font-medium leading-normal xs:leading-relaxed mb-4 xs:mb-6">
                        Bromichat necesita la autenticación en dos pasos para mantener tu cuenta segura.
                        Al utilizar estos métodos además de tu contraseña, dificultas enormemente
                        que otra persona acceda a tus momentos privados.
                    </p>

                    <div className="p-3 xs:p-4 bg-white/60 backdrop-blur-md rounded-xl xs:rounded-2xl border border-white shadow-sm mb-5 xs:mb-8">
                        <p className="text-[9px] xs:text-[10px] sm:text-sm text-gray-500 font-bold leading-relaxed">
                            <Lock size={12} className="xs:w-3.5 xs:h-3.5 inline mr-1.5 xs:mr-2 text-indigo-400" />
                            Esta configuración solo se te aplica a ti. Cualquier persona que compartas contenido
                            tendrá que configurar su propia seguridad.
                        </p>
                    </div>

                    <div className="space-y-2 xs:space-y-3">
                        {methods.map((method) => (
                            <button
                                key={method.id}
                                className="w-full group flex items-center justify-between p-3 xs:p-4 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl xs:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-3 xs:gap-4 text-left">
                                    <div className={`p-2 xs:p-3 rounded-lg xs:rounded-xl ${method.bgColor} ${method.color} transition-colors group-hover:scale-110 duration-500`}>
                                        <method.icon size={18} className="xs:w-[22px] xs:h-[22px]" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[11px] xs:text-xs sm:text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {method.title}
                                        </h4>
                                        <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                                            {method.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-1.5 xs:p-2 rounded-lg xs:rounded-xl bg-gray-50 group-hover:bg-indigo-50 text-gray-300 group-hover:text-indigo-600 transition-all">
                                    <Plus size={14} className="xs:w-[18px] xs:h-[18px]" strokeWidth={3} />
                                </div>
                            </button>
                        ))}

                        {!expanded ? (
                            <button
                                onClick={() => setExpanded(true)}
                                className="w-full py-3 xs:py-4 text-[10px] xs:text-xs sm:text-sm font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors flex items-center justify-center gap-1.5 xs:gap-2"
                            >
                                <MoreHorizontal size={14} className="xs:w-4 xs:h-4" />
                                Mostrar opciones adicionales
                            </button>
                        ) : (
                            <div className="pt-3 xs:pt-4 space-y-2 xs:space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <button className="w-full group flex items-center justify-between p-3 xs:p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 border-dashed rounded-xl xs:rounded-2xl transition-all">
                                    <div className="flex items-center gap-3 xs:gap-4 text-left">
                                        <div className="p-2 xs:p-3 rounded-lg xs:rounded-xl bg-zinc-200 text-zinc-600">
                                            <Monitor size={18} className="xs:w-[22px] xs:h-[22px]" strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[11px] xs:text-xs sm:text-sm text-gray-900">Códigos de respaldo</h4>
                                            <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
                                                Generar códigos de un solo uso para emergencias.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-1.5 xs:p-2 text-zinc-400 group-hover:text-indigo-600 transition-colors">
                                        <ChevronRight size={14} className="xs:w-[18px] xs:h-[18px]" strokeWidth={3} />
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 xs:mt-8 pt-5 xs:pt-8 border-t border-indigo-100/50">
                        <div className="flex items-start gap-3 xs:gap-4">
                            <div className="p-1.5 xs:p-2 bg-amber-50 rounded-md xs:rounded-lg flex-shrink-0">
                                <Eye size={14} className="xs:w-[18px] xs:h-[18px] text-amber-600" />
                            </div>
                            <p className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 font-bold leading-relaxed">
                                <span className="text-amber-600 uppercase tracking-tighter mr-1.5 xs:mr-2">Recomendación:</span>
                                Te recomendamos encarecidamente que habilites varias formas de autenticación
                                en dos pasos como copia de seguridad en caso de que pierdas el acceso a tu dispositivo principal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FingerprintIcon = ({ size, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.02-.3 3" />
        <path d="M7 10.74c0-3.3 2.5-5.96 5.82-5.96a6.01 6.01 0 0 1 5.4 3.12" />
        <path d="M10.5 20.44c.4.14.82.26 1.25.36a9.92 9.92 0 0 0 4.22-.12" />
        <path d="M19.16 14.5a10 10 0 0 0-1.42-6.57" />
        <path d="M16 19.5c.34-.33.6-.71.77-1.12" />
        <path d="M7 15.5c-.32-1.42-.5-2.84-.5-4.26 0-1.57.42-3.14 1.25-4.5" />
        <path d="M4 14.28a11.52 11.52 0 0 1 .5-4.28A11.58 11.58 0 0 1 12 2c3.4 0 6.29 2.3 7.4 5.48" />
    </svg>
);

export default TwoFactorAuth;
