import type { Item } from '../../types';
import { VideoCard } from './VideoCard';
import type { GridDensity } from '../layout/Header';
import { MotionItem } from '../ui/MotionList';

interface GridViewProps {
    items: Item[];
    density: GridDensity;
    onPlay?: (url: string) => void;
}

export function GridView({ items, density, onPlay }: GridViewProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-dracula-comment italic">
                Nenhum vídeo encontrado.
            </div>
        );
    }

    let gridColsClass = '';
    switch (density) {
        case 'compact':
            gridColsClass = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
            break;
        case 'comfortable':
            gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';
            break;
        case 'standard':
        default:
            gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            break;
    }

    return (
        <div className={`grid ${gridColsClass} gap-6`}>
            {items.map((item) => (
                <MotionItem key={item.id}>
                    <VideoCard item={item} mode="grid" onPlay={onPlay} />
                </MotionItem>
            ))}
        </div>
    );
}