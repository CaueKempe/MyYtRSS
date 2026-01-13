import React, { useState } from 'react';
import { Folder, FolderOpen, Youtube, ChevronRight, ChevronDown, LayoutGrid, Plus, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { AddSourceModal } from '../sidebar/AddSourceModal';
import { AddCategoryModal } from '../sidebar/AddCategoryModal';
import { ProfileSelector } from '../sidebar/ProfileSelector';
import { EditCategoryModal } from '../sidebar/EditCategoryModal';
import { EditSourceModal } from '../sidebar/EditSourceModal';
import { DeleteConfirmModal } from '../sidebar/DeleteConfirmModal';
import type { Category, Source } from '../../types';

interface SidebarProps {
    onSelectSource: (id: string | null) => void;
    onSelectCategory: (id: string | null) => void;
}

export function Sidebar({ onSelectSource, onSelectCategory }: SidebarProps) {
    const { categoriesTree, categories, sources, isLoading } = useNavigation();
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSource, setEditingSource] = useState<Source | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ id: string, name: string, type: 'category' | 'source' } | null>(null);

    const toggleCategory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (isLoading) {
        return (
            <aside className="w-full bg-dracula-bg flex flex-col h-screen overflow-hidden border-r border-dracula-current">
                <ProfileSelector />
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dracula-purple"></div>
                    <span className="text-xs text-dracula-comment animate-pulse">Carregando...</span>
                </div>
            </aside>
        );
    }

    const CategoryItem = ({ category, level = 0 }: { category: Category, level?: number }) => {
        const isOpen = openCategories[category.id];
        const categorySources = sources.filter(s => s.categoryId === category.id);
        const hasChildren = (category.children && category.children.length > 0) || categorySources.length > 0;

        return (
            <div className="select-none">
                <div
                    className="group flex items-center gap-1 w-full p-2 text-sm hover:bg-dracula-current rounded text-dracula-fg cursor-pointer transition-colors relative"
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                    onClick={() => onSelectCategory(category.id)}
                >
                    <div
                        onClick={(e) => hasChildren && toggleCategory(category.id, e)}
                        className={`p-1 rounded hover:bg-dracula-comment/20 ${!hasChildren ? 'opacity-0' : ''}`}
                    >
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>

                    {isOpen ?
                        <FolderOpen size={16} className="text-dracula-yellow shrink-0" /> :
                        <Folder size={16} className="text-dracula-yellow shrink-0" />
                    }

                    <span className="truncate ml-1 font-medium flex-1">{category.name}</span>

                    <div className="hidden group-hover:flex items-center gap-1 mr-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setEditingCategory(category); }}
                            className="p-1 text-dracula-comment hover:text-dracula-cyan hover:bg-dracula-current rounded"
                            title="Editar"
                        >
                            <Pencil size={12} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setDeletingItem({ id: category.id, name: category.name, type: 'category' }); }}
                            className="p-1 text-dracula-comment hover:text-dracula-red hover:bg-dracula-current rounded"
                            title="Excluir"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="border-l border-dracula-current ml-4">
                        {category.children?.map(child => (
                            <CategoryItem key={child.id} category={child} level={level + 1} />
                        ))}

                        {categorySources.map(source => (
                            <div
                                key={source.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectSource(source.id);
                                }}
                                className="group flex items-center gap-2 w-full p-1.5 hover:text-dracula-pink text-dracula-fg/70 hover:bg-dracula-current/50 rounded transition-colors cursor-pointer"
                                style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }}
                            >
                                <Youtube size={12} className="shrink-0" />
                                <span className="truncate text-xs flex-1">{source.name}</span>

                                <div className="hidden group-hover:flex items-center gap-1 mr-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingSource(source); }}
                                        className="p-1 text-dracula-comment hover:text-dracula-cyan hover:bg-dracula-bg rounded"
                                        title="Editar Fonte"
                                    >
                                        <Pencil size={10} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeletingItem({ id: source.id, name: source.name, type: 'source' }); }}
                                        className="p-1 text-dracula-comment hover:text-dracula-red hover:bg-dracula-bg rounded"
                                        title="Excluir Fonte"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <aside className="w-full bg-dracula-bg flex flex-col h-screen overflow-hidden">
                <ProfileSelector />

                <div className="h-14 px-3 flex items-center gap-2 bg-dracula-bg z-10 shrink-0">
                    <button
                        onClick={() => setIsAddCategoryOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-dracula-current/30 hover:bg-dracula-current text-dracula-fg py-2 px-3 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-dracula-purple group"
                        title="Nova Pasta"
                    >
                        <FolderPlus size={16} className="text-dracula-yellow group-hover:text-dracula-purple transition-colors" />
                        Pasta
                    </button>

                    <button
                        onClick={() => setIsAddSourceOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 bg-dracula-current/30 hover:bg-dracula-current text-dracula-fg py-2 px-3 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-dracula-purple group"
                        title="Nova Fonte"
                    >
                        <Plus size={16} className="text-dracula-green group-hover:text-dracula-purple transition-colors" />
                        Fonte
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <button
                        onClick={() => { onSelectCategory(null); onSelectSource(null); }}
                        className="flex items-center gap-2 w-full p-2 text-sm hover:bg-dracula-current rounded text-dracula-fg transition-colors mb-4 font-bold"
                    >
                        <LayoutGrid size={16} className="text-dracula-cyan" />
                        Todos os Vídeos
                    </button>

                    <div className="space-y-0.5">
                        {categoriesTree.map(category => (
                            <CategoryItem key={category.id} category={category} />
                        ))}
                    </div>
                </nav>
            </aside>

            <AddSourceModal isOpen={isAddSourceOpen} onClose={() => setIsAddSourceOpen(false)} categories={categories} />
            <AddCategoryModal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} categories={categories} />

            <EditCategoryModal
                isOpen={!!editingCategory}
                onClose={() => setEditingCategory(null)}
                category={editingCategory}
                categories={categories}
            />
            <EditSourceModal
                isOpen={!!editingSource}
                onClose={() => setEditingSource(null)}
                source={editingSource}
                categories={categories}
            />
            <DeleteConfirmModal
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                item={deletingItem}
            />
        </>
    );
}