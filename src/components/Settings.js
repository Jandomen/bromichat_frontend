import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { useNotificaciones } from "../context/NotificationContext";
import api from "../services/api";
import Header from "./Header";
import Footer from "./Footer";
import ChangeProfilePicture from "./Settings/ChangeProfilePicture";
import MyBlockedUsersList from "./Settings/MyBlockedUsersList";
import EditBio from "./Settings/EditBio";
import DeleteAccount from "./Settings/DeleteAccount";
import ChangePassword from "./Settings/ChangePassword";
import ChangeEmail from "./Settings/ChangeEmail";
import PrivacySettings from "./Settings/PrivacySettings";
import BiometricSettings from "./Settings/BiometricSettings";
import StorySettings from "./Settings/StorySettings";
import SosSettings from "./Settings/SosSettings";
import StoryArchive from "./Settings/StoryArchive";
import {
  User,
  Shield,
  Bell,
  Volume2,
  Trash2,
  Lock,
  UserX,
  Camera,
  FileText,
  ChevronRight,
  Mail,
  Fingerprint,
  History,
  AlertTriangle,
  Menu,
  ChevronLeft
} from "lucide-react";

const Settings = () => {
  const { user: currentUser, token, setUser: setCurrentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const {
    sonidoHabilitado,
    habilitarSonido,
    deshabilitarSonido,
    archivoSonido,
    setArchivoSonido,
  } = useNotificaciones();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true); // Control focus on mobile

  const handleUnblockUser = async (userId) => {
    if (!token || !currentUser) {
      setError("Debes iniciar sesión para desbloquear usuarios.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/friend/unblock/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "No se pudo desbloquear al usuario";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.on("userBlocked", ({ blockedUsers }) => {
      if (currentUser._id === blockedUsers[0]?.owner) {
        setCurrentUser((prev) => ({ ...prev, blockedUsers }));
      }
    });

    socket.on("userUnblocked", ({ blockedUsers }) => {
      if (currentUser._id === blockedUsers[0]?.owner) {
        setCurrentUser((prev) => ({ ...prev, blockedUsers }));
      }
    });

    return () => {
      socket.off("userBlocked");
      socket.off("userUnblocked");
    };
  }, [socket, currentUser, setCurrentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center container mx-auto px-4">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
            <p className="text-gray-500">Debes iniciar sesión para acceder a la configuración.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sections = [
    { id: 'profile', icon: User, label: 'Perfil Público' },
    { id: 'security', icon: Shield, label: 'Seguridad' },
    { id: 'sos', icon: AlertTriangle, label: 'Emergencia SOS' },
    { id: 'notifications', icon: Bell, label: 'Notificaciones' },
    { id: 'stories', icon: History, label: 'Historias' },
    { id: 'archive', icon: History, label: 'Archivo Historias' },
    { id: 'privacy', icon: UserX, label: 'Bloqueos' },
    { id: 'account', icon: Trash2, label: 'Cuenta', danger: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="flex-grow container mx-auto mt-8 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className={`md:w-72 flex-shrink-0 ${!isMobileMenuOpen ? 'hidden md:block' : 'w-full block'}`}>
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-24">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ajustes</h2>
                    <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mt-1">BromiChat Pro</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl md:hidden">
                    <Menu className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <nav className="p-4 space-y-2">
                  {sections.map(({ id, icon: Icon, label, danger }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveTab(id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                        ${activeTab === id
                          ? (danger ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-700 shadow-lg shadow-primary-500/10 scale-[1.02]')
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <div className={`p-2 rounded-xl transition-colors ${activeTab === id ? (danger ? 'bg-red-100' : 'bg-primary-100') : 'bg-gray-50 group-hover:bg-white'}`}>
                        <Icon size={20} className={activeTab === id ? 'stroke-[2.5px]' : 'stroke-[1.5]'} />
                      </div>
                      <span className="font-bold tracking-tight">{label}</span>
                      <ChevronRight className={`w-5 h-5 ml-auto transition-transform ${activeTab === id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 min-w-0 ${isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
              <div className="md:hidden mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-sm bg-primary-50 px-6 py-3 rounded-2xl hover:bg-primary-100 transition-colors"
                >
                  <ChevronLeft size={18} strokeWidth={3} />
                  Volver al Menú
                </button>
              </div>

              {error && (
                <div className="mb-6 p-5 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Shield className="w-6 h-6 flex-shrink-0" />
                  </div>
                  <p className="font-bold">{error}</p>
                </div>
              )}

              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden min-h-[500px] animate-in fade-in zoom-in-95 duration-500">

                {/* Profile Section */}
                {activeTab === 'profile' && (
                  <div className="divide-y divide-gray-50">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Foto de Perfil</h3>
                          <p className="text-sm text-gray-500">Actualiza tu imagen pública</p>
                        </div>
                      </div>
                      <ChangeProfilePicture />
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Biografía</h3>
                          <p className="text-sm text-gray-500">Cuéntale al mundo sobre ti</p>
                        </div>
                      </div>
                      <EditBio />
                    </div>
                  </div>
                )}

                {/* Security Section */}
                {activeTab === 'security' && (
                  <div className="divide-y divide-gray-50">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Privacidad y Acceso</h3>
                          <p className="text-sm text-gray-500">Gestiona quién puede ver tu información</p>
                        </div>
                      </div>
                      <PrivacySettings />
                    </div>

                    <div className="p-6 sm:p-8 bg-gray-50/50">
                      <div className="grid gap-8 lg:grid-cols-2">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-gray-900 font-semibold border-b pb-2">
                            <Lock className="w-5 h-5 text-gray-500" /> Contraseña
                          </div>
                          <ChangePassword />
                        </div>
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-gray-900 font-semibold border-b pb-2">
                            <Mail className="w-5 h-5 text-gray-500" /> Correo Electrónico
                          </div>
                          <ChangeEmail />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                          <Fingerprint className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Autenticación Biométrica</h3>
                          <p className="text-sm text-gray-500">Configura el acceso seguro sin contraseña</p>
                        </div>
                      </div>
                      <BiometricSettings />
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeTab === 'notifications' && (
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Volume2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Preferencias de Sonido</h3>
                        <p className="text-sm text-gray-500">Personaliza tus alertas</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-medium text-gray-900">Activar sonidos de notificación</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sonidoHabilitado}
                            onChange={(e) =>
                              e.target.checked ? habilitarSonido() : deshabilitarSonido()
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>

                      {sonidoHabilitado && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tono de alerta</label>
                            <div className="flex gap-4">
                              <select
                                value={archivoSonido}
                                onChange={(e) => setArchivoSonido(e.target.value)}
                                className="flex-grow border-gray-200 rounded-xl shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 bg-white"
                              >
                                <option value="/sounds/notification-1-270124.mp3">Clásico (Standard)</option>
                                <option value="/sounds/new-notification-021-370045.mp3">Moderno (Pop)</option>
                                <option value="/sounds/simple-notification-152054.mp3">Sutil (Soft)</option>
                              </select>
                              <button
                                onClick={() => {
                                  const audio = new Audio(archivoSonido);
                                  audio.play().catch(e => console.error("Error playing sound", e));
                                }}
                                className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                              >
                                <Volume2 className="w-5 h-5 text-gray-600" />
                                <span>Probar Sonido</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stories Section */}
                {activeTab === 'stories' && (
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                        <History className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Historias</h3>
                        <p className="text-sm text-gray-500">Configura la visibilidad y límites</p>
                      </div>
                    </div>
                    <StorySettings />
                  </div>
                )}

                {/* SOS Section */}
                {activeTab === 'sos' && (
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Configuración SOS</h3>
                        <p className="text-sm text-gray-500">Gestiona alertas y contactos de emergencia</p>
                      </div>
                    </div>
                    <SosSettings />
                  </div>
                )}

                {/* Story Archive Section */}
                {activeTab === 'archive' && (
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <History className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Archivo de Historias</h3>
                        <p className="text-sm text-gray-500">Tus momentos guardados para siempre</p>
                      </div>
                    </div>
                    <StoryArchive />
                  </div>
                )}

                {/* Blocked Users Section */}
                {activeTab === 'privacy' && (
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                        <UserX className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Usuarios Bloqueados</h3>
                        <p className="text-sm text-gray-500">Gestiona tu lista negra</p>
                      </div>
                    </div>
                    <MyBlockedUsersList onUnblockUser={handleUnblockUser} />
                  </div>
                )}

                {/* Delete Account Section */}
                {activeTab === 'account' && (
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <Trash2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-700">Zona de Peligro</h3>
                        <p className="text-sm text-red-500">Acciones irreversibles para tu cuenta</p>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                      <DeleteAccount />
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
