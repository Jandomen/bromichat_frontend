import React from 'react';
import Layout from '../../components/Layout/Layout';
import { FaRegFileAlt } from 'react-icons/fa';

const Terms = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-gray-50/30 p-4 sm:p-8 animate-fade-in font-sans">
                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] p-6 xs:p-8 shadow-2xl shadow-gray-200/50 border border-gray-100/50 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-black"></div>
                        <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-2xl mb-4">
                            <FaRegFileAlt size={28} />
                        </div>
                        <h1 className="text-2xl xs:text-3xl font-black text-gray-900 mb-2 lowercase tracking-tighter">términos de servicio</h1>
                        <p className="text-gray-400 text-[10px] xs:text-xs font-bold uppercase tracking-widest leading-relaxed">reglas de nuestra comunidad</p>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/30 border border-gray-100/50 space-y-8">
                        <section className="space-y-2">
                            <h2 className="text-sm xs:text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                1. aceptación
                            </h2>
                            <p className="text-gray-500 text-xs xs:text-sm leading-relaxed font-medium">
                                Al utilizar <span className="text-red-600 font-bold">Bromichat</span>, aceptas nuestros términos de servicio. Si no estás de acuerdo, por favor no utilices la plataforma.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-sm xs:text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                2. conducta
                            </h2>
                            <div className="bg-gray-50 rounded-[1.5rem] p-4 xs:p-6 space-y-3 border border-gray-100">
                                <ul className="space-y-2">
                                    {[
                                        'Prohibido el acoso o insultos.',
                                        'Sin contenido ilegal o NSFW.',
                                        'No se permite el spam.',
                                        'No suplantar identidades.'
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-xs text-gray-500 font-bold tracking-tight lowercase">
                                          <span className="text-red-500 mt-1.5 opacity-50 shrink-0">●</span>
                                          {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-sm xs:text-lg font-black text-gray-900 flex items-center gap-2 lowercase tracking-tight">
                                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                3. moderación
                            </h2>
                            <p className="text-gray-500 text-xs xs:text-sm leading-relaxed font-medium">
                                Los administradores pueden suspender o eliminar cuentas que violen gravemente las normas de convivencia aquí establecidas.
                            </p>
                        </section>
                    </div>

                    {/* Footer Contact */}
                    <div className="bg-black rounded-[2rem] p-6 text-center shadow-xl shadow-red-900/10">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">¿dudas legales?</p>
                        <a href="mailto:legal@bromichat.com" className="inline-flex items-center gap-2 text-white bg-red-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-600/20">
                            legal@bromichat.com
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Terms;
