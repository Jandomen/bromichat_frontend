import React from 'react';
import Layout from '../../components/Layout/Layout';
import { FaShieldAlt, FaKey, FaGlobeAmericas } from 'react-icons/fa';

const Privacy = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50/30 p-4 sm:p-8 animate-fade-in font-sans">
                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] p-6 xs:p-8 shadow-2xl shadow-gray-200/50 border border-gray-100/50 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-black"></div>
                        <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-2xl mb-4">
                            <FaShieldAlt size={28} />
                        </div>
                        <h1 className="text-2xl xs:text-3xl font-black text-gray-900 mb-2 lowercase tracking-tighter">política de privacidad</h1>
                        <p className="text-gray-400 text-[10px] xs:text-xs font-bold uppercase tracking-widest leading-relaxed">tus datos están seguros</p>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/30 border border-gray-100/50 space-y-8 overflow-hidden">
                        <section className="space-y-2">
                            <h2 className="text-sm xs:text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                1. recopilación
                            </h2>
                            <p className="text-gray-500 text-xs xs:text-sm leading-relaxed font-medium">
                                Solo guardamos lo necesario: correo y nombre. No vendemos tu información personal a terceros.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-sm xs:text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                2. seguridad
                            </h2>
                            <div className="bg-gray-50 rounded-[1.5rem] p-4 xs:p-6 space-y-4 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <FaKey className="text-red-600 text-[18px] xs:text-2xl" />
                                    <h4 className="text-[10px] xs:text-sm font-black text-gray-900 uppercase">Cifrado de datos</h4>
                                </div>
                                <div className="flex items-center gap-4">
                                    <FaGlobeAmericas className="text-red-600 text-[18px] xs:text-2xl" />
                                    <h4 className="text-[10px] xs:text-sm font-black text-gray-900 uppercase">Servidores SSL</h4>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-sm xs:text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                3. tus derechos
                            </h2>
                            <p className="text-gray-500 text-xs xs:text-sm leading-relaxed font-bold">
                                Tú controlas tu info. Puedes borrar tu cuenta permanentemente desde los ajustes.
                            </p>
                        </section>
                    </div>

                    {/* Footer Contact */}
                    <div className="bg-black rounded-[2rem] p-6 text-center shadow-xl shadow-red-900/10">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">centro de privacidad</p>
                        <a href="mailto:privacy@bromichat.com" className="inline-flex items-center gap-2 text-white bg-red-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-600/20">
                            privacy@bromichat.com
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Privacy;
