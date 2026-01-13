import { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube, { type YouTubeProps } from 'react-youtube';
import { api } from '../../lib/api';
import type { Item } from '../../types';

interface TheaterPlayerProps {
    item: Item | null;
    isExpanded: boolean;
    onToggle: () => void;
    onClose: () => void;
}

export function TheaterPlayer({ item, isExpanded, onToggle, onClose }: TheaterPlayerProps) {
    const playerRef = useRef<any>(null);
    const saveInterval = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (saveInterval.current) {
                window.clearInterval(saveInterval.current);
            }
        };
    }, []);

    if (!item) return null;

    const getVideoId = (url: string) => {
        try {
            if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
            if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
            return '';
        } catch (e) { return ''; }
    };

    const videoId = getVideoId(item.link);

    const handleReady: YouTubeProps['onReady'] = async (event) => {
        playerRef.current = event.target;
        const duration = Math.floor(event.target.getDuration());

        if (!item.duration || item.duration === 0) {
            console.log(`Salvando duração: ${duration}s`);
            await api.patch(`/items/${item.id}`, { duration });
        }
    };

    const saveProgress = async () => {
        if (!playerRef.current) return;

        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        const duration = Math.floor(playerRef.current.getDuration());

        const isFinished = duration > 0 && currentTime >= (duration - 15);

        await api.patch(`/items/${item.id}/status`, {
            playProgress: currentTime,
            isRead: isFinished
        });
    };

    const handleStateChange: YouTubeProps['onStateChange'] = (event) => {
        if (event.data === 1) {
            if (!saveInterval.current) {
                saveInterval.current = window.setInterval(saveProgress, 10000);
            }
        } else {
            if (saveInterval.current) {
                window.clearInterval(saveInterval.current);
                saveInterval.current = null;
            }
            saveProgress();
        }
    };

    const savedProgress = item.statuses && item.statuses.length > 0 ? item.statuses[0].playProgress : 0;

    const opts: YouTubeProps['opts'] = {
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            start: savedProgress
        },
    };

    return (
        <div className="w-full flex flex-col items-center bg-dracula-bg border-b border-dracula-current z-30 relative">
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full bg-black flex justify-center overflow-hidden"
                    >
                        <div className="w-full max-w-5xl aspect-video relative group">
                            <YouTube
                                videoId={videoId}
                                opts={opts}
                                onReady={handleReady}
                                onStateChange={handleStateChange}
                                className="w-full h-full absolute inset-0"
                            />

                            <button
                                onClick={onClose}
                                className="absolute top-2 left-1/2 p-2 bg-black/50 text-white/50 hover:text-dracula-red opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full relative flex justify-center items-center h-6 bg-dracula-bg">
                <button
                    onClick={onToggle}
                    className="absolute -top-4 w-10 h-10 rounded-full bg-dracula-bg border-2 border-dracula-purple text-dracula-purple hover:bg-dracula-purple hover:text-dracula-bg transition-all flex items-center justify-center shadow-lg z-20"
                >
                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
            </div>
        </div>
    );
}