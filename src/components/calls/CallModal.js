import React, { useContext, useState, useEffect } from 'react';
import { CallContext } from '../../context/CallContext';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2, Monitor } from 'lucide-react';
import defaultProfile from '../../assets/default-profile.png';

const GroupVideo = ({ stream, name, avatar, isScreenSharing }) => {
    const videoRef = React.useRef();

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`relative group bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border transition-all duration-500 ${isScreenSharing ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 col-span-full row-span-2' : 'border-white/5'}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full ${isScreenSharing ? 'object-contain' : 'object-cover'} bg-zinc-900 transition-all duration-500`}
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className={`w-2 h-2 ${isScreenSharing ? 'bg-indigo-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                <span className="text-white text-xs font-medium truncate max-w-[100px]">{name || "Participante"} {isScreenSharing && "(Compartiendo)"}</span>
            </div>
            {isScreenSharing && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600/80 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                    PANTALLA
                </div>
            )}
        </div>
    );
};

const CallModal = () => {
    const {
        call,
        callAccepted,
        myVideo,
        userVideo,
        answerCall,
        declineCall,
        cancelCall,
        endCall,
        callType,
        stream,
        isCalling,
        muted,
        videoOff,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        isScreenSharing,
        isGroupCall,
        groupId,
        activeParticipants,
        remoteStreams,
        isMinimized,
        setIsMinimized,
        ongoingCalls,
        admissionRequests,
        acceptAdmission,
        rejectAdmission,
        remoteIsScreenSharing
    } = useContext(CallContext);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [videoFit, setVideoFit] = useState('cover');

    // Auto-ajustar fit cuando alguien comparte pantalla en P2P
    useEffect(() => {
        if (remoteIsScreenSharing) {
            setVideoFit('contain');
        } else {
            setVideoFit('cover');
        }
    }, [remoteIsScreenSharing]);

    // ⌨️ Manejo de la tecla Escape para colgar/rechazar
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                if (call.isReceivingCall && !callAccepted) {
                    declineCall();
                } else if (isCalling) {
                    cancelCall();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [call.isReceivingCall, callAccepted, isCalling, declineCall, cancelCall]);

    // Render para llamada entrante (Ringing)
    if (call.isReceivingCall && !callAccepted && !isMinimized) {
        if (isGroupCall) {
            // UI Estilo Notificación para Grupos (No bloquea la pantalla)
            return (
                <div className="fixed top-6 right-6 z-[200] w-full max-w-sm animate-in slide-in-from-right duration-500">
                    <div className="bg-white/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 ring-1 ring-black/5">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                <img
                                    src={call.avatar || defaultProfile}
                                    alt=""
                                    className="relative w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-0.5">Llamada Grupal</span>
                                <span className="text-sm font-black text-gray-900 truncate max-w-[140px]">
                                    {call.name.replace('Llamada Grupal: ', '')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={declineCall}
                                className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm border border-red-100"
                                title="Ignorar"
                            >
                                <PhoneOff size={18} />
                            </button>
                            <button
                                onClick={answerCall}
                                className="p-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all active:scale-90 shadow-lg shadow-green-200"
                                title="Unirse"
                            >
                                <Phone size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // UI Estilo Full Modal para Individuales (Mantiene los paneles famosos)
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-[3rem] p-10 shadow-2xl w-full max-w-sm text-center transform transition-all animate-in zoom-in-95 duration-300 border border-white/20">
                    <div className="relative mx-auto mb-8 w-28 h-28">
                        <div className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-25"></div>
                        <img
                            src={call.avatar || defaultProfile}
                            alt={call.name}
                            className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl mx-auto ring-4 ring-primary-50"
                            onError={(e) => (e.target.src = defaultProfile)}
                        />
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 mb-2 truncate px-4">{call.name}</h2>
                    <p className="text-primary-500 mb-10 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Llamada entrante</p>

                    <div className="flex justify-around items-center gap-6">
                        <button
                            onClick={declineCall}
                            className="p-5 bg-red-500 text-white rounded-[1.75rem] hover:bg-red-600 transition-all hover:scale-110 shadow-xl shadow-red-200 active:scale-95"
                            title="Rechazar"
                        >
                            <PhoneOff size={28} />
                        </button>

                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-5 bg-slate-100 text-slate-400 rounded-[1.75rem] hover:bg-slate-200 transition-all hover:scale-110 active:scale-95"
                            title="Minimizar"
                        >
                            <Minimize2 size={28} />
                        </button>

                        <button
                            onClick={answerCall}
                            className="p-5 bg-green-500 text-white rounded-[1.75rem] hover:bg-green-600 transition-all hover:scale-110 shadow-xl shadow-green-200 active:scale-95"
                            title="Contestar"
                        >
                            <Phone size={28} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Floating Join Button if Minimized or Ongoing
    if (isMinimized || (isGroupCall && !callAccepted && ongoingCalls[groupId])) {
        return (
            <div
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-24 right-6 z-[100] p-4 bg-indigo-600 text-white rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-all animate-bounce hover:animate-none flex items-center gap-3 border-2 border-white/20"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                    <Phone size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Llamada en curso</span>
            </div>
        );
    }

    // Render para el emisor mientras llama (Calling...)
    if (isCalling) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/90 backdrop-blur-xl animate-in fade-in duration-300">
                <div className="text-center p-8 w-full max-w-sm">
                    <div className="relative mx-auto mb-10 w-32 h-32">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse opacity-10"></div>
                        <img
                            src={call.avatar || defaultProfile}
                            alt={call.name}
                            className="relative w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-2xl mx-auto ring-4 ring-indigo-500/30"
                        />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{call.name}</h2>
                    <p className="text-indigo-400 mb-12 font-medium tracking-widest uppercase text-xs animate-pulse">Llamando...</p>

                    <button
                        onClick={cancelCall}
                        className="group relative p-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 shadow-2xl shadow-red-500/40"
                    >
                        <PhoneOff size={32} />
                        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/60 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">CANCELAR</span>
                    </button>
                </div>
            </div>
        );
    }


    // ... (rest of code)

    // Render para llamada activa (In-Call)
    if (callAccepted) {
        const participantCount = Object.keys(remoteStreams).length;

        return (
            <div className={`fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center transition-all ${isFullscreen ? 'p-0' : 'p-2 sm:p-6'}`}>
                <div className={`relative w-full h-full bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 max-w-7xl ${isFullscreen ? 'rounded-none border-none' : ''}`}>

                    {/* Background Ambient Blur */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent"></div>
                    </div>

                    {/* Dynamic Video Grid */}
                    <div className="w-full h-full p-2 sm:p-4 overflow-hidden">
                        {!isGroupCall ? (
                            <div className="w-full h-full flex items-center justify-center group/p2p relative">
                                <video
                                    playsInline
                                    ref={userVideo}
                                    autoPlay
                                    muted={false}
                                    className={`w-full h-full ${videoFit === 'contain' || remoteIsScreenSharing ? 'object-contain' : 'object-cover'} transition-all duration-500 bg-zinc-900`}
                                />
                                {/* Bottom overlay for P2P */}
                                <div className="absolute bottom-28 left-8 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 opacity-0 group-hover/p2p:opacity-100 transition-opacity">
                                    <div className={`w-2 h-2 ${remoteIsScreenSharing ? 'bg-indigo-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                                    <span className="text-white font-bold text-sm tracking-wide">{call.name} {remoteIsScreenSharing && "(Compartiendo pantalla)"}</span>
                                </div>

                                {/* Botón para ajustar aspecto */}
                                <button
                                    onClick={() => setVideoFit(prev => prev === 'cover' ? 'contain' : 'cover')}
                                    className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover/p2p:opacity-100"
                                    title="Ajustar / Rellenar"
                                >
                                    <Maximize2 size={16} />
                                </button>
                            </div>
                        ) : (
                            // Grid dinámico auto-ajustable que soporta N participantes
                            <div className={`w-full h-full p-2 overflow-y-auto custom-scrollbar ${participantCount > 0 ? 'grid gap-2 sm:gap-4' : 'flex items-center justify-center'}`} style={{
                                gridTemplateColumns: participantCount > 0 ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'none',
                                gridAutoRows: 'minmax(200px, 1fr)'
                            }}>
                                {Object.entries(remoteStreams).map(([uId, data]) => (
                                    <GroupVideo
                                        key={uId}
                                        stream={data.stream}
                                        name={data.name}
                                        avatar={data.avatar}
                                        isScreenSharing={data.isScreenSharing}
                                    />
                                ))}

                                {participantCount === 0 && (
                                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                                            <div className="w-24 h-24 bg-zinc-900/80 rounded-full flex items-center justify-center border border-white/10 relative z-10">
                                                <VideoOff size={40} className="text-zinc-600" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white/60 font-black uppercase tracking-[0.2em] text-xs mb-2">Llamada Grupal</p>
                                            <p className="text-zinc-500 text-sm">Esperando a que otros se unan...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Local Video - PiP fixed size/position */}
                    <div className={`absolute transition-all duration-500 z-50 ${isScreenSharing ? 'bottom-28 right-8 w-48 sm:w-64 border-indigo-500/50 scale-110' : 'top-8 right-8 w-32 sm:w-48 shadow-2xl'} aspect-video bg-zinc-900 rounded-2xl overflow-hidden border-2 border-white/20 group/local`}>
                        {videoOff ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                <VideoOff size={24} className="text-zinc-600" />
                            </div>
                        ) : (
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-lg border border-white/5 opacity-0 group-hover/local:opacity-100 transition-opacity">
                            <span className="text-[10px] text-white/70 font-bold uppercase tracking-tighter">Tú</span>
                        </div>
                    </div>

                    {/* Controls Bar - Pure Premium Glassmorphism */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 p-2 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] group/controls">

                        <div className="flex items-center gap-1 sm:gap-2 px-2">
                            <button
                                onClick={toggleMute}
                                className={`p-4 rounded-full transition-all duration-300 ${muted ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white' : 'bg-white/10 text-white hover:bg-white/20 active:scale-90'}`}
                                title={muted ? 'Activar Micrófono' : 'Silenciar'}
                            >
                                {muted ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

                            {callType === "video" && (
                                <>
                                    <button
                                        onClick={toggleVideo}
                                        className={`p-4 rounded-full transition-all duration-300 ${videoOff ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white' : 'bg-white/10 text-white hover:bg-white/20 active:scale-90'}`}
                                        title={videoOff ? 'Encender Cámara' : 'Apagar Cámara'}
                                    >
                                        {videoOff ? <VideoOff size={20} /> : <Video size={20} />}
                                    </button>

                                    <button
                                        onClick={toggleScreenShare}
                                        className={`p-4 rounded-full transition-all duration-300 ${isScreenSharing ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white' : 'bg-white/10 text-white hover:bg-white/20 active:scale-90'}`}
                                        title={isScreenSharing ? 'Dejar de compartir' : 'Compartir Pantalla'}
                                    >
                                        <Monitor size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

                        <div className="flex items-center gap-2 px-2">
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-4 bg-white/10 text-white rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all active:scale-90 hidden sm:flex"
                                title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
                            >
                                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>

                            <button
                                onClick={() => endCall()}
                                className="p-5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all hover:scale-110 active:scale-90 shadow-2xl shadow-red-600/30 ring-4 ring-red-600/20"
                                title={isGroupCall ? "Abandonar Grupo" : "Finalizar Llamada"}
                            >
                                <PhoneOff size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Call Status Overlay */}
                    <div className="absolute top-8 left-8 z-30 animate-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
                            <div className="flex -space-x-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <span className="text-white/90 font-black text-[10px] uppercase tracking-widest">{isGroupCall ? 'Sesión Grupal' : 'Directo'}</span>
                        </div>
                    </div>

                    {/* Admission Requests Panel (Waiting Room) */}
                    {admissionRequests.length > 0 && (
                        <div className="absolute top-24 left-8 z-40 w-72 animate-in slide-in-from-left-4 duration-500">
                            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 overflow-hidden">
                                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                    <span className="text-white font-bold text-xs uppercase tracking-widest pl-1">Sala de Espera</span>
                                    <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{admissionRequests.length}</span>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {admissionRequests.map((req, idx) => (
                                        <div key={`${req.requesterId}-${idx}`} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                            <img
                                                src={req.avatar || defaultProfile}
                                                alt={req.name}
                                                className="w-8 h-8 rounded-full object-cover border border-white/10"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-bold truncate">{req.name}</p>
                                                <p className="text-gray-400 text-[10px] truncate">Solicita unirse</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => rejectAdmission(req.groupId, req.requesterId)}
                                                    className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                                                    title="Rechazar"
                                                >
                                                    <PhoneOff size={14} />
                                                </button>
                                                <button
                                                    onClick={() => acceptAdmission(req.groupId, req.requesterId)}
                                                    className="p-1.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-colors border border-green-500/20"
                                                    title="Permitir"
                                                >
                                                    <Video size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default CallModal;
