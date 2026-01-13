import { useState } from 'react';
import { X, Save, Video, Clapperboard, Radio } from 'lucide-react';
import { api } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Category } from '../../types';

interface AddSourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export function AddSourceModal({ isOpen, onClose, categories }: AddSourceModalProps) {
    const queryClient = useQueryClient();
    const [url, setUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [wantVideos, setWantVideos] = useState(true);
    const [wantShorts, setWantShorts] = useState(false);
    const [wantLives, setWantLives] = useState(true);

    if (!isOpen) return null;

    const isValid = url.trim() !== '' && categoryId.trim() !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        try {
            setIsSubmitting(true);

            await api.post('/sources', {
                name: name || 'Nova Fonte',
                url,
                categoryId,
                type: 'YOUTUBE',
                wantVideos,
                wantShorts,
                wantLives
            });

            await queryClient.invalidateQueries({ queryKey: ['sources'] });

            setUrl('');
            setName('');
            setCategoryId('');
            setWantVideos(true);
            setWantShorts(false);
            setWantLives(true);
            onClose();
        } catch (error) {
            console.error("Erro ao adicionar fonte:", error);
            alert("Erro ao adicionar fonte.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-dracula-bg border border-dracula-current rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">

                <div className="flex items-center justify-between p-4 border-b border-dracula-current">
                    <h2 className="font-bold text-dracula-purple text-lg">Adicionar Nova Fonte</h2>
                    <button onClick={onClose} className="text-dracula-comment hover:text-dracula-red transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-1">Nome da Fonte</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: Canal do YouTube"
                            className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-1">URL do Canal <span className="text-dracula-pink">*</span></label>
                        <input
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/@..."
                            className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-1">Categoria <span className="text-dracula-pink">*</span></label>
                        <select
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple focus:outline-none transition-colors"
                        >
                            <option value="">Selecione uma pasta...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-dracula-comment uppercase mb-3">O que você quer receber?</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setWantVideos(!wantVideos)}
                                className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${wantVideos ? 'bg-dracula-purple/20 border-dracula-purple text-dracula-purple' : 'bg-dracula-current/20 border-dracula-current text-dracula-comment'}`}
                            >
                                <Video size={18} />
                                <span className="text-[10px] font-bold">VÍDEOS</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setWantShorts(!wantShorts)}
                                className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${wantShorts ? 'bg-dracula-pink/20 border-dracula-pink text-dracula-pink' : 'bg-dracula-current/20 border-dracula-current text-dracula-comment'}`}
                            >
                                <Clapperboard size={18} />
                                <span className="text-[10px] font-bold">SHORTS</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setWantLives(!wantLives)}
                                className={`flex flex-col items-center gap-2 p-2 rounded-lg border transition-all ${wantLives ? 'bg-dracula-cyan/20 border-dracula-cyan text-dracula-cyan' : 'bg-dracula-current/20 border-dracula-current text-dracula-comment'}`}
                            >
                                <Radio size={18} />
                                <span className="text-[10px] font-bold">LIVES</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm font-bold text-dracula-fg hover:bg-dracula-current transition-colors">Cancelar</button>
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold text-dracula-bg transition-all ${isValid && !isSubmitting ? 'bg-dracula-purple hover:bg-dracula-purple/90' : 'bg-dracula-comment cursor-not-allowed opacity-50'}`}
                        >
                            {isSubmitting ? 'Salvando...' : <><Save size={16} /> Adicionar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}