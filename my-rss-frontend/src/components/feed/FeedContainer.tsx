import type { Item, Category } from '../../types';
import { GridView } from './GridView';
import { ListView } from './ListView';
import { ColumnView } from './ColumnView';
import type { ListDensity, GridDensity } from '../layout/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface FeedContainerProps {
    items: Item[];
    categories: Category[];
    viewMode: 'grid' | 'list' | 'columns';
    searchTerm: string;
    listDensity?: ListDensity;
    gridDensity?: GridDensity;
    isSplitView?: boolean;
    onPlay: (url: string) => void;
    selectedCategory: string | null;
    selectedSource: string | null;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
    contentType?: 'VIDEO' | 'SHORT' | 'LIVE' | 'ALL';
    unreadOnly?: boolean;
}

export function FeedContainer({
    items,
    categories,
    viewMode,
    searchTerm,
    listDensity = 'comfortable',
    gridDensity = 'standard',
    isSplitView = false,
    onPlay,
    selectedCategory,
    selectedSource,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    contentType = 'ALL',
    unreadOnly = false
}: FeedContainerProps) {

    const { ref, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage && fetchNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const renderContent = () => {
        switch (viewMode) {
            case 'columns':
                return (
                    <ColumnView
                        categories={categories}
                        searchTerm={searchTerm}
                        onPlay={onPlay}
                        selectedCategory={selectedCategory}
                        selectedSource={selectedSource}
                        contentType={contentType}
                        unreadOnly={unreadOnly}
                    />
                );
            case 'list':
                return <ListView items={items} density={listDensity} isSplitView={isSplitView} onPlay={onPlay} />;
            default:
                return <GridView items={items} density={gridDensity} onPlay={onPlay} />;
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="min-h-full flex flex-col"
            >
                {renderContent()}

                {viewMode !== 'columns' && (
                    <div ref={ref} className="w-full py-10 flex items-center justify-center min-h-[100px]">
                        {isFetchingNextPage ? (
                            <div className="flex flex-col items-center gap-2 text-dracula-purple">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
                                <span className="text-sm font-medium">Buscando mais vídeos...</span>
                            </div>
                        ) : hasNextPage ? (
                            <div className="h-4" />
                        ) : (
                            items.length > 0 && <span className="text-dracula-comment text-sm italic">Fim da lista.</span>
                        )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}