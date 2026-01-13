import { type ReactNode } from 'react';

interface MainLayoutProps {
    sidebar: ReactNode;
    header: ReactNode;
    player: ReactNode;
    children: ReactNode;
    isSidebarOpen: boolean;
    onCloseSidebar?: () => void;
}

export function MainLayout({ sidebar, header, player, children, isSidebarOpen, onCloseSidebar }: MainLayoutProps) {
    return (
        <div className="flex h-screen bg-dracula-bg text-dracula-fg font-sans overflow-hidden relative">

            <div
                className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onCloseSidebar}
            />

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 h-full bg-dracula-bg border-r border-dracula-current shadow-2xl transition-all duration-300 ease-in-out
                    
                    w-64
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}

                    md:relative md:shadow-none md:translate-x-0 
                    
                    ${isSidebarOpen ? 'md:w-64' : 'md:w-0 md:border-none md:overflow-hidden'}
                `}
            >
                <div className="w-64 h-full overflow-hidden">
                    {sidebar}
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-dracula-bg overflow-hidden relative w-full">
                {header}

                <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar w-full">
                    {player}
                    <div className="p-4 md:p-6 pb-20 md:pb-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}