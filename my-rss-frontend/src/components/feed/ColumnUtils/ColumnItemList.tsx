import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { VideoCard } from '../VideoCard';
import { MotionItem } from '../../ui/MotionList';
import { useInView } from 'react-intersection-observer';
import { useEffect, memo } from 'react';

interface ColumnItemListProps {
    sourceId?: string;
    categoryId?: string;
    mode: 'grid' | 'list';
    density?: any;
    onPlay: (url: string) => void;
    contentType: string;
    unreadOnly: boolean;
    searchTerm: string;
}

export const ColumnItemList = memo(({
    sourceId,
    categoryId,
    mode,
    density,
    onPlay,
    contentType,
    unreadOnly,
    searchTerm
}: ColumnItemListProps) => {
    const { ref, inView } = useInView();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['items', { sourceId, categoryId, contentType, unreadOnly, searchTerm }],
        queryFn: async ({ pageParam = null }) => {
            const params = new URLSearchParams();
            if (sourceId) params.append('sourceId', sourceId);
            if (categoryId) params.append('categoryId', categoryId);
            if (pageParam) params.append('cursor', pageParam);

            if (contentType !== 'ALL') params.append('type', contentType);
            if (unreadOnly) params.append('unreadOnly', 'true');
            if (searchTerm) params.append('search', searchTerm);

            params.append('limit', '30');

            const res = await api.get(`/items?${params.toString()}`);
            return res.data;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: null,
        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage]);

    const items = data?.pages.flatMap(page => page.items) ?? [];

    if (isLoading) return <div className="p-4 text-center text-dracula-comment animate-pulse text-xs">Carregando vídeos...</div>;

    return (
        <>
            {items.map((item, idx) => (
                <MotionItem
                    key={item.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                >
                    <VideoCard
                        item={item}
                        mode={mode}
                        listDensity={density}
                        isColumn={true}
                        index={idx}
                        onPlay={onPlay}
                    />
                </MotionItem>
            ))}

            <div ref={ref} className="h-10 flex items-center justify-center">
                {isFetchingNextPage && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dracula-purple" />
                )}
            </div>
        </>
    );
});