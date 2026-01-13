import type { Item } from '../../types';
import { VideoCard } from './VideoCard';
import type { ListDensity } from '../layout/Header';
import { MotionContainer, MotionItem } from '../ui/MotionList';

interface ListViewProps {
    items: Item[];
    density: ListDensity;
    isSplitView?: boolean;
    onPlay?: (url: string) => void;
}

export function ListView({ items, density, isSplitView = false, onPlay }: ListViewProps) {
    const containerClass = isSplitView
        ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 items-start'
        : `flex flex-col w-full ${density === 'compact' ? 'gap-0' : 'gap-2'}`;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-dracula-comment italic">
                Nenhum vídeo encontrado.
            </div>
        );
    }

    const listKey = items.length > 0 ? `${items[0].id}-${items.length}` : 'empty';

    return (
        <MotionContainer
            key={listKey}
            className={containerClass}
            layout="position"
        >
            {items.map((item, index) => (
                <MotionItem
                    key={item.id}
                    className="w-full"
                    layout="position"
                >
                    <VideoCard
                        item={item}
                        mode="list"
                        listDensity={density}
                        index={index}
                        isSplitView={isSplitView}
                        onPlay={onPlay}
                    />
                </MotionItem>
            ))}
        </MotionContainer>
    );
}