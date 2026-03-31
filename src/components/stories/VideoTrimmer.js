import React, { useState, useRef, useEffect } from 'react';
import { X, Scissors, Play, Pause, Check } from 'lucide-react';

const VideoTrimmer = ({ file, onConfirm, onCancel }) => {
    const videoRef = useRef(null);
    const [duration, setDuration] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [startOffset, setStartOffset] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {


            // Auto-loop within the 20s window during preview
            if (duration > 20 && videoRef.current.currentTime > startOffset + 20) {
                videoRef.current.currentTime = startOffset;
            }
        }
    };

    const handleOffsetChange = (e) => {
        const value = parseFloat(e.target.value);
        setStartOffset(value);
        if (videoRef.current) {
            videoRef.current.currentTime = value;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-2 animate-in fade-in duration-300">
            <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl xs:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">

                {/* Header */}
                <div className="p-3 xs:p-6 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-2 xs:gap-3 text-white lowercase tracking-tighter">
                        <Scissors size={14} className="text-yellow-400" />
                        <h2 className="text-sm xs:text-xl font-black uppercase">recortar historia</h2>
                    </div>
                    <button onClick={onCancel} className="p-1 xs:p-2 text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Video Preview */}
                <div className="relative aspect-[9/16] max-h-[50vh] bg-black mx-auto overflow-hidden mt-4 rounded-2xl group cursor-pointer" onClick={togglePlay}>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className="h-full w-full object-contain"
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        playsInline
                    />
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                        {isPlaying ? <Pause size={48} className="text-white" /> : <Play size={48} className="text-white" />}
                    </div>

                    {/* Time Indicator */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 uppercase">
                            Segmento: {startOffset.toFixed(1)}s - {Math.min(startOffset + 20, duration).toFixed(1)}s
                        </span>
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 uppercase">
                            Total: {duration.toFixed(1)}s
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-3 xs:p-8 space-y-4 xs:space-y-6">
                    {duration > 20 ? (
                        <div className="space-y-3 xs:space-y-4">
                            <div className="flex justify-between text-[8px] xs:text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <span>Selecciona el inicio</span>
                                <span className="text-yellow-400">Ventana de 20s</span>
                            </div>
                            <div className="relative h-8 xs:h-12 flex items-center">
                                {/* Track Background */}
                                <div className="absolute inset-0 bg-zinc-800 rounded-lg overflow-hidden">
                                    <div
                                        className="absolute h-full bg-yellow-400/20 border-x-2 border-yellow-400"
                                        style={{
                                            left: `${(startOffset / duration) * 100}%`,
                                            width: `${(20 / duration) * 100}%`
                                        }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={Math.max(0, duration - 20)}
                                    step="0.1"
                                    value={startOffset}
                                    onChange={handleOffsetChange}
                                    className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer z-10 
                                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 xs:[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 xs:[&::-webkit-slider-thumb]:h-8 
                                               [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:shadow-xl"
                                />
                            </div>
                            <p className="text-[8.5px] xs:text-[10px] text-zinc-500 text-center font-medium">Desliza para elegir qué parte de tu video quieres subir.</p>
                        </div>
                    ) : (
                        <div className="text-center py-2 xs:py-4 bg-zinc-800/50 rounded-2xl border border-white/5">
                            <p className="text-[10px] xs:text-sm text-zinc-400 font-medium italic">Este video se subirá completo.</p>
                        </div>
                    )}

                    <div className="flex gap-2 xs:gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2 xs:py-4 bg-zinc-800 text-zinc-400 font-black text-[10px] xs:text-xs uppercase tracking-widest rounded-xl xs:rounded-2xl hover:bg-zinc-700 transition-all"
                        >
                            Desechar
                        </button>
                        <button
                            onClick={() => onConfirm(startOffset)}
                            className="flex-[2] py-2 xs:py-4 bg-yellow-400 text-black font-black text-[10px] xs:text-xs uppercase tracking-widest rounded-xl xs:rounded-2xl shadow-lg shadow-yellow-400/20 hover:bg-yellow-500 transition-all flex items-center justify-center gap-1 xs:gap-2"
                        >
                            <Check size={14} strokeWidth={3} />
                            Subir Historia
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoTrimmer;
