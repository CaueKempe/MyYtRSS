import { useState, useEffect } from 'react';
import { X, Save, FolderPen } from 'lucide-react';
import { api } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Category } from '../../types';

interface EditCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: Category | null;
    categories: Category[];
}

export function EditCategoryModal({ isOpen, onClose, category, categories }: EditCategoryModalProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (category) {
            setName(category.name);
            setParentId(category.parentId || '');
        }
    }, [category]);

    if (!isOpen || !category) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.patch(`/categories/${category.id}`, {
                name,
                parentId: parentId || null
            });
            await queryClient.invalidateQueries({ queryKey: ['categories'] });
            onClose();
        } catch (error) {
            console.error("Erro ao editar categoria:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validParents = categories.filter(c => c.id !== category.id);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dracula-bg border border-dracula-current rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-dracula-current">
                    <h2 className="font-bold text-dracula-purple text-lg flex items-center gap-2">
                        <FolderPen size={20} /> Editar Pasta
                    </h2>
                    <button onClick={onClose} className="text-dracula-comment hover:text-dracula-red transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-1">Nome</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-1">Mover para dentro de:</label>
                        <select
                            value={parentId}
                            onChange={e => setParentId(e.target.value)}
                            className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple outline-none"
                        >
                            <option value="">Raiz (Sem pai)</option>
                            {validParents.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm font-bold text-dracula-fg hover:bg-dracula-current">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 rounded text-sm font-bold bg-dracula-purple text-dracula-bg hover:bg-dracula-purple/90">
                            {isSubmitting ? 'Salvando...' : <><Save size={16} /> Salvar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}