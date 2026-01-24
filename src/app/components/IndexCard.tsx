import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Resizable } from 're-resizable';
import { X, GripVertical, MessageCircle } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface IndexCardProps {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  messageId?: string;
  isSelected: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onContentChange: (id: string, content: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onSelect: () => void;
  onShowMessage?: (messageId: string) => void;
}

export function IndexCard({
  id,
  title,
  content,
  position,
  size,
  messageId,
  isSelected,
  onMove,
  onResize,
  onDelete,
  onContentChange,
  onTitleChange,
  onSelect,
  onShowMessage,
}: IndexCardProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'CARD',
    item: { id, position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Debounce content changes to reduce server calls
  const debouncedContentChange = useDebounce((newContent: string) => {
    onContentChange(id, newContent);
  }, 100);

  // Debounce title changes to reduce server calls
  const debouncedTitleChange = useDebounce((newTitle: string) => {
    onTitleChange(id, newTitle);
  }, 100);

  return (
    <div
      ref={dragPreview}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isSelected ? 10 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <Resizable
        size={{ width: size.width, height: size.height }}
        onResizeStop={(e, direction, ref, d) => {
          onResize(id, size.width + d.width, size.height + d.height);
        }}
        minWidth={200}
        minHeight={150}
        className={`bg-white rounded-lg shadow-lg border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
      >
        <div className="w-full h-full flex flex-col">
          <div
            ref={drag}
            className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-move"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <input
                value={title}
                onChange={(e) => debouncedTitleChange(e.target.value)}
                className="text-xs text-gray-500 bg-transparent border-none outline-none focus:outline-none"
                placeholder="Title"
              />
            </div>
            <div className="flex items-center gap-1">
              {messageId && onShowMessage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowMessage(messageId);
                  }}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="Show linked message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => debouncedContentChange(e.target.value)}
            className="flex-1 w-full p-3 resize-none focus:outline-none rounded-b-lg"
            placeholder="Type your notes here..."
          />
        </div>
      </Resizable>
    </div>
  );
}
