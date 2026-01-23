import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Resizable } from 're-resizable';
import { X, GripVertical } from 'lucide-react';

interface IndexCardProps {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onContentChange: (id: string, content: string) => void;
  onTitleChange: (id: string, title: string) => void;
}

export function IndexCard({
  id,
  title,
  content,
  position,
  size,
  onMove,
  onResize,
  onDelete,
  onContentChange,
  onTitleChange,
}: IndexCardProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: 'CARD',
    item: { id, position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragPreview}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Resizable
        size={{ width: size.width, height: size.height }}
        onResizeStop={(e, direction, ref, d) => {
          onResize(id, size.width + d.width, size.height + d.height);
        }}
        minWidth={200}
        minHeight={150}
        className="bg-white rounded-lg shadow-lg border border-gray-200"
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
                onChange={(e) => onTitleChange(id, e.target.value)}
                className="text-xs text-gray-500 bg-transparent border-none outline-none focus:outline-none"
                placeholder="Title"
              />
            </div>
            <button
              onClick={() => onDelete(id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => onContentChange(id, e.target.value)}
            className="flex-1 w-full p-3 resize-none focus:outline-none rounded-b-lg"
            placeholder="Type your notes here..."
          />
        </div>
      </Resizable>
    </div>
  );
}
