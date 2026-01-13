import { useState } from 'react';
import { Search, Eye, LayoutGrid, List, ChevronDown, RefreshCw, Filter, ArrowUpDown, XCircle, AlignJustify, Menu, Rows, Grid3x3, Maximize, PanelLeftClose, Columns2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export type DateFilterType = 'ALL' | '7_DAYS' | '15_DAYS' | '30_DAYS' | 'CUSTOM';
export type ContentType = 'ALL' | 'VIDEO' | 'SHORT' | 'LIVE';
export type SortOrder = 'newest' | 'oldest';
export type ListDensity = 'compact' | 'cozy' | 'comfortable';
export type GridDensity = 'compact' | 'standard' | 'comfortable';

interface HeaderProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    unreadOnly: boolean;
    setUnreadOnly: (v: boolean) => void;
    viewMode: 'grid' | 'list' | 'columns';
    setViewMode: (v: 'grid' | 'list' | 'columns') => void;
    searchScope: 'title' | 'source';
    setSearchScope: (v: 'title' | 'source') => void;
    filterType: ContentType;
    setFilterType: (v: ContentType) => void;
    dateFilter: DateFilterType;
    setDateFilter: (v: DateFilterType) => void;
    customDateStart: string;
    setCustomDateStart: (v: string) => void;
    customDateEnd: string;
    setCustomDateEnd: (v: string) => void;
    sortOrder: SortOrder;
    setSortOrder: (v: SortOrder) => void;
    onResetFilters: () => void;
    listDensity: ListDensity;
    setListDensity: (v: ListDensity) => void;
    gridDensity: GridDensity;
    setGridDensity: (v: GridDensity) => void;
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isSplitView: boolean;
    toggleSplitView: () => void;
}

