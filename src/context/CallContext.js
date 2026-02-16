import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import Peer from 'simple-peer';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';
import { useUI } from './UIContext';
import defaultProfile from '../assets/default-profile.png';

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    const { showToast } = useUI();

    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [callerAvatar, setCallerAvatar] = useState("");
    const [callType, setCallType] = useState("video");
    const [isCalling, setIsCalling] = useState(false);
    const [targetId, setTargetId] = useState(null);
    const [muted, setMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);
    const [groupId, setGroupId] = useState(null);
    const [groupParticipants, setGroupParticipants] = useState([]);
    const [isGroupCall, setIsGroupCall] = useState(false);
    const [activeParticipants, setActiveParticipants] = useState([]);
    const [screenStream, setScreenStream] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [ongoingCalls, setOngoingCalls] = useState({});
    const [isWaitingAdmission, setIsWaitingAdmission] = useState(false);
    const [admissionRequests, setAdmissionRequests] = useState([]); // Array of { requesterId, name, avatar, groupId }
    const peersRef = useRef({}); // userId -> peer instance
    const [remoteStreams, setRemoteStreams] = useState({}); // { userId: stream }
    const callTimeoutRef = useRef(null); // Para el timeout de 60s

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const [remoteStream, setRemoteStream] = useState(null);
    const [remoteIsScreenSharing, setRemoteIsScreenSharing] = useState(false); // Para P2P
    const ringtoneRef = useRef(null); // Para gestionar el sonido de llamada incoming
    const callingSoundRef = useRef(null); // Para gestionar el sonido de "calling" del emisor (opcional)
    const leaveCallRef = useRef();
    const screenStreamRef = useRef();
    const groupIdRef = useRef();
    const targetIdRef = useRef();
    const callerRef = useRef();

    useEffect(() => {
        leaveCallRef.current = leaveCall;
        screenStreamRef.current = screenStream;
        groupIdRef.current = groupId;
        targetIdRef.current = targetId;
        callerRef.current = caller;
    });

    // Efecto para aplicar el stream local a myVideo cuando esté disponible
    useEffect(() => {
        if (stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }
    }, [stream, videoOff]);

    useEffect(() => {
        if (remoteStream && userVideo.current && callAccepted) {
            userVideo.current.srcObject = remoteStream;
        }
    }, [remoteStream, callAccepted]);

    // --- Gestión de sonidos (Ringtones) ---
    const stopAudio = (ref) => {
        if (ref.current) {
            try {
                ref.current.pause();
                ref.current.currentTime = 0;
                ref.current.src = "";
                // Algunos navegadores requieren load() para limpiar el buffer
                ref.current.load();
            } catch (e) {
                console.error("Error stopping audio:", e);
            }
            ref.current = null;
        }
    };

    useEffect(() => {
        let audio = null;
        if (receivingCall && !callAccepted) {
            // Sonidos más "llamativos" para llamadas
            const soundUrl = isGroupCall
                ? "https://assets.mixkit.co/active_storage/sfx/1358/1358-preview.mp3" // Ringtone rítmico para grupos
                : "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"; // Ringtone clásico para P2P

            audio = new Audio(soundUrl);
            audio.loop = true;
            ringtoneRef.current = audio;
            audio.play().catch(e => console.log("Audio play blocked by browser. Interaction required."));
        }

        return () => {
            if (audio) {
                stopAudio({ current: audio });
            }
        };
    }, [receivingCall, callAccepted, name]);

    useEffect(() => {
        let audio = null;
        if (isCalling) {
            audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"); // Sonido de espera al llamar
            audio.loop = true;
            callingSoundRef.current = audio;
            audio.play().catch(e => { });
        }
        return () => {
            if (audio) {
                stopAudio({ current: audio });
            }
        };
    }, [isCalling]);

    const commonIceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
    ];

    useEffect(() => {
        if (!socket) return;

        socket.on('incoming-call', ({ from, name: callerName, signal, avatar, callType: incomingType }) => {
            setIsGroupCall(false); // Asegurarse de que no sea grupal
            setReceivingCall(true);
            setCaller(from);
            setName(callerName);
            setCallerSignal(signal);
            setCallerAvatar(avatar);
            setCallType(incomingType || "video");

            // Timeout de 60s para contestar
            if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = setTimeout(() => {
                if (!callAccepted) {
                    declineCall();
                }
            }, 60000);
        });

        socket.on('incoming-group-call', ({ groupId: gid, from, name: callerName, avatar }) => {
            console.log(`Grupo ${gid} inició una videollamada por ${callerName}`);
            setOngoingCalls(prev => ({ ...prev, [gid]: true }));
            setReceivingCall(true);
            setIsGroupCall(true);
            setGroupId(gid);
            setCaller(from);
            setName(`Llamada Grupal: ${callerName}`);
            setCallerAvatar(avatar);
            setCallType("video");

            if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = setTimeout(() => {
                if (!callAccepted) {
                    declineCall();
                }
            }, 60000);
        });

        socket.on('group-call-active', ({ groupId: gid }) => {
            setOngoingCalls(prev => ({ ...prev, [gid]: true }));
        });

        socket.on('group-call-ended', ({ groupId: gid }) => {
            setOngoingCalls(prev => {
                const next = { ...prev };
                delete next[gid];
                return next;
            });
        });

        socket.on('participant-joined', ({ userId, username }) => {
            setActiveParticipants(prev => [...new Set([...prev, userId])]);

            // Si yo estoy compartiendo pantalla, notificar al nuevo participante específicamente
            if (screenStreamRef.current) {
                socket.emit('screen-sharing-status', {
                    groupId: groupIdRef.current,
                    to: userId,
                    isSharing: true
                });
            }
        });

        socket.on('participant-left', ({ userId, count }) => {
            setActiveParticipants(prev => prev.filter(id => id !== userId));

            // Cerrar peer específico
            if (peersRef.current[userId]) {
                peersRef.current[userId].destroy();
                delete peersRef.current[userId];
            }
            setRemoteStreams(prev => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });

            // Eliminada la lógica de auto-cerrar si quedan < 2 personas
            // para permitir que el último usuario quede esperando.
        });

        socket.on('admission-request', ({ from, name: requesterName, avatar, groupId: gid }) => {
            setAdmissionRequests(prev => [...prev, { requesterId: from, name: requesterName, avatar, groupId: gid }]);
        });

        socket.on('admission-accepted', ({ groupId: gid }) => {
            setIsWaitingAdmission(false);
            // El usuario que aceptó ya lo notificó. Ahora realmente entramos.
            // Procedemos a unirse formalmente.
            answerCall();
        });

        socket.on('admission-rejected', () => {
            setIsWaitingAdmission(false);
            setReceivingCall(false);
            setIsCalling(false);
            setName("");
            setCaller("");
            // Podrías mostrar un toast o alerta aquí.
        });

        socket.on('call-ended', () => {
            leaveCallRef.current();
        });

        socket.on('call-declined', () => {
            leaveCallRef.current();
        });

        socket.on('call-canceled', () => {
            console.log("❌ Recibido call-canceled en el receptor");
            leaveCallRef.current();
        });

        socket.on('call-accepted', (signal) => {
            console.log("Call accepted by remote");
            setCallAccepted(true);
            setIsCalling(false);
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }

            if (connectionRef.current && !connectionRef.current.destroyed) {
                try {
                    connectionRef.current.signal(signal);
                } catch (err) {
                    console.error("Error signaling call-accepted:", err);
                }
            }
        });

        socket.on('p2p-signal-receive', ({ signal }) => {
            if (connectionRef.current && !connectionRef.current.destroyed) {
                try {
                    connectionRef.current.signal(signal);
                } catch (err) {
                    console.error("Error signaling p2p-receive:", err);
                }
            }
        });

        return () => {
            socket.off('incoming-call');
            socket.off('incoming-group-call');
            socket.off('group-call-active');
            socket.off('group-call-ended');
            socket.off('admission-request');
            socket.off('admission-accepted');
            socket.off('admission-rejected');
            socket.off('call-ended');
            socket.off('call-declined');
            socket.off('call-canceled');
            socket.off('call-accepted');
            socket.off('p2p-signal-receive');
            socket.off('participant-joined');
            socket.off('participant-left');
            socket.off('remote-screen-sharing');
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        socket.on('remote-screen-sharing', ({ userId, isSharing }) => {
            console.log(`User ${userId} screen sharing: ${isSharing}`);
            if (isGroupCall) {
                setRemoteStreams(prev => {
                    if (prev[userId]) {
                        return {
                            ...prev,
                            [userId]: { ...prev[userId], isScreenSharing: isSharing }
                        };
                    }
                    return prev;
                });
            } else {
                setRemoteIsScreenSharing(isSharing);
            }
        });

        return () => {
            socket.off('remote-screen-sharing');
        };
    }, [socket, isGroupCall]);

    // --- Group Call Mesh Helpers ---
    const createPeer = (userIdToCall, callerId, localStream, gid) => {
        const peer = new Peer({
            initiator: true,
            trickle: true,
            stream: localStream,
            config: { iceServers: commonIceServers }
        });

        peer.on("error", err => {
            console.error("Group Peer Error (initiator):", err.message);
        });

        peer.on("signal", signal => {
            socket.emit("group-signal", {
                signal,
                to: userIdToCall,
                from: callerId,
                groupId: gid,
                name: user.username,
                avatar: user.profilePicture
            });
        });

        peer.on("stream", streamData => {
            // Buscaremos el nombre en activeParticipants si no lo tenemos todavía
            setRemoteStreams(prev => ({
                ...prev,
                [userIdToCall]: {
                    stream: streamData,
                    name: `Usuario ${userIdToCall.substring(0, 4)}`, // Fallback
                    avatar: defaultProfile
                }
            }));
        });

        return peer;
    };

    const addPeer = (incomingSignal, callerId, localStream, gid, callerName, callerAvatar) => {
        const peer = new Peer({
            initiator: false,
            trickle: true,
            stream: localStream,
            config: { iceServers: commonIceServers }
        });

        peer.on("error", err => {
            console.error("Group Peer Error (receiver):", err.message);
        });

        peer.on("signal", signal => {
            socket.emit("group-signal", {
                signal,
                to: callerId,
                from: user._id,
                groupId: gid,
                name: user.username,
                avatar: user.profilePicture
            });
        });

        peer.on("stream", streamData => {
            setRemoteStreams(prev => ({
                ...prev,
                [callerId]: {
                    stream: streamData,
                    name: callerName || `Usuario ${callerId.substring(0, 4)}`,
                    avatar: callerAvatar || defaultProfile
                }
            }));
        });

        if (incomingSignal && !peer.destroyed) {
            try {
                peer.signal(incomingSignal);
            } catch (err) {
                console.error("Error signaling addPeer:", err);
            }
        }
        return peer;
    };

    useEffect(() => {
        if (!socket || !isGroupCall || !stream) return;

        socket.on('current-participants', ({ participants }) => {
            console.log('Iniciando mesh con:', participants);
            participants.forEach(pId => {
                if (pId === user._id) return;
                const peer = createPeer(pId, user._id, stream, groupId);

                // Si ya estamos compartiendo pantalla, reemplazar track para el nuevo peer
                if (screenStream) {
                    const screenTrack = screenStream.getVideoTracks()[0];
                    const videoTrack = stream.getVideoTracks()[0];
                    if (screenTrack && videoTrack) {
                        try {
                            peer.replaceTrack(videoTrack, screenTrack, stream);
                        } catch (e) { console.error("Error replacing track for new peer:", e); }
                    }
                }

                peersRef.current[pId] = peer;
            });
            setActiveParticipants(participants);
        });

        socket.on('group-signal-receive', ({ signal, from, groupId: gid, name: callerName, avatar: callerAvatar }) => {
            const targetPeer = peersRef.current[from];
            if (targetPeer && !targetPeer.destroyed) {
                try {
                    targetPeer.signal(signal);
                } catch (err) {
                    console.error("Error signaling group-signal:", err);
                }
                if (callerName) {
                    setRemoteStreams(prev => {
                        if (prev[from]) {
                            return { ...prev, [from]: { ...prev[from], name: callerName, avatar: callerAvatar } };
                        }
                        return prev;
                    });
                }
            } else if (!targetPeer) {
                const peer = addPeer(signal, from, stream, gid, callerName, callerAvatar);

                // Si ya estamos compartiendo pantalla y somos los receptores del signal (el que se une), 
                // también debemos asegurar que este peer reciba nuestra pantalla.
                if (screenStream) {
                    const screenTrack = screenStream.getVideoTracks()[0];
                    const videoTrack = stream.getVideoTracks()[0];
                    if (screenTrack && videoTrack) {
                        try {
                            peer.replaceTrack(videoTrack, screenTrack, stream);
                        } catch (e) { console.error("Error replacing track for new incoming peer:", e); }
                    }
                }

                peersRef.current[from] = peer;
                setActiveParticipants(prev => [...new Set([...prev, from])]);
            }
        });

        return () => {
            socket.off('current-participants');
            socket.off('group-signal-receive');
        };
    }, [socket, isGroupCall, stream, groupId]);

    const answerCall = () => {
        setCallAccepted(true);
        setIsMinimized(false);

        navigator.mediaDevices.getUserMedia({ video: callType === "video", audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                if (isGroupCall) {
                    socket.emit("join-group-call", { groupId, userId: user._id });
                }

                if (!isGroupCall) {
                    const peer = new Peer({
                        initiator: false,
                        trickle: true,
                        stream: currentStream,
                        config: { iceServers: commonIceServers }
                    });

                    peer.on("error", err => {
                        console.error("P2P Peer Error (receiver):", err.message);
                    });

                    let signalCount = 0;
                    peer.on("signal", (data) => {
                        if (signalCount === 0) {
                            socket.emit("answer-call", { signal: data, to: caller });
                        } else {
                            socket.emit("p2p-signal", { signal: data, to: caller });
                        }
                        signalCount++;
                    });

                    peer.on("stream", (remoteStreamData) => {
                        setRemoteStream(remoteStreamData);
                        if (userVideo.current) {
                            userVideo.current.srcObject = remoteStreamData;
                        }
                    });

                    if (callerSignal && !peer.destroyed) {
                        try {
                            peer.signal(callerSignal);
                        } catch (err) {
                            console.error("Error signaling answerCall:", err);
                        }
                    }
                    connectionRef.current = peer;
                }
            })
            .catch(err => {
                console.error("Error accessing media devices:", err);
                showToast("No se pudo acceder a la cámara o micrófono. Por favor verifica tus permisos.", "error");
            });
    };

    const callUser = (id, targetName, targetAvatar, type = "video", convId = null) => {
        setCallType(type);
        setIsCalling(true);
        setTargetId(id);
        setName(targetName);
        setCallerAvatar(targetAvatar);

        navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                const peer = new Peer({
                    initiator: true,
                    trickle: true,
                    stream: currentStream,
                    config: { iceServers: commonIceServers }
                });

                peer.on("error", err => {
                    console.error("P2P Peer Error (initiator):", err.message);
                });

                let signalCount = 0;
                peer.on("signal", (data) => {
                    if (signalCount === 0) {
                        socket.emit("call-user", {
                            userToCall: id,
                            signalData: data,
                            from: user._id,
                            name: user.username,
                            avatar: user.profilePicture || "",
                            callType: type,
                            conversationId: convId
                        });
                    } else {
                        socket.emit("p2p-signal", { signal: data, to: id });
                    }
                    signalCount++;
                });

                if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = setTimeout(() => {
                    if (!callAccepted) {
                        cancelCall();
                    }
                }, 30000);

                peer.on("stream", (remoteStreamData) => {
                    setRemoteStream(remoteStreamData);
                    if (userVideo.current) {
                        userVideo.current.srcObject = remoteStreamData;
                    }
                });

                connectionRef.current = peer;
            })
            .catch(err => {
                console.error("Error accessing media devices:", err);
                showToast("No se pudo acceder a la cámara o micrófono. Por favor verifica tus permisos.", "error");
            });
    };

    const requestAdmission = (gid, groupName, groupImage) => {
        setIsWaitingAdmission(true);
        setGroupId(gid);
        setName(groupName);
        setCallerAvatar(groupImage);
        socket.emit('request-group-admission', {
            groupId: gid,
            from: user._id,
            name: user.username,
            avatar: user.profilePicture
        });
    };

    const acceptAdmission = (gid, requesterId) => {
        socket.emit('accept-admission', { groupId: gid, requesterId });
        setAdmissionRequests(prev => prev.filter(r => r.requesterId !== requesterId));
    };

    const rejectAdmission = (gid, requesterId) => {
        socket.emit('reject-admission', { groupId: gid, requesterId });
        setAdmissionRequests(prev => prev.filter(r => r.requesterId !== requesterId));
    };

    const leaveCall = () => {
        // Reset de estados
        setReceivingCall(false);
        setCallAccepted(false);
        setIsCalling(false);
        setCallEnded(false); // Reset para la próxima
        setName("");
        setCaller("");
        setCallerAvatar("");
        setTargetId(null);
        setGroupId(null);
        setIsGroupCall(false);
        setActiveParticipants([]);
        setRemoteStream(null);
        setIsMinimized(false);
        setIsWaitingAdmission(false);
        setAdmissionRequests([]);
        setRemoteIsScreenSharing(false);

        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }

        // Limpiar peers grupales
        Object.values(peersRef.current).forEach(peer => peer.destroy());
        peersRef.current = {};
        setRemoteStreams({});

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
            callTimeoutRef.current = null;
        }

        // Parar ringtones manualmente con limpieza agresiva
        stopAudio(ringtoneRef);
        stopAudio(callingSoundRef);

        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
        }
    };

    const declineCall = () => {
        socket.emit("decline-call", { to: caller });
        leaveCall();
    };

    const endCall = (targetIdParam) => {
        if (isGroupCall || groupId) {
            socket.emit("leave-group-call", { groupId: groupId || targetId, userId: user._id });
        } else {
            socket.emit("end-call", {
                to: targetIdParam || targetId || caller,
                groupId: groupId,
                participants: groupParticipants
            });
        }
        leaveCall();
    };

    const cancelCall = () => {
        if (isGroupCall || groupId) {
            socket.emit("leave-group-call", { groupId: groupId || targetId, userId: user._id });
        } else {
            socket.emit("cancel-call", {
                to: targetId,
                groupId: groupId,
                participants: groupParticipants
            });
        }
        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
        leaveCall();
    };

    const toggleScreenShare = () => {
        if (!screenStream) {
            navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    frameRate: { max: 30 },
                    width: { max: 1920 },
                    height: { max: 1080 }
                },
                audio: false
            })
                .then(streamData => {
                    const screenTrack = streamData.getTracks()[0];
                    const videoTrack = stream.getVideoTracks()[0];

                    if (connectionRef.current && !connectionRef.current.destroyed) {
                        try {
                            if (videoTrack) {
                                connectionRef.current.replaceTrack(videoTrack, screenTrack, stream);
                            } else {
                                connectionRef.current.addTrack(screenTrack, stream);
                            }
                        } catch (e) { console.error("Error replacing P2P track:", e); }
                    }

                    Object.values(peersRef.current).forEach(peer => {
                        if (peer && !peer.destroyed) {
                            try {
                                if (videoTrack) {
                                    peer.replaceTrack(videoTrack, screenTrack, stream);
                                } else {
                                    peer.addTrack(screenTrack, stream);
                                }
                            } catch (e) { console.error("Error replacing Group peer track:", e); }
                        }
                    });

                    setScreenStream(streamData);
                    if (myVideo.current) myVideo.current.srcObject = streamData;

                    // Notificar a otros que empezamos a compartir
                    socket.emit('screen-sharing-status', {
                        groupId: groupIdRef.current,
                        to: targetIdRef.current || callerRef.current,
                        isSharing: true
                    });

                    screenTrack.onended = () => {
                        stopScreenShare(screenTrack, videoTrack);
                    };
                })
                .catch(err => console.error("Error sharing screen:", err));
        } else {
            const screenTrack = screenStream.getTracks()[0];
            const videoTrack = stream.getVideoTracks()[0];
            stopScreenShare(screenTrack, videoTrack);
        }
    };

    const stopScreenShare = (screenTrack, videoTrack) => {
        if (screenTrack) screenTrack.stop();

        if (connectionRef.current && !connectionRef.current.destroyed) {
            try {
                if (videoTrack && screenTrack) {
                    connectionRef.current.replaceTrack(screenTrack, videoTrack, stream);
                }
            } catch (e) { console.error("Error reverting P2P track:", e); }
        }

        Object.values(peersRef.current).forEach(peer => {
            if (peer && !peer.destroyed) {
                try {
                    if (videoTrack && screenTrack) {
                        peer.replaceTrack(screenTrack, videoTrack, stream);
                    }
                } catch (e) { console.error("Error reverting Group peer track:", e); }
            }
        });

        setScreenStream(null);
        if (myVideo.current) myVideo.current.srcObject = stream;

        // Notificar a otros que dejamos de compartir
        socket.emit('screen-sharing-status', {
            groupId: groupIdRef.current,
            to: targetIdRef.current || callerRef.current,
            isSharing: false
        });
    };


    const callGroup = (id, groupName, groupImage, participants = []) => {
        setGroupId(id);
        const memberIds = participants.map(p => typeof p === 'string' ? p : p._id);
        setGroupParticipants(memberIds);

        socket.emit("group-call-init", {
            groupId: id,
            from: user._id,
            name: groupName,
            avatar: groupImage,
            participants: memberIds
        });

        // Set state for initiator
        setReceivingCall(false); // Not receiving, but calling
        setCaller(user._id);
        setName(`Llamada Grupal: ${groupName}`);
        setCallerAvatar(groupImage);
        setCallAccepted(true); // Auto-accept our own group call start
        setCallType("video");

        // Start local stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            .catch(err => console.error(err));
    };

    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <CallContext.Provider value={{
            call: { isReceivingCall: receivingCall, from: caller, name, signal: callerSignal, avatar: callerAvatar },
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            callEnded,
            me: user?._id,
            callUser,
            callGroup,
            leaveCall,
            answerCall,
            declineCall,
            cancelCall,
            endCall,
            setStream,
            callType,
            setCallType,
            isCalling,
            muted,
            videoOff,
            toggleMute,
            toggleVideo,
            toggleScreenShare,
            isScreenSharing: !!screenStream,
            isGroupCall,
            activeParticipants,
            remoteStreams,
            peers: peersRef.current,
            isMinimized,
            setIsMinimized,
            ongoingCalls,
            isWaitingAdmission,
            admissionRequests,
            requestAdmission,
            acceptAdmission,
            rejectAdmission,
            remoteIsScreenSharing
        }}>
            {children}
        </CallContext.Provider>
    );
};
