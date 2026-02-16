import React from 'react';

export const REACTION_TYPES = [
    { type: 'like', emoji: '👍', label: 'Me gusta', color: 'text-blue-600' },
    { type: 'love', emoji: '❤️', label: 'Me encanta', color: 'text-red-500' },
    { type: 'haha', emoji: '😂', label: 'Me divierte', color: 'text-yellow-500' },
    { type: 'wow', emoji: '😮', label: '¡Wow!', color: 'text-yellow-500' },
    { type: 'sad', emoji: '😢', label: 'Me entristece', color: 'text-yellow-600' },
    { type: 'angry', emoji: '😡', label: 'Me enoja', color: 'text-orange-600' },
    { type: 'surprised', emoji: '😄', label: 'Me sorprendió', color: 'text-yellow-500' },
    { type: 'shocked', emoji: '😮', label: 'No lo sabía', color: 'text-yellow-500' },
    { type: 'thinking', emoji: '🤔', label: 'Tengo dudas', color: 'text-gray-500' },
    { type: 'risky', emoji: '😬', label: 'Riesgoso', color: 'text-yellow-700' },
    { type: 'irrelevant', emoji: '🚫', label: 'No relevante', color: 'text-gray-400' },
];

const ReactionPicker = ({ onSelect, currentReaction, align = 'left' }) => {
    const positionClass = align === 'center'
        ? 'sm:left-1/2 sm:-translate-x-1/2'
        : (align === 'right' ? 'sm:right-0' : 'sm:left-0');

    const triangleClass = align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : (align === 'right' ? 'right-6' : 'left-6');

    return (
        <div className={`absolute bottom-full pb-8 left-0 ${positionClass} z-[200] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 w-[90vw] sm:w-auto`}>
            {/* Main Container: Horizontal Scroll on Mobile, Standard on Desktop */}
            <div className="bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-3xl sm:rounded-full p-1.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] flex items-center gap-1 overflow-x-auto sm:overflow-visible no-scrollbar px-4 sm:px-2 touch-pan-x">
                {REACTION_TYPES.map((r, index) => (
                    <button
                        key={r.type}
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(r.type);
                        }}
                        style={{
                            animationDelay: `${index * 40}ms`,
                        }}
                        className={`
                            group/item relative flex-shrink-0 p-4 sm:p-3 rounded-2xl sm:rounded-full transition-all duration-500 
                            hover:bg-primary-50 hover:scale-125 hover:z-20 active:scale-95
                            animate-in slide-in-from-right-4 fill-mode-both pointer-events-auto
                            ${currentReaction === r.type ? 'bg-primary-100 ring-2 ring-primary-500/30 scale-110 z-10' : ''}
                        `}
                        title={r.label}
                    >
                        <div className="flex flex-col items-center gap-1 sm:gap-0">
                            <span className="text-3xl sm:text-xl drop-shadow-sm filter saturate-150 transition-transform group-hover/item:rotate-12">
                                {r.emoji}
                            </span>
                            {/* Label visible only on mobile if you want, or keep it as tooltip */}
                            <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400 sm:hidden">
                                {r.label.split(' ')[0]}
                            </span>
                        </div>

                        {/* Tooltip for Desktop */}
                        <span className="absolute hidden sm:block left-1/2 -translate-x-1/2 -top-12 bg-gray-900 text-[9px] font-black uppercase tracking-widest text-white px-3 py-2 rounded-xl whitespace-nowrap shadow-xl opacity-0 scale-50 group-hover/item:opacity-100 group-hover/item:scale-100 transition-all pointer-events-none z-50">
                            {r.label}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Pointer triangle for Desktop */}
            <div className={`absolute top-full ${triangleClass} -mt-1.5 w-4 h-4 bg-white/95 border-r border-b border-gray-100 rotate-45 hidden sm:block`}></div>

            {/* Visual cue for mobile scrolling */}
            <div className="flex justify-center mt-2 sm:hidden">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></div>
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default ReactionPicker;
