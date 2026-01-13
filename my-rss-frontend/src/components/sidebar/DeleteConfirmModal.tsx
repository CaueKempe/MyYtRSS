import { X, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: { id: string; name: string; type: 'category' | 'source' } | null;
}

export function DeleteConfirmModal({ isOpen, onClose, item }: DeleteConfirmModalProps) {
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen || !item) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const endpoint = item.type === 'category' ? '/categories' : '/sources';
            await api.delete(`${endpoint}/${item.id}`);

            await queryClient.invalidateQueries({ queryKey: ['categories'] });
            await queryClient.invalidateQueries({ queryKey: ['sources'] });
            await queryClient.invalidateQueries({ queryKey: ['items'] });

            onClose();
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao excluir. Verifique se a categoria não tem itens.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dracula-bg border border-dracula-red rounded-xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-dracula-red/20 flex items-center justify-center mb-4 text-dracula-red">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-dracula-fg mb-2">Excluir {item.type === 'category' ? 'Pasta' : 'Fonte'}?</h3>
                    <p className="text-sm text-dracula-comment mb-6">
                        Você tem certeza que deseja excluir <strong>"{item.name}"</strong>?
                        {item.type === 'category' && <span className="block mt-1 text-dracula-red text-xs">Isso pode excluir ou ocultar fontes dentro dela!</span>}
                    </p>

                    <div className="flex w-full gap-3">
                        <button onClick={onClose} className="flex-1 py-2 rounded font-bold text-dracula-fg bg-dracula-current hover:bg-dracula-current/80">Cancelar</button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 py-2 rounded font-bold text-dracula-bg bg-dracula-red hover:bg-dracula-red/90 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? 'Excluindo...' : <><Trash2 size={16} /> Excluir</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}