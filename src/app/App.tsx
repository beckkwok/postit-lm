import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CardWorkspace } from './components/CardWorkspace';
import { ChatInterface } from './components/ChatInterface';

interface Card {
  id: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export default function App() {
  const [cards, setCards] = useState<Card[]>([
    {
      id: '1',
      content: 'Welcome to the Index Card System!\n\nThis is your first card. You can:\n- Drag me around\n- Resize me\n- Edit my content\n- Delete me',
      position: { x: 50, y: 50 },
      size: { width: 300, height: 200 },
    },
    {
      id: '2',
      content: 'Try adding new cards using the button in the top right!',
      position: { x: 400, y: 100 },
      size: { width: 280, height: 150 },
    },
  ]);

  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const handleAddCard = () => {
    const newCard: Card = {
      id: Date.now().toString(),
      content: '',
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
      },
      size: { width: 300, height: 200 },
    };
    setCards([...cards, newCard]);
  };

  const handleMoveCard = (id: string, x: number, y: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, position: { x, y } } : card
      )
    );
  };

  const handleResizeCard = (id: string, width: number, height: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, size: { width, height } } : card
      )
    );
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const handleUpdateCardContent = (id: string, content: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, content } : card
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-900">
        {/* Workspace Area */}
        <div
          className={`transition-all duration-300 ${
            isChatExpanded ? 'h-1/3' : 'flex-1'
          }`}
        >
          <CardWorkspace
            cards={cards}
            onAddCard={handleAddCard}
            onMoveCard={handleMoveCard}
            onResizeCard={handleResizeCard}
            onDeleteCard={handleDeleteCard}
            onUpdateCardContent={handleUpdateCardContent}
          />
        </div>

        {/* Chat Area */}
        <div
          className={`transition-all duration-300 ${
            isChatExpanded ? 'flex-1' : 'h-80'
          }`}
        >
          <ChatInterface
            isExpanded={isChatExpanded}
            onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
          />
        </div>
      </div>
    </DndProvider>
  );
}
