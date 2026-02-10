import { useDrop } from 'react-dnd';
import { IndexCard } from './IndexCard';
import { Plus } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface CardWorkspaceProps {
  cards: Card[];
  selectedCardId: string | null;
  onAddCard: () => void;
  onMoveCard: (id: string, x: number, y: number) => void;
  onResizeCard: (id: string, width: number, height: number) => void;
  onDeleteCard: (id: string) => void;
  onUpdateCardContent: (id: string, content: string) => void;
  onUpdateCardTitle: (id: string, title: string) => void;
  onSelectCard: (id: string | null) => void;
  onShowMessage?: (messageId: string) => void;
}

export function CardWorkspace({
  cards,
  selectedCardId,
  onAddCard,
  onMoveCard,
  onResizeCard,
  onDeleteCard,
  onUpdateCardContent,
  onUpdateCardTitle,
  onSelectCard,
  onShowMessage,
}: CardWorkspaceProps) {
  const [, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { id: string; position: { x: number; y: number } }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newX = Math.max(0, item.position.x + delta.x);
        const newY = Math.max(0, item.position.y + delta.y);
        onMoveCard(item.id, newX, newY);
      }
    },
  }));

  return (
    <div 
      ref={drop as any} 
      className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto"
      onClick={() => onSelectCard(null)}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Add Card Button */}
      <button
        onClick={onAddCard}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        <Plus className="w-4 h-4" />
        Add Card
      </button>

      {/* Cards */}
      {cards.map((card) => (
        <IndexCard
          key={card.id}
          id={card.id}
          title={card.title}
          content={card.content}
          position={card.position}
          size={card.size}
          messageId={card.messageId}
          isSelected={selectedCardId === card.id}
          onMove={onMoveCard}
          onResize={onResizeCard}
          onDelete={onDeleteCard}
          onContentChange={onUpdateCardContent}
          onTitleChange={onUpdateCardTitle}
          onSelect={() => onSelectCard(card.id)}
          onShowMessage={onShowMessage}
        />
      ))}
    </div>
  );
}
