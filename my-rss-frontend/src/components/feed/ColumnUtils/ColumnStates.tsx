import { AlertTriangle } from 'lucide-react';

export const LoadingSpinner = () => (
    <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dracula-purple"></div>
    </div>
);

export const EmptyColumnsState = () => (
    <div className="flex flex-col h-full items-center justify-center text-dracula-comment p-10 text-center gap-4">
        <div className="bg-dracula-current/20 p-4 rounded-full">
            <AlertTriangle size={32} className="text-dracula-yellow" />
        </div>
        <p className="text-lg font-bold text-dracula-fg">Nenhum vídeo disponível.</p>
    </div>
);