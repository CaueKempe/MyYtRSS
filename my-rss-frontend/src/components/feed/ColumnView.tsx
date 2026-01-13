import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { motion, type Variants } from 'framer-motion';

import type { Category } from '../../types';

import { usePreferences } from '../../hooks/usePreferences';
import { useNavigation } from '../../hooks/useNavigation';
import { useColumnLogic } from '../../hooks/useColumnLogic';

import { CategoryColumn } from './ColumnUtils/CategoryColumn';
import { LoadingSpinner, EmptyColumnsState } from './ColumnUtils/ColumnStates';
import { SourceColumn } from './ColumnUtils/SourceColumn';

type ColumnDensity = 'standard' | 'compact';

interface ColumnViewProps {
    categories: Category[];
    searchTerm: string;
    onPlay: (url: string) => void;
    selectedCategory: string | null;
    selectedSource: string | null;
    contentType?: string;
    unreadOnly?: boolean;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

export function ColumnView({
    categories,
    onPlay,
    selectedCategory,
    selectedSource,
    searchTerm,
    contentType = 'ALL',
    unreadOnly = false
}: ColumnViewProps) {
    const { sources, isLoading: isLoadingNav } = useNavigation();
    const { preferences: savedOrder, savePreferences: saveOrder } = usePreferences<string[]>('column_order');
    const { preferences: savedDensities, savePreferences: saveDensities } = usePreferences<Record<string, ColumnDensity>>('column_densities');

    const [orderedCategoryIds, setOrderedCategoryIds] = useState<string[]>([]);
    const [columnDensities, setColumnDensities] = useState<Record<string, ColumnDensity>>({});

    useEffect(() => { if (savedOrder) setOrderedCategoryIds(savedOrder); }, [savedOrder]);
    useEffect(() => { if (savedDensities) setColumnDensities(savedDensities); }, [savedDensities]);

    const processedColumns = useColumnLogic(
        categories,
        sources,
        [],
        selectedCategory,
        selectedSource,
    );

    const visibleColumns = useMemo(() => {
        if (orderedCategoryIds.length === 0) return processedColumns;
        return [...processedColumns].sort((a, b) => {
            const indexA = orderedCategoryIds.indexOf(a.id);
            const indexB = orderedCategoryIds.indexOf(b.id);
            return (indexA === -1 ? 1 : indexB === -1 ? -1 : indexA - indexB);
        });
    }, [processedColumns, orderedCategoryIds]);

    const toggleColumnDensity = (columnId: string) => {
        const current = columnDensities[columnId] || 'standard';
        const newDensity: ColumnDensity = current === 'standard' ? 'compact' : 'standard';
        const updated = { ...columnDensities, [columnId]: newDensity };
        setColumnDensities(updated);
        saveDensities(updated);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newOrder = Array.from(visibleColumns);
        const [moved] = newOrder.splice(result.source.index, 1);
        newOrder.splice(result.destination.index, 0, moved);
        const ids = newOrder.map(c => c.id);
        setOrderedCategoryIds(ids);
        saveOrder(ids);
    };

    if (isLoadingNav) return <LoadingSpinner />;
    if (visibleColumns.length === 0) return <EmptyColumnsState />;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                {(provided) => (
                    <div
                        className="h-full w-full overflow-x-auto pb-2 [transform:rotateX(180deg)] custom-scrollbar"
                    >
                        <motion.div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="flex gap-4 items-start h-full w-full min-w-fit flex-nowrap [transform:rotateX(180deg)] px-4"
                        >
                            {visibleColumns.map((col, index) => {
                                const columnWrapperClass = "shrink-0 w-80 h-full";

                                if ('source' in col) {
                                    return (
                                        <div key={col.id} className={columnWrapperClass}>
                                            <SourceColumn
                                                source={col.source}
                                                index={index}
                                                currentDensity={columnDensities[col.id] || 'standard'}
                                                toggleDensity={toggleColumnDensity}
                                                onPlay={onPlay}
                                                contentType={contentType}
                                                unreadOnly={unreadOnly}
                                                searchTerm={searchTerm}
                                            />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={col.id} className={columnWrapperClass}>
                                        <CategoryColumn
                                            cat={{ id: col.id, name: (col as any).name }}
                                            index={index}
                                            currentDensity={columnDensities[col.id] || 'standard'}
                                            toggleDensity={toggleColumnDensity}
                                            onPlay={onPlay}
                                            contentType={contentType}
                                            unreadOnly={unreadOnly}
                                            searchTerm={searchTerm}
                                        />
                                    </div>
                                );
                            })}
                            {provided.placeholder}
                        </motion.div>
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}