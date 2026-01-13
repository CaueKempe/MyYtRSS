import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FeedContainer } from './components/feed/FeedContainer';
import { TheaterPlayer } from './components/player/TheaterPlayer';
import { MainLayout } from './components/MainLayout';
import { useNavigation } from './hooks/useNavigation';
import { useFilterState, useFilterLogic } from './hooks/useFilteredItems';
import { useItems } from './hooks/useItems';
import { useAppPreferences } from './hooks/useAppPreferences';
import type { Item } from './types';
import { useInView } from 'react-intersection-observer';

function App() {
  const { categoriesTree, enrichItems, getCategoryFamilyIds } = useNavigation();
  const prefs = useAppPreferences();

  const filters = useFilterState();

  const {
    rawItems,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useItems({
    selectedCategory: filters.selectedCategory,
    selectedSource: filters.selectedSource,
    unreadOnly: filters.unreadOnly,
    searchTerm: filters.searchTerm,
    filterType: filters.filterType
  });

  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const enrichedItems = useMemo(() => (rawItems ? enrichItems(rawItems) : []), [rawItems, enrichItems]);

  const filteredItems = useFilterLogic(enrichedItems, getCategoryFamilyIds, filters);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [playingItem, setPlayingItem] = useState<Item | null>(null);

  const [isPlayerExpanded, setIsPlayerExpanded] = useState(true);

  const handlePlayVideo = (item: Item) => {
    setPlayingItem(item);
    setIsPlayerExpanded(true);
  };

  return (
    <MainLayout
      isSidebarOpen={isSidebarOpen}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      sidebar={
        <Sidebar
          onSelectCategory={(id) => {
            filters.setSelectedCategory(id);
            filters.setSelectedSource(null);
          }}
          onSelectSource={(id) => {
            filters.setSelectedSource(id);
            filters.setSelectedCategory(null);
          }}
        />
      }
      header={
        <Header
          {...filters}
          {...prefs}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onResetFilters={filters.resetFilters}
        />
      }
      player={
        <TheaterPlayer
          item={playingItem}
          isExpanded={isPlayerExpanded}
          onToggle={() => setIsPlayerExpanded(!isPlayerExpanded)}
          onClose={() => setPlayingItem(null)}
        />
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dracula-purple"></div>
        </div>
      ) : (
        <>
          <FeedContainer
            items={filteredItems}
            categories={categoriesTree}
            searchTerm={filters.searchTerm}
            selectedCategory={filters.selectedCategory}
            selectedSource={filters.selectedSource}
            contentType={filters.filterType}
            unreadOnly={filters.unreadOnly}
            onPlay={(url) => {
              const item = filteredItems.find(i => i.link === url);
              if (item) handlePlayVideo(item);
            }}
            {...prefs}
          />

          <div ref={ref} className="h-20 flex items-center justify-center w-full">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-dracula-purple">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                <span>Carregando mais itens...</span>
              </div>
            )}
            {!hasNextPage && rawItems.length > 0 && (
              <span className="text-dracula-comment text-sm">Fim da lista</span>
            )}
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default App;