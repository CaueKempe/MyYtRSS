import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, List, LayoutGrid, MonitorPlay } from 'lucide-react';
import { ColumnItemList } from '../ColumnUtils/ColumnItemList';

export function SourceColumn({
    source,
    index,
    currentDensity,
    toggleDensity,
    onPlay,
    contentType,
    unreadOnly,
    searchTerm
}: any) {
    const cardMode = currentDensity === 'standard' ? 'grid' : 'list';
    const cardListDensity = currentDensity === 'standard' ? undefined : 'compact';

    return (
        <Draggable draggableId={source.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex flex-col bg-dracula-current/5 border rounded-xl max-h-full w-[320px] shrink-0 overflow-hidden ${snapshot.isDragging ? 'z-50 border-dracula-cyan shadow-2xl scale-[1.02]' : 'border-dracula-current/50'
                        }`}
                    style={provided.draggableProps.style}
                >
                    <div className="p-3 border-b border-dracula-current flex justify-between items-center bg-dracula-cyan/5 shrink-0">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <div {...provided.dragHandleProps} className="p-1 hover:bg-dracula-current/50 rounded cursor-grab">
                                <GripVertical size={16} className="text-dracula-comment" />
                            </div>
                            <MonitorPlay size={14} className="text-dracula-cyan shrink-0" />
                            <h2 className="font-bold truncate uppercase text-[10px] tracking-widest text-dracula-cyan">
                                {source.name}
                            </h2>
                        </div>
                        <button onClick={() => toggleDensity(source.id)} className="text-dracula-comment hover:text-dracula-cyan p-1">
                            {currentDensity === 'standard' ? <List size={16} /> : <LayoutGrid size={16} />}
                        </button>
                    </div>

                    <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1 pb-6">
                        <ColumnItemList
                            sourceId={source.id}
                            mode={cardMode}
                            density={cardListDensity}
                            onPlay={onPlay}
                            contentType={contentType}
                            unreadOnly={unreadOnly}
                            searchTerm={searchTerm}
                        />
                    </div>
                </div>
            )}
        </Draggable>
    );
}