export function Header({
    searchTerm, setSearchTerm,
    unreadOnly, setUnreadOnly,
    viewMode, setViewMode,
    searchScope, setSearchScope,
    filterType, setFilterType,
    dateFilter, setDateFilter,
    sortOrder, setSortOrder,
    onResetFilters,
    listDensity, setListDensity,
    gridDensity, setGridDensity,
    isSidebarOpen, toggleSidebar,
    isSplitView, toggleSplitView
}: HeaderProps) {
    const queryClient = useQueryClient();
    const [isSyncing, setIsSyncing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = filterType !== 'VIDEO' || dateFilter !== 'ALL' || searchTerm !== '' || unreadOnly;

    const toggleFilters = () => setShowFilters(!showFilters);

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            await api.post('/sources/sync');
            await queryClient.invalidateQueries();
        } catch (error) { console.error(error); }
        finally { setTimeout(() => setIsSyncing(false), 1000); }
    };

    return (
        <div className="flex flex-col border-b border-dracula-current bg-dracula-bg z-20 shrink-0 relative transition-all">

            <header className="w-full h-14 flex items-center px-4 md:px-6 gap-3 justify-between bg-dracula-bg z-20 relative">

                <div className="flex items-center gap-2 min-w-fit">
                    <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg text-dracula-purple hover:bg-dracula-purple/20 transition-colors">
                        {isSidebarOpen ? <PanelLeftClose size={24} /> : <Menu size={24} />}
                    </button>

                    <button onClick={handleSync} disabled={isSyncing} className={`p-2 rounded-lg text-dracula-comment hover:text-dracula-cyan transition-all ${isSyncing ? 'animate-spin' : ''}`}>
                        <RefreshCw size={20} />
                    </button>

                    <div className="h-6 w-[1px] bg-dracula-current mx-1" />

                    <button
                        onClick={toggleFilters}
                        className={`p-2 rounded-lg border transition-all ${showFilters ? 'bg-dracula-purple text-dracula-bg border-dracula-purple shadow-[0_0_10px_rgba(189,147,249,0.3)]' : 'border-dracula-current text-dracula-comment hover:text-dracula-pink hover:border-dracula-pink'}`}
                        title="Filtros"
                    >
                        <Filter size={20} />
                    </button>
                </div>

                <div className="flex-1 max-w-xl mx-auto group h-9">
                    <div className="flex items-center bg-dracula-current border border-dracula-current rounded-full focus-within:border-dracula-purple transition-all overflow-hidden h-full">
                        <div className="relative border-r border-dracula-comment/20 h-full hidden sm:block">
                            <select value={searchScope} onChange={(e) => setSearchScope(e.target.value as 'title' | 'source')} className="appearance-none bg-transparent pl-3 pr-6 text-[10px] md:text-xs font-bold text-dracula-comment hover:text-dracula-purple cursor-pointer focus:outline-none h-full uppercase">
                                <option value="title" className="bg-dracula-bg">Título</option>
                                <option value="source" className="bg-dracula-bg">Fonte</option>
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-dracula-comment pointer-events-none" size={10} />
                        </div>
                        <div className="flex-1 relative h-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dracula-comment" size={16} />
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-full bg-transparent border-none pl-9 pr-8 text-sm focus:outline-none text-dracula-fg placeholder-dracula-comment/50"
                            />
                            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dracula-comment"><XCircle size={14} /></button>}
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3 min-w-fit justify-end">

                    {viewMode === 'list' && (
                        <>
                            <button onClick={toggleSplitView} className={`p-2 rounded-lg border transition-all ${isSplitView ? 'bg-dracula-pink text-dracula-bg border-dracula-pink' : 'border-dracula-current text-dracula-comment hover:text-dracula-pink'}`} title="Split View">
                                <Columns2 size={18} />
                            </button>
                            <div className="h-6 w-[1px] bg-dracula-current" />
                            <div className="flex bg-dracula-current rounded-lg p-1">
                                <button onClick={() => setListDensity('compact')} className={`p-1.5 rounded ${listDensity === 'compact' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><AlignJustify size={16} /></button>
                                <button onClick={() => setListDensity('cozy')} className={`p-1.5 rounded ${listDensity === 'cozy' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><Menu size={16} /></button>
                                <button onClick={() => setListDensity('comfortable')} className={`p-1.5 rounded ${listDensity === 'comfortable' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><Rows size={16} /></button>
                            </div>
                        </>
                    )}

                    {viewMode === 'grid' && (
                        <div className="flex bg-dracula-current rounded-lg p-1">
                            <button onClick={() => setGridDensity('compact')} className={`p-1.5 rounded ${gridDensity === 'compact' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><Grid3x3 size={16} /></button>
                            <button onClick={() => setGridDensity('standard')} className={`p-1.5 rounded ${gridDensity === 'standard' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><LayoutGrid size={16} /></button>
                            <button onClick={() => setGridDensity('comfortable')} className={`p-1.5 rounded ${gridDensity === 'comfortable' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><Maximize size={16} /></button>
                        </div>
                    )}

                    <div className="h-6 w-[1px] bg-dracula-current" />

                    <div className="flex bg-dracula-current rounded-lg p-1">
                        {(['grid', 'list', 'columns'] as const).map((mode) => (
                            <button key={mode} onClick={() => setViewMode(mode)} className={`p-1.5 rounded transition-colors ${viewMode === mode ? 'bg-dracula-purple text-dracula-bg' : 'text-dracula-fg hover:text-dracula-purple'}`}>
                                {mode === 'grid' && <LayoutGrid size={18} />}
                                {mode === 'list' && <List size={18} />}
                                {mode === 'columns' && <Columns2 size={18} />}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full bg-dracula-bg border-t border-dracula-current overflow-hidden"
                    >
                        <div className="p-4 flex flex-col gap-4">

                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                                {hasActiveFilters && (
                                    <button onClick={onResetFilters} className="flex items-center gap-1 bg-dracula-red/20 text-dracula-red px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap">
                                        <XCircle size={14} /> LIMPAR
                                    </button>
                                )}
                                <div className="flex bg-dracula-current rounded p-0.5">
                                    {(['ALL', 'VIDEO', 'SHORT', 'LIVE'] as const).map(type => (
                                        <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors whitespace-nowrap ${filterType === type ? 'bg-dracula-pink text-dracula-bg' : 'text-dracula-comment'}`}>
                                            {type === 'ALL' ? 'TODOS' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex md:hidden items-center justify-between gap-4 border-t border-dracula-current/30 pt-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-dracula-comment uppercase">Visualização:</span>
                                    <div className="flex bg-dracula-current rounded p-0.5">
                                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-dracula-purple text-dracula-bg' : 'text-dracula-fg'}`}><LayoutGrid size={16} /></button>
                                        <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-dracula-purple text-dracula-bg' : 'text-dracula-fg'}`}><List size={16} /></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-dracula-comment uppercase">Tamanho:</span>
                                    {viewMode === 'grid' ? (
                                        <div className="flex bg-dracula-current rounded p-0.5">
                                            <button onClick={() => setGridDensity('compact')} className={`p-2 rounded ${gridDensity === 'compact' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><Grid3x3 size={16} /></button>
                                            <button onClick={() => setGridDensity('standard')} className={`p-2 rounded ${gridDensity === 'standard' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><LayoutGrid size={16} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex bg-dracula-current rounded p-0.5">
                                            <button onClick={() => setListDensity('compact')} className={`p-2 rounded ${listDensity === 'compact' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><AlignJustify size={16} /></button>
                                            <button onClick={() => setListDensity('comfortable')} className={`p-2 rounded ${listDensity === 'comfortable' ? 'bg-dracula-cyan text-dracula-bg' : 'text-dracula-comment'}`}><Rows size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <div className="flex gap-2 w-full md:w-auto">
                                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)} className="flex-1 md:flex-none bg-dracula-bg border border-dracula-current text-sm text-dracula-fg rounded px-3 py-1.5 outline-none">
                                        <option value="ALL">Qualquer Data</option>
                                        <option value="7_DAYS">Últimos 7 dias</option>
                                        <option value="15_DAYS">Últimos 15 dias</option>
                                    </select>
                                    <button onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} className="flex items-center justify-center px-3 py-1.5 rounded border border-dracula-current text-xs font-bold text-dracula-fg">
                                        <ArrowUpDown size={16} />
                                    </button>
                                </div>
                                <div className="md:hidden">
                                    <button onClick={() => setUnreadOnly(!unreadOnly)} className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded border text-xs font-bold ${unreadOnly ? 'bg-dracula-green/20 border-dracula-green text-dracula-green' : 'border-dracula-current text-dracula-fg'}`}>
                                        <Eye size={14} /> {unreadOnly ? 'APENAS NÃO LIDOS' : 'MOSTRAR TODOS'}
                                    </button>
                                </div>
                                <div className="hidden md:block">
                                    <button onClick={() => setUnreadOnly(!unreadOnly)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold border ${unreadOnly ? 'bg-dracula-green/20 border-dracula-green text-dracula-green' : 'border-dracula-current text-dracula-fg'}`}>
                                        <Eye size={14} /> {unreadOnly ? 'NÃO LIDOS' : 'TODOS'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}