import { useState } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { ChevronDown, Plus, User, Check } from 'lucide-react';

export function ProfileSelector() {
    const { currentProfile, profiles, selectProfile, createProfile } = useProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAvatar, setNewAvatar] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;

        const avatar = newAvatar || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${newName}`;

        await createProfile(newName, avatar);
        setIsCreating(false);
        setNewName('');
        setIsOpen(false);
    };

    return (
        <div className="relative px-3 py-3 border-b border-dracula-current">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 w-full p-2 hover:bg-dracula-current rounded-lg transition-colors group"
            >
                <div className="w-10 h-10 rounded-full bg-dracula-purple flex items-center justify-center overflow-hidden border-2 border-dracula-current group-hover:border-dracula-purple">
                    {currentProfile?.avatar ? (
                        <img src={currentProfile.avatar} alt={currentProfile.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-dracula-bg" />
                    )}
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-dracula-comment font-bold uppercase">Perfil</p>
                    <p className="text-sm font-bold text-dracula-fg truncate">{currentProfile?.name || 'Selecione'}</p>
                </div>
                <ChevronDown size={16} className="text-dracula-comment" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-3 right-3 mt-2 bg-dracula-bg border border-dracula-current rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {!isCreating ? (
                        <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {profiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => selectProfile(profile)}
                                    className={`flex items-center gap-3 w-full p-2 rounded-lg mb-1 transition-colors ${currentProfile?.id === profile.id ? 'bg-dracula-purple/20 text-dracula-purple' : 'hover:bg-dracula-current text-dracula-fg'}`}
                                >
                                    <img src={profile.avatar || ''} className="w-8 h-8 rounded-full bg-black" />
                                    <span className="flex-1 text-sm font-bold text-left truncate">{profile.name}</span>
                                    {currentProfile?.id === profile.id && <Check size={16} />}
                                </button>
                            ))}
                            <button
                                onClick={() => setIsCreating(true)}
                                className="flex items-center justify-center gap-2 w-full p-2 mt-2 border border-dashed border-dracula-comment text-dracula-comment hover:text-dracula-green hover:border-dracula-green rounded-lg text-sm font-bold transition-all"
                            >
                                <Plus size={16} /> Novo Perfil
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleCreate} className="p-3 space-y-3">
                            <p className="text-xs font-bold text-dracula-purple text-center uppercase">Criar Perfil</p>
                            <input
                                autoFocus
                                placeholder="Nome do Perfil"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full bg-dracula-current/50 border border-dracula-current rounded p-2 text-sm text-dracula-fg focus:border-dracula-purple outline-none"
                            />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 p-2 rounded text-xs font-bold text-dracula-comment hover:bg-dracula-current">Voltar</button>
                                <button type="submit" disabled={!newName} className="flex-1 p-2 rounded text-xs font-bold bg-dracula-green text-dracula-bg hover:bg-dracula-green/90 disabled:opacity-50">Criar</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}