import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CardWorkspace } from './components/CardWorkspace';
import { ChatInterface } from './components/ChatInterface';
import { Card } from '../types';
import { getCards, addCard, updateCard, deleteCard, moveCard } from '../services/cardService';

export default function App() {
  const [cards, setCards] = useState<Card[]>([]);

  const [isChatExpanded, setIsChatExpanded] = useState(false);

  useEffect(() => {
    getCards()
      .then(setCards)
      .catch((error) => console.error('Failed to load cards:', error));
  }, []);

  const handleAddCard = async () => {
    const newCardData = {
      content: '',
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 200 + 50,
      },
      size: { width: 300, height: 200 },
    };
    try {
      const newCard = await addCard(newCardData);
      setCards([...cards, newCard]);
    } catch (error) {
      console.error('Failed to add card:', error);
    }
  };

  const handleMoveCard = async (id: string, x: number, y: number) => {
    try {
      await moveCard(id, { x, y });
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, position: { x, y } } : card
        )
      );
    } catch (error) {
      console.error('Failed to move card:', error);
    }
  };

  const handleResizeCard = async (id: string, width: number, height: number) => {
    try {
      await updateCard(id, { size: { width, height } });
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, size: { width, height } } : card
        )
      );
    } catch (error) {
      console.error('Failed to resize card:', error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (error) {
      console.error('Failed to delete card:', error);
    }
  };

  const handleUpdateCardContent = async (id: string, content: string) => {
    try {
      await updateCard(id, { content });
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, content } : card
        )
      );
    } catch (error) {
      console.error('Failed to update card content:', error);
    }
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
