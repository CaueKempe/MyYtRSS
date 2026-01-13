import { Play, Calendar, CheckCircle, ExternalLink } from 'lucide-react';
import type { Item } from '../../types';
import type { ListDensity } from '../layout/Header';

interface VideoCardProps {
    item: Item;
    mode: 'grid' | 'list';
    listDensity?: ListDensity;
    isColumn?: boolean;
    index?: number;
    isSplitView?: boolean;
    onPlay?: (url: string) => void;
}

export function VideoCard({ item, mode, listDensity = 'comfortable', isColumn = false, index = 0, isSplitView = false, onPlay }: VideoCardProps) {
    const stripHtml = (html?: string) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const cleanDescription = stripHtml(item.description);

    const handleClick = (e: React.MouseEvent) => {
        if (onPlay && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            onPlay(item.link);
        }
    };

    // --- MODO GRID ---
    if (mode === 'grid') {
        const imageContainerClass = isColumn ? 'h-32' : 'aspect-video';

        return (
            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group cursor-pointer"
                onClick={handleClick}
            >
                <div className={`relative rounded-xl overflow-hidden border border-dracula-current ${imageContainerClass} mb-3 w-full`}>
                    <img
                        src={item.thumbnail || '/placeholder.png'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/282a36/bd93f9?text=No+Image'; }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="fill-dracula-fg text-dracula-fg" size={isColumn ? 32 : 40} />
                    </div>
                    {item.isRead && (
                        <div className="absolute top-2 right-2 bg-dracula-bg/90 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-dracula-green border border-dracula-green/30 backdrop-blur-sm z-10">
                            Visto
                        </div>
                    )}
                </div>
                <div>
                    <h3 className={`font-bold leading-tight line-clamp-2 group-hover:text-dracula-pink transition-colors ${isColumn ? 'text-sm' : 'text-base'}`}>
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[10px] text-dracula-comment uppercase font-mono font-bold truncate">
                            {item.source?.name}
                        </p>
                        <span className="text-[10px] text-dracula-comment">•</span>
                        <p className="text-[10px] text-dracula-comment font-mono">
                            {new Date(item.pubDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </a>
        );
    }

    // --- MODO LIST: COMPACTO (Zig-Zag) ---
    const shouldReverse = !isColumn && (index % 2 !== 0) && isSplitView;

    if (listDensity === 'compact') {
        return (
            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className={`flex gap-3 px-3 py-2.5 items-start border-b border-dracula-current/30 hover:bg-dracula-current/20 transition-colors group ${shouldReverse ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
            >
                <div className="relative h-10 w-16 shrink-0 rounded overflow-hidden bg-black mt-0.5">
                    <img src={item.thumbnail || '/placeholder.png'} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/282a36/bd93f9?text=No+Image'; }} />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h3 className={`text-xs font-bold leading-tight group-hover:text-dracula-pink line-clamp-2 ${item.isRead ? 'opacity-60' : 'text-dracula-fg'}`}>
                        {item.title}
                    </h3>
                    <div className={`flex items-center gap-2 text-[10px] leading-none ${shouldReverse ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className={`font-bold uppercase tracking-wide shrink-0 truncate max-w-[120px] ${item.isRead ? 'text-dracula-comment' : 'text-dracula-cyan'}`}>
                            {item.source?.name}
                        </span>
                        <span className="text-dracula-comment">•</span>
                        <span className="text-dracula-comment font-mono shrink-0">
                            {new Date(item.pubDate).toLocaleDateString()}
                        </span>
                        {item.isRead && (<span className={`text-dracula-green font-bold ${shouldReverse ? 'mr-auto' : 'ml-auto'}`}>LIDO</span>)}
                    </div>
                </div>
            </a>
        );
    }

    // --- MODO LIST: COZY (Zig-Zag) ---
    if (listDensity === 'cozy') {
        return (
            <a href={item.link} onClick={handleClick} target="_blank" rel="noopener noreferrer" className={`flex gap-4 p-3 rounded-lg border border-transparent hover:border-dracula-purple/50 hover:bg-dracula-current/10 transition-all group items-center ${shouldReverse ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                <div className="relative w-40 aspect-video shrink-0 rounded-md overflow-hidden bg-black">
                    <img src={item.thumbnail || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className={`flex items-center gap-2 text-xs ${shouldReverse ? 'justify-end' : 'justify-start'}`}>
                        <span className={`font-bold uppercase ${item.isRead ? 'text-dracula-comment' : 'text-dracula-cyan'}`}>{item.source?.name}</span>
                        <span className="text-dracula-comment">•</span>
                        <span className="text-dracula-comment">{new Date(item.pubDate).toLocaleDateString()}</span>
                    </div>
                    <h3 className={`text-base font-bold leading-tight group-hover:text-dracula-pink truncate ${item.isRead ? 'opacity-60' : ''}`}>{item.title}</h3>
                    <p className="text-xs text-dracula-comment/70 truncate">{cleanDescription}</p>
                </div>
            </a>
        );
    }

    // --- MODO LIST: GRANDE (Padrão) ---
    return (
        <a href={item.link} onClick={handleClick} target="_blank" rel="noopener noreferrer" className="flex gap-4 p-4 rounded-xl border border-transparent hover:border-dracula-purple hover:bg-dracula-current/10 transition-all group relative items-start">
            <div className="relative w-64 aspect-video shrink-0 rounded-lg overflow-hidden border border-dracula-current/50 bg-black">
                <img src={item.thumbnail || '/placeholder.png'} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/282a36/bd93f9?text=No+Image'; }} />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 rounded font-mono">{item.type === 'SHORT' ? 'SHORT' : 'VIDEO'}</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"><div className="bg-dracula-bg/80 p-2 rounded-full backdrop-blur-sm"><Play size={20} className="fill-dracula-fg text-dracula-fg ml-0.5" /></div></div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col h-full gap-2">
                <div className="flex items-center gap-2 text-xs text-dracula-comment">
                    <span className={`font-bold uppercase tracking-wider ${item.isRead ? 'text-dracula-comment' : 'text-dracula-cyan'}`}>{item.source?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date(item.pubDate).toLocaleDateString()}</span>
                    {item.isRead && (<span className="ml-auto flex items-center gap-1 text-dracula-green font-bold bg-dracula-green/10 px-2 rounded-full"><CheckCircle size={12} /> LIDO</span>)}
                </div>
                <h3 className={`text-lg font-bold leading-tight group-hover:text-dracula-purple transition-colors ${item.isRead ? 'opacity-60' : ''}`}>{item.title}</h3>
                <p className="text-sm text-dracula-comment/80 line-clamp-2 leading-relaxed">{cleanDescription || "Sem descrição."}</p>
                <div className="mt-auto pt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-dracula-pink"><span>Assistir agora</span><ExternalLink size={12} /></div>
            </div>
        </a>
    );
}