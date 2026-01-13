import { useState } from 'react';
import { X, Save, FolderPlus } from 'lucide-react';
import { api } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Category } from '../../types';

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export function AddCategoryModal({ isOpen, onClose, categories }: AddCategoryModalProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const isValid = name.trim() !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        try {
            setIsSubmitting(true);

            await api.post('/categories', {
                name,
                parentId: parentId || null
            });

            await queryClient.invalidateQueries({ queryKey: ['categories'] });

            setName('');
            setParentId('');
            onClose();
        } catch (error) {
            console.error("Erro ao adicionar categoria:", error);
            alert("Erro ao criar categoria.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dracula-bg border border-dracula-current rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">

                <div className="flex items-center justify-between p-4 border-b border-dracula-current">
                    <h2 className="font-bold text-dracula-purple text-lg flex items-center gap-2">
                        <FolderPlus size={20} />
                        Nova Pasta
                    </h2>
                    <button onClick={onClose} className="text-dracula-comment hover:text-dracula-red transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">

                    <div>
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-1">Nome da Categoria <span className="text-dracula-pink">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Tecnologia, Notícias..."
                            autoFocus
                            className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-1">Dentro de (Opcional)</label>
                        <select
                            value={parentId}
                            onChange={e => setParentId(e.target.value)}
                            className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple focus:outline-none transition-colors appearance-none"
                        >
                            <option value="">Nenhuma (Criar na Raiz)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded text-sm font-bold text-dracula-fg hover:bg-dracula-current transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-dracula-bg transition-all ${isValid && !isSubmitting
                                ? 'bg-dracula-purple hover:bg-dracula-purple/90 shadow-lg shadow-dracula-purple/20'
                                : 'bg-dracula-comment cursor-not-allowed opacity-50'
                                }`}
                        >
                            {isSubmitting ? 'Salvando...' : (
                                <>
                                    <Save size={16} />
                                    Criar Pasta
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